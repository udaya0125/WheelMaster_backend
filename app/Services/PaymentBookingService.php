<?php

namespace App\Services;

use App\Exceptions\BookingConflictException;
use App\Mail\CartReservationsCreated;
use App\Mail\ReservationCreated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\PaymentIntent;
use App\Models\PaymentReservation;
use App\Models\Price;
use App\Models\SlotHold;
use App\Models\TimeSlot;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentBookingService
{
    private const BOOKING_BUFFER_MINUTES = 20;

    public function createIntentFromRequest(Request $request): PaymentIntent
    {
        $type = $this->bookingType($request);
        $validated = $this->validatePaymentRequest($request, $type);
        $slotHoldService = new SlotHoldService();

        return DB::transaction(function () use ($validated, $type, $slotHoldService) {
            $slotHoldService->releaseExpired();

            $preparedItems = $this->prepareItems($validated, $type, $slotHoldService);
            $holdToken = null;

            foreach ($preparedItems as $item) {
                $holdToken = $slotHoldService->acquire(
                    $item['reservation_date'],
                    $item['hold_start'],
                    $item['hold_end'],
                    $holdToken,
                    (int) config('services.onlinepay.hold_minutes', 30)
                );
            }

            $amountCents = collect($preparedItems)->sum('amount_cents');

            if ($amountCents <= 0) {
                throw ValidationException::withMessages([
                    'payment' => 'The selected package cannot be paid online.',
                ]);
            }

            $intent = PaymentIntent::create([
                'uuid' => (string) Str::uuid(),
                'status' => 'created',
                'amount_cents' => $amountCents,
                'currency' => config('services.onlinepay.currency', 'AUD'),
                'merchant_reference' => 'WMDA-'.Str::upper(Str::random(20)),
                'hold_token' => $holdToken,
                'customer_name' => $validated['user_name'],
                'customer_email' => $validated['email'],
                'customer_phone' => $validated['phone'] ?? null,
                'customer_snapshot' => $this->customerSnapshot($validated),
                'booking_payload' => [
                    'booking_type' => $type,
                    'request' => $this->safeBookingPayload($validated),
                ],
                'expires_at' => now()->addMinutes((int) config('services.onlinepay.hold_minutes', 30)),
            ]);

            foreach ($preparedItems as $item) {
                $intent->items()->create([
                    'price_id' => $item['price']->id,
                    'item_type' => $item['item_type'],
                    'reservation_date' => $item['reservation_date'],
                    'start_time' => $item['start']->format('H:i:s'),
                    'end_time' => $item['end']->format('H:i:s'),
                    'test_time' => $item['test_time'] ?? null,
                    'test_location' => $item['test_location'] ?? null,
                    'package_type' => $item['package_type'],
                    'amount_cents' => $item['amount_cents'],
                    'package_snapshot' => [
                        'description' => $item['price']->description,
                        'price' => $item['price']->price,
                        'duration' => isset($item['duration_minutes'])
                            ? $item['duration_minutes'].' minutes'
                            : $item['price']->duration,
                        'category' => $item['price']->category,
                    ],
                    'metadata' => $item['metadata'] ?? null,
                ]);
            }

            return $intent->load('items');
        }, 3);
    }

    public function failIntent(PaymentIntent $intent, string $status = 'failed'): void
    {
        DB::transaction(function () use ($intent, $status) {
            $intent = PaymentIntent::whereKey($intent->id)->lockForUpdate()->first();

            if (! $intent || $intent->status === 'paid') {
                return;
            }

            $intent->update([
                'status' => $status,
                'failed_at' => now(),
            ]);

            if ($intent->hold_token) {
                (new SlotHoldService())->releaseToken($intent->hold_token);
            }
        });
    }

    public function finalizeSuccessfulPayment(PaymentIntent $intent): Collection
    {
        $reservations = DB::transaction(function () use ($intent) {
            $intent = PaymentIntent::with('items')
                ->whereKey($intent->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($intent->status === 'paid' && $intent->reservations()->exists()) {
                return $intent->reservations()->with('price')->get();
            }

            if ($conflict = $this->firstFinalizationConflict($intent)) {
                $intent->update([
                    'status' => 'paid_unbooked',
                    'paid_at' => now(),
                ]);

                if ($intent->hold_token) {
                    (new SlotHoldService())->releaseToken($intent->hold_token);
                }

                Log::warning('Paid booking could not be finalized because the slot is no longer available.', [
                    'payment_intent_id' => $intent->id,
                    'reason' => $conflict,
                ]);

                return collect();
            }

            $created = collect();
            $customer = $intent->customer_snapshot ?? [];

            foreach ($intent->items as $item) {
                $reservation = UserReservation::create([
                    'user_name' => $intent->customer_name,
                    'email' => $intent->customer_email,
                    'phone' => $intent->customer_phone,
                    'address' => $customer['address'] ?? '',
                    'pickup_location' => $customer['pickup_location'] ?? null,
                    'dropoff_location' => $customer['dropoff_location'] ?? null,
                    'reservation_date' => Carbon::parse($item->reservation_date)->format('Y-m-d'),
                    'start_time' => Carbon::parse($item->start_time)->format('H:i:s'),
                    'end_time' => Carbon::parse($item->end_time)->format('H:i:s'),
                    'price_id' => $item->price_id,
                    'package_type' => $item->package_type,
                    'test_time' => $item->test_time,
                    'test_location' => $item->test_location,
                    'status' => 'Accepted',
                    'comment' => $customer['comment'] ?? null,
                ]);

                PaymentReservation::create([
                    'payment_intent_id' => $intent->id,
                    'user_reservation_id' => $reservation->id,
                ]);

                $created->push($reservation->load('price'));
            }

            $intent->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            if ($intent->hold_token) {
                (new SlotHoldService())->releaseToken($intent->hold_token);
            }

            Notification::create([
                'message' => "Paid booking confirmed for {$intent->customer_name} ({$created->count()} lesson".($created->count() === 1 ? '' : 's').')',
                'is_read' => false,
            ]);

            return $created;
        }, 3);

        if ($reservations->isNotEmpty()) {
            $this->sendConfirmationEmails($reservations, $intent);
        }

        return $reservations;
    }

    private function bookingType(Request $request): string
    {
        if (in_array($request->input('booking_type'), ['lesson', 'cart', 'test'], true)) {
            return $request->input('booking_type');
        }

        if ($request->filled('items')) {
            return 'cart';
        }

        return $request->filled('test_time') || $request->filled('test_location') ? 'test' : 'lesson';
    }

    private function validatePaymentRequest(Request $request, string $type): array
    {
        $base = [
            'booking_type' => 'nullable|in:lesson,cart,test',
            'user_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'pickup_location' => 'required|string|max:255',
            'dropoff_location' => 'required|string|max:255',
            'comment' => 'nullable|string',
            'accepted_terms' => 'accepted',
        ];

        $rules = match ($type) {
            'cart' => [
                'items' => 'required|array|min:1|max:20',
                'items.*.price_id' => 'required|exists:prices,id',
                'items.*.reservation_date' => 'required|date',
                'items.*.start_time' => 'required',
                'items.*.duration_minutes' => 'nullable|integer|in:60,120',
            ],
            'test' => [
                'reservation_date' => 'required|date',
                'price_id' => 'required|exists:prices,id',
                'duration_minutes' => 'required|integer|min:30',
                'test_time' => 'required|date_format:H:i',
                'test_location' => 'required|string|max:255',
                'test_type' => 'nullable|string|max:255',
            ],
            default => [
                'reservation_date' => 'required|date',
                'price_id' => 'required|exists:prices,id',
                'start_time' => 'required',
            ],
        };

        return $request->validate(array_merge($base, $rules));
    }

    private function prepareItems(array $validated, string $type, SlotHoldService $slotHoldService): array
    {
        return match ($type) {
            'cart' => $this->prepareCartItems($validated, $slotHoldService),
            'test' => [$this->prepareTestItem($validated, $slotHoldService)],
            default => [$this->prepareLessonItem($validated, $slotHoldService)],
        };
    }

    private function prepareCartItems(array $validated, SlotHoldService $slotHoldService): array
    {
        $prepared = [];
        $errors = [];
        $seen = [];

        foreach ($validated['items'] as $index => $item) {
            $price = Price::find($item['price_id']);
            $date = Carbon::parse($item['reservation_date'])->format('Y-m-d');
            $start = Carbon::parse($item['start_time']);
            $cartKey = $item['price_id'].'|'.$date.'|'.$start->format('H:i');

            if (isset($seen[$cartKey])) {
                $errors[$index] = 'This lesson is duplicated in your cart.';
                continue;
            }

            $seen[$cartKey] = true;

            if (! $price || ! $this->isNormalLessonPackage($price)) {
                $errors[$index] = 'This package cannot be booked through the lesson cart.';
                continue;
            }

            if (isset($item['duration_minutes']) && ! $price->isFiveHourLessonBundle()) {
                $errors[$index] = 'A custom lesson duration is only available for the 5 hour lesson bundle.';
                continue;
            }

            $availability = $this->lessonAvailability(
                $date,
                $start,
                $price,
                $slotHoldService,
                isset($item['duration_minutes']) ? (int) $item['duration_minutes'] : null
            );

            if (! $availability['available']) {
                $errors[$index] = $availability['message'];
                continue;
            }

            $prepared[] = $this->itemPayload($price, 'lesson', $date, $availability['start'], $availability['end'], $availability['buffer_end'], [
                'index' => $index,
                'duration_minutes' => $availability['duration_minutes'],
            ]);
        }

        $errors = array_replace($errors, $this->fiveHourBundleCartErrors($prepared));
        $errors = array_replace($errors, $this->cartOverlapErrors($prepared));

        if (! empty($errors)) {
            throw new BookingConflictException('Some cart items are not available.', [
                'items' => $errors,
            ]);
        }

        return $this->applyCartAmounts($prepared);
    }

    private function prepareLessonItem(array $validated, SlotHoldService $slotHoldService): array
    {
        $price = Price::findOrFail($validated['price_id']);

        if ($price->isFiveHourLessonBundle()) {
            throw ValidationException::withMessages([
                'price_id' => 'The 5 hour lesson bundle must be booked through the cart with 1-hour and 2-hour lessons totaling exactly 5 hours.',
            ]);
        }

        $date = Carbon::parse($validated['reservation_date'])->format('Y-m-d');
        $availability = $this->lessonAvailability($date, Carbon::parse($validated['start_time']), $price, $slotHoldService);

        if (! $availability['available']) {
            throw new BookingConflictException($availability['message']);
        }

        return $this->itemPayload($price, 'lesson', $date, $availability['start'], $availability['end'], $availability['buffer_end']);
    }

    private function prepareTestItem(array $validated, SlotHoldService $slotHoldService): array
    {
        $price = Price::findOrFail($validated['price_id']);
        $date = Carbon::parse($validated['reservation_date'])->format('Y-m-d');
        $testTime = Carbon::parse($validated['test_time']);
        $start = $testTime->copy()->subHour();
        $end = $testTime->copy()->addMinutes((int) $validated['duration_minutes']);

        if ($start->format('H:i') < '07:00' || $end->format('H:i') > '18:00') {
            throw new BookingConflictException('Time slot is outside working hours (7:00 - 18:00)', [], 422);
        }

        if (! $this->windowAvailable($date, $start, $end, $slotHoldService)) {
            throw new BookingConflictException('Time slot no longer available.');
        }

        $testType = $validated['test_type'] ?? $this->extractPackageName($price->description);

        return $this->itemPayload($price, 'test', $date, $start, $end, $end, [
            'test_time' => $testTime->format('H:i:s'),
            'test_location' => $validated['test_location'],
            'package_type' => 'Test Package: '.$testType,
            'metadata' => [
                'actual_test_time' => $testTime->format('H:i'),
                'test_duration' => $validated['duration_minutes'].' minutes',
                'buffer_before_test' => '1 hour',
            ],
        ]);
    }

    private function lessonAvailability(
        string $date,
        Carbon $start,
        Price $price,
        SlotHoldService $slotHoldService,
        ?int $requestedDurationMinutes = null
    ): array
    {
        try {
            $durationMinutes = $price->lessonBookingDurationMinutes($requestedDurationMinutes);
        } catch (\InvalidArgumentException $exception) {
            return [
                'available' => false,
                'message' => $exception->getMessage(),
            ];
        }
        $end = $start->copy()->addMinutes($durationMinutes);
        $bufferEnd = $end->copy()->addMinutes(self::BOOKING_BUFFER_MINUTES);
        [$scheduleStart, $scheduleEnd] = $this->scheduleBounds($date);

        if ($start < $scheduleStart || $bufferEnd > $scheduleEnd) {
            return [
                'available' => false,
                'message' => 'This lesson does not fit inside the available schedule.',
            ];
        }

        if (! $this->windowAvailable($date, $start, $bufferEnd, $slotHoldService)) {
            return [
                'available' => false,
                'message' => 'This time slot is no longer available.',
            ];
        }

        return [
            'available' => true,
            'start' => $start,
            'end' => $end,
            'buffer_end' => $bufferEnd,
            'duration_minutes' => $durationMinutes,
        ];
    }

    private function windowAvailable(string $date, Carbon $start, Carbon $end, ?SlotHoldService $slotHoldService = null): bool
    {
        if (BlockReservation::overlapsDrivingWindow($date, $start, $end, self::BOOKING_BUFFER_MINUTES)) {
            return false;
        }

        $hasReservation = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get()
            ->contains(function ($reservation) use ($start, $end) {
                $existingStart = Carbon::parse($reservation->start_time);
                $existingEnd = Carbon::parse($reservation->end_time)->addMinutes(self::BOOKING_BUFFER_MINUTES);

                return $existingStart < $end && $existingEnd > $start;
            });

        if ($hasReservation) {
            return false;
        }

        return ! $slotHoldService?->activeHoldExists($date, $start, $end);
    }

    private function firstFinalizationConflict(PaymentIntent $intent): ?string
    {
        foreach ($intent->items as $item) {
            $date = Carbon::parse($item->reservation_date)->format('Y-m-d');
            $start = Carbon::parse($item->start_time);
            $end = Carbon::parse($item->end_time)->addMinutes(
                $item->item_type === 'test' ? 0 : self::BOOKING_BUFFER_MINUTES
            );

            if (! $this->windowAvailable($date, $start, $end)) {
                return "Conflict for {$date} {$start->format('H:i')}";
            }
        }

        return null;
    }

    private function itemPayload(Price $price, string $type, string $date, Carbon $start, Carbon $end, Carbon $holdEnd, array $extra = []): array
    {
        return [
            'price' => $price,
            'item_type' => $type,
            'reservation_date' => $date,
            'start' => $start,
            'end' => $end,
            'hold_start' => $start,
            'hold_end' => $holdEnd,
            'package_type' => $extra['package_type'] ?? $this->extractPackageName($price->description),
            'amount_cents' => (int) round(((float) $price->price) * 100),
            ...$extra,
        ];
    }

    private function cartOverlapErrors(array $items): array
    {
        $errors = [];

        for ($i = 0; $i < count($items); $i++) {
            for ($j = $i + 1; $j < count($items); $j++) {
                $first = $items[$i];
                $second = $items[$j];

                if (
                    $first['reservation_date'] === $second['reservation_date'] &&
                    $first['start'] < $second['hold_end'] &&
                    $second['start'] < $first['hold_end']
                ) {
                    $errors[$first['index']] = 'This lesson overlaps another item in your cart.';
                    $errors[$second['index']] = 'This lesson overlaps another item in your cart.';
                }
            }
        }

        return $errors;
    }

    private function fiveHourBundleCartErrors(array $items): array
    {
        $errors = [];
        $bundleGroups = collect($items)
            ->filter(fn ($item) => $item['price']->isFiveHourLessonBundle())
            ->groupBy(fn ($item) => $item['price']->id);

        foreach ($bundleGroups as $bundleItems) {
            if ($bundleItems->sum('duration_minutes') === Price::FIVE_HOUR_BUNDLE_TOTAL_MINUTES) {
                continue;
            }

            foreach ($bundleItems as $bundleItem) {
                $errors[$bundleItem['index']] = 'The 5 hour lesson bundle requires selected 1-hour and 2-hour lessons totaling exactly 5 hours.';
            }
        }

        return $errors;
    }

    private function applyCartAmounts(array $items): array
    {
        $bundleSessionNumbers = [];
        $bundleSessionCounts = collect($items)
            ->filter(fn ($item) => $item['price']->isFiveHourLessonBundle())
            ->groupBy(fn ($item) => $item['price']->id)
            ->map->count();
        $chargedBundleIds = [];

        foreach ($items as $key => $item) {
            $price = $item['price'];

            if (! $price->isFiveHourLessonBundle()) {
                continue;
            }

            $bundleId = $price->id;
            $bundleSessionNumbers[$bundleId] = ($bundleSessionNumbers[$bundleId] ?? 0) + 1;
            $isFirstBundleSession = ! isset($chargedBundleIds[$bundleId]);

            if ($isFirstBundleSession) {
                $chargedBundleIds[$bundleId] = true;
            }

            $items[$key]['amount_cents'] = $isFirstBundleSession
                ? (int) round(((float) $price->price) * 100)
                : 0;
            $items[$key]['metadata'] = array_merge($items[$key]['metadata'] ?? [], [
                'bundle_type' => '5_hour_lesson_bundle',
                'bundle_session_number' => $bundleSessionNumbers[$bundleId],
                'bundle_session_count' => $bundleSessionCounts[$bundleId],
                'bundle_total_minutes' => Price::FIVE_HOUR_BUNDLE_TOTAL_MINUTES,
                'selected_duration_minutes' => $item['duration_minutes'],
                'charged_as_bundle' => $isFirstBundleSession,
            ]);
        }

        return $items;
    }

    private function scheduleBounds(string $date): array
    {
        $slots = TimeSlot::where('date', $date)->get();

        if ($slots->isEmpty()) {
            return [
                Carbon::createFromTime(7, 0, 0),
                Carbon::createFromTime(18, 0, 0),
            ];
        }

        return [
            Carbon::parse($slots->min('start_time')),
            Carbon::parse($slots->max('end_time')),
        ];
    }

    private function parseDurationToMinutes($duration): int
    {
        if (! $duration) {
            return 60;
        }

        $duration = strtolower(trim((string) $duration));
        $totalMinutes = 0;

        if (preg_match('/(\d+(?:\.\d+)?)\s*(?:hrs|hr|hour|hours)/', $duration, $matches)) {
            $totalMinutes += (float) $matches[1] * 60;
        }

        if (preg_match('/(\d+)\s*(?:min|mins|minute|minutes)/', $duration, $matches)) {
            $totalMinutes += (int) $matches[1];
        }

        if ($totalMinutes === 0 && preg_match('/(\d+(?:\.\d+)?)/', $duration, $matches)) {
            $number = (float) $matches[1];
            $totalMinutes = $number < 10 ? $number * 60 : $number;
        }

        return (int) round($totalMinutes ?: 60);
    }

    private function extractPackageName($description): string
    {
        if (! $description) {
            return '';
        }

        return str_contains($description, ':')
            ? trim(substr(strrchr($description, ':'), 1))
            : trim($description);
    }

    private function isNormalLessonPackage(Price $price): bool
    {
        return $price->isCartBookableLessonPackage();
    }

    private function customerSnapshot(array $validated): array
    {
        return [
            'user_name' => $validated['user_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'pickup_location' => $validated['pickup_location'] ?? null,
            'dropoff_location' => $validated['dropoff_location'] ?? null,
            'comment' => $validated['comment'] ?? null,
        ];
    }

    private function safeBookingPayload(array $validated): array
    {
        unset($validated['accepted_terms']);

        return $validated;
    }

    private function sendConfirmationEmails(Collection $reservations, PaymentIntent $intent): void
    {
        $totalAmount = $intent->amount_cents / 100;

        if ($reservations->count() > 1) {
            try {
                Mail::to($intent->customer_email)->send(new CartReservationsCreated($reservations, false, $totalAmount));
                Mail::to(config('services.onlinepay.admin_email', 'Wheelmasterdriving@gmail.com'))
                    ->send(new CartReservationsCreated($reservations, true, $totalAmount));
            } catch (\Throwable $exception) {
                Log::error('Failed to send paid cart confirmation email: '.$exception->getMessage());
            }

            return;
        }

        $reservation = $reservations->first();

        try {
            Mail::to($intent->customer_email)->send(new ReservationCreated($reservation, false));
            Mail::to(config('services.onlinepay.admin_email', 'Wheelmasterdriving@gmail.com'))
                ->send(new ReservationCreated($reservation, true));
        } catch (\Throwable $exception) {
            Log::error('Failed to send paid reservation confirmation email: '.$exception->getMessage());
        }
    }
}
