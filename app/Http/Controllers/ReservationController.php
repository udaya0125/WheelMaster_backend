<?php

namespace App\Http\Controllers;

use App\Exceptions\BookingConflictException;
use App\Mail\CartReservationsCreated;
use App\Mail\ReservationCreated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\Price;
use App\Models\SlotHold;
use App\Models\TimeSlot;
use App\Models\UserReservation;
use App\Services\SlotHoldService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReservationController extends Controller
{
    private const BOOKING_BUFFER_MINUTES = 20;

    private function generateTimeSlots()
    {
        $slots = [];
        $start = Carbon::createFromTime(7, 0, 0);
        $end = Carbon::createFromTime(18, 0, 0);

        while ($start < $end) {
            $slotStart = $start->format('H:i');
            $slotEnd = $start->copy()->addMinutes(30)->format('H:i');
            $slots[] = [
                'start_time' => $slotStart,
                'end_time' => $slotEnd,
                'start_carbon' => $start->copy(),
                'end_carbon' => $start->copy()->addMinutes(30),
            ];
            $start->addMinutes(30);
        }

        return $slots;
    }

    // Get available time slots for multiple dates (for calendar display) - Now filtered by price
    public function getTimeSlotsForCalendar(Request $request)
    {
        // Get price_id from request
        $priceId = $request->get('price_id');
        if (! $priceId) {
            return response()->json([
                'success' => false,
                'message' => 'Price ID is required',
            ], 400);
        }

        // Verify price exists
        $price = Price::find($priceId);
        if (! $price) {
            return response()->json([
                'success' => false,
                'message' => 'Price not found',
            ], 404);
        }

        $days = $request->get('days', 30);
        $dates = [];

        for ($i = 0; $i < $days; $i++) {
            $date = Carbon::now()->addDays($i)->format('Y-m-d');
            $dates[$date] = $this->getAvailableSlotsForDate($date, $priceId);
        }

        return response()->json([
            'success' => true,
            'data' => $dates,
            'price' => $price,
        ]);
    }

    // Helper method to get available slots for a specific date and price
    private function getAvailableSlotsForDate($date, $priceId = null)
    {
        $now = Carbon::now();
        $isToday = $date === $now->format('Y-m-d');
        $price = $priceId ? Price::find($priceId) : null;
        $durationMinutes = $this->parseDurationToMinutes($price?->duration);

        // Fetch all blocks (blocks are price-independent - they affect all prices)
        $blocks = BlockReservation::where('date', $date)
            ->orderBy('start_time', 'asc')
            ->get();

        // Fetch reservations globally: one instructor/car cannot be booked twice.
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->orderBy('start_time', 'asc')
            ->get();

        $activeHolds = SlotHold::active()
            ->forDate($date)
            ->orderBy('segment_start', 'asc')
            ->get();

        // Combine all busy periods (blocks + reservations)
        $busyPeriods = [];

        // Blocks affect all prices
        foreach ($blocks as $block) {
            $busyPeriods[] = [
                'start' => Carbon::parse($block->start_time),
                'end' => $block->bufferedEndTime(self::BOOKING_BUFFER_MINUTES),
                'type' => 'block',
                'price_id' => null, // blocks are not price-specific
            ];
        }

        // Reservations are price-specific
        foreach ($reservations as $reservation) {
            $busyPeriods[] = [
                'start' => Carbon::parse($reservation->start_time),
                'end' => Carbon::parse($reservation->end_time)->addMinutes(self::BOOKING_BUFFER_MINUTES),
                'type' => 'reservation',
                'price_id' => $reservation->price_id,
            ];
        }

        foreach ($activeHolds as $hold) {
            $busyPeriods[] = [
                'start' => Carbon::parse($hold->segment_start),
                'end' => Carbon::parse($hold->segment_start)->addMinutes(self::BOOKING_BUFFER_MINUTES),
                'type' => 'hold',
                'price_id' => null,
            ];
        }

        // Sort busy periods by start time
        usort($busyPeriods, function ($a, $b) {
            return $a['start'] <=> $b['start'];
        });

        // Generate available slots between busy periods
        $availableSlots = [];
        $workingHoursStart = Carbon::createFromTime(7, 0, 0); // 7:00 AM
        $workingHoursEnd = Carbon::createFromTime(18, 0, 0);   // 6:00 PM

        $currentTime = $workingHoursStart->copy();

        // Add all busy periods to a timeline
        foreach ($busyPeriods as $period) {
            // If current time is before this busy period starts, add available slots
            if ($currentTime < $period['start']) {
                $this->addAvailableSlots($availableSlots, $currentTime, $period['start'], $isToday, $now, $durationMinutes);
            }

            // Move current time to the end of this busy period
            $currentTime = max($currentTime, $period['end']);
        }

        // Add available slots from last busy period to end of working hours
        if ($currentTime < $workingHoursEnd) {
            $this->addAvailableSlots($availableSlots, $currentTime, $workingHoursEnd, $isToday, $now, $durationMinutes);
        }

        // For today, filter out past slots
        if ($isToday) {
            $availableSlots = array_filter($availableSlots, function ($slot) use ($now) {
                $slotTime = Carbon::parse($slot['start_time']);

                return $slotTime > $now;
            });
        }

        // Format for frontend
        return array_map(function ($slot) {
            return $slot['start_time'];
        }, array_values($availableSlots));
    }

    // Helper to add available slots between two times
    private function addAvailableSlots(&$availableSlots, $startTime, $endTime, $isToday, $now, $durationMinutes = 60)
    {
        $slotDuration = 30; // minutes

        $current = $startTime->copy();

        while ($current < $endTime) {
            $slotEnd = $current->copy()->addMinutes($slotDuration);
            $bookingBufferEnd = $current->copy()
                ->addMinutes($durationMinutes)
                ->addMinutes(self::BOOKING_BUFFER_MINUTES);

            // If slot would go past end time, break
            if ($slotEnd > $endTime || $bookingBufferEnd > $endTime) {
                break;
            }

            // For today, check if slot is in the past
            $isPast = $isToday && $current <= $now;

            if (! $isPast) {
                $availableSlots[] = [
                    'start_time' => $current->format('H:i'),
                    'end_time' => $slotEnd->format('H:i'),
                ];
            }

            $current->addMinutes($slotDuration);
        }
    }

    private function parseDurationToMinutes($duration)
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

    private function extractPackageName($description)
    {
        if (! $description) {
            return '';
        }

        return str_contains($description, ':')
            ? trim(substr(strrchr($description, ':'), 1))
            : trim($description);
    }

    private function isNormalLessonPackage(Price $price)
    {
        $category = strtolower($price->category ?? '');
        $description = strtolower($price->description ?? '');

        return ! str_contains($category, 'test')
            && ! str_contains($category, 'bundle')
            && ! str_contains($description, 'test only');
    }

    private function getScheduleBoundsForDate($date)
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

    private function reservationOverlaps($date, Carbon $start, Carbon $bufferEnd)
    {
        return UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get()
            ->contains(function ($reservation) use ($start, $bufferEnd) {
                $existingStart = Carbon::parse($reservation->start_time);
                $existingBufferEnd = Carbon::parse($reservation->end_time)
                    ->addMinutes(self::BOOKING_BUFFER_MINUTES);

                return $existingStart < $bufferEnd && $existingBufferEnd > $start;
            });
    }

    private function validateCartItemAvailability(
        array $item,
        Price $price,
        ?SlotHoldService $slotHoldService = null,
        ?string $exceptHoldToken = null
    ): array {
        $reservationDate = Carbon::parse($item['reservation_date'])->format('Y-m-d');
        $start = Carbon::parse($item['start_time']);
        $durationMinutes = $this->parseDurationToMinutes($price->duration);
        $end = $start->copy()->addMinutes($durationMinutes);
        $bufferEnd = $end->copy()->addMinutes(self::BOOKING_BUFFER_MINUTES);
        [$scheduleStart, $scheduleEnd] = $this->getScheduleBoundsForDate($reservationDate);

        if ($start < $scheduleStart || $bufferEnd > $scheduleEnd) {
            return [
                'available' => false,
                'message' => 'This lesson does not fit inside the available schedule.',
            ];
        }

        $existingBlock = BlockReservation::overlapsDrivingWindow(
            $reservationDate,
            $start,
            $bufferEnd,
            self::BOOKING_BUFFER_MINUTES
        );

        if ($existingBlock) {
            return [
                'available' => false,
                'message' => 'This time slot is blocked.',
            ];
        }

        if ($this->reservationOverlaps($reservationDate, $start, $bufferEnd)) {
            return [
                'available' => false,
                'message' => 'This time slot is already reserved.',
            ];
        }

        if ($slotHoldService?->activeHoldExists($reservationDate, $start, $bufferEnd, $exceptHoldToken)) {
            return [
                'available' => false,
                'message' => 'This time slot is temporarily held by another checkout.',
            ];
        }

        return [
            'available' => true,
            'reservation_date' => $reservationDate,
            'start' => $start,
            'end' => $end,
            'buffer_end' => $bufferEnd,
            'duration_minutes' => $durationMinutes,
        ];
    }

    public function storeCart(Request $request)
    {
        $validated = $request->validate([
            'user_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'pickup_location' => 'required|string',
            'dropoff_location' => 'required|string',
            'comment' => 'nullable|string',
            'accepted_terms' => 'accepted',
            'items' => 'required|array|min:1|max:20',
            'items.*.price_id' => 'required|exists:prices,id',
            'items.*.reservation_date' => 'required|date',
            'items.*.start_time' => 'required',
        ]);

        $slotHoldService = new SlotHoldService();

        try {
            ['reservations' => $createdReservations, 'total_amount' => $totalAmount] = DB::transaction(
                function () use ($validated, $slotHoldService) {
                    $slotHoldService->releaseExpired();

                    $preparedItems = [];
                    $errors = [];
                    $seenKeys = [];
                    $holdToken = null;

                    foreach ($validated['items'] as $index => $item) {
                        $price = Price::find($item['price_id']);
                        $dateKey = Carbon::parse($item['reservation_date'])->format('Y-m-d');
                        $startKey = Carbon::parse($item['start_time'])->format('H:i');
                        $cartKey = $item['price_id'].'|'.$dateKey.'|'.$startKey;

                        if (isset($seenKeys[$cartKey])) {
                            $errors[$index] = 'This lesson is duplicated in your cart.';
                            continue;
                        }

                        $seenKeys[$cartKey] = true;

                        if (! $price || ! $this->isNormalLessonPackage($price)) {
                            $errors[$index] = 'This package cannot be booked through the lesson cart.';
                            continue;
                        }

                        $availability = $this->validateCartItemAvailability($item, $price, $slotHoldService);

                        if (! $availability['available']) {
                            $errors[$index] = $availability['message'];
                            continue;
                        }

                        $preparedItems[] = [
                            'index' => $index,
                            'price' => $price,
                            ...$availability,
                        ];
                    }

                    for ($i = 0; $i < count($preparedItems); $i++) {
                        for ($j = $i + 1; $j < count($preparedItems); $j++) {
                            $first = $preparedItems[$i];
                            $second = $preparedItems[$j];

                            if (
                                $first['reservation_date'] === $second['reservation_date'] &&
                                $first['start'] < $second['buffer_end'] &&
                                $second['start'] < $first['buffer_end']
                            ) {
                                $errors[$first['index']] = 'This lesson overlaps another item in your cart.';
                                $errors[$second['index']] = 'This lesson overlaps another item in your cart.';
                            }
                        }
                    }

                    if (! empty($errors)) {
                        throw new BookingConflictException('Some cart items are not available.', [
                            'items' => $errors,
                        ]);
                    }

                    foreach ($preparedItems as $item) {
                        try {
                            $holdToken = $slotHoldService->acquire(
                                $item['reservation_date'],
                                $item['start'],
                                $item['buffer_end'],
                                $holdToken
                            );
                        } catch (BookingConflictException) {
                            throw new BookingConflictException('Some cart items are not available.', [
                                'items' => [
                                    $item['index'] => 'This time slot is no longer available.',
                                ],
                            ]);
                        }
                    }

                    $createdReservations = collect();
                    $totalAmount = collect($preparedItems)->sum(fn ($item) => (float) $item['price']->price);

                    foreach ($preparedItems as $item) {
                        $reservation = UserReservation::create([
                            'user_name' => $validated['user_name'],
                            'email' => $validated['email'],
                            'phone' => $validated['phone'],
                            'address' => $validated['address'],
                            'pickup_location' => $validated['pickup_location'],
                            'dropoff_location' => $validated['dropoff_location'],
                            'reservation_date' => $item['reservation_date'],
                            'start_time' => $item['start']->format('H:i:s'),
                            'end_time' => $item['end']->format('H:i:s'),
                            'price_id' => $item['price']->id,
                            'package_type' => $this->extractPackageName($item['price']->description),
                            'status' => 'Pending',
                            'comment' => $validated['comment'] ?? null,
                        ]);

                        $createdReservations->push($reservation->load('price'));
                    }

                    if ($holdToken) {
                        $slotHoldService->releaseToken($holdToken);
                    }

                    Notification::create([
                        'message' => "New cart booking from {$validated['user_name']} with ".$createdReservations->count().' lessons',
                        'is_read' => false,
                    ]);

                    return [
                        'reservations' => $createdReservations,
                        'total_amount' => $totalAmount,
                    ];
                },
                3
            );
        } catch (BookingConflictException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], $exception->statusCode());
        }

        try {
            Mail::to($validated['email'])->send(new CartReservationsCreated($createdReservations, false, $totalAmount));
        } catch (\Exception $e) {
            Log::error('Failed to send customer cart email: '.$e->getMessage());
        }

        try {
            Mail::to('Wheelmasterdriving@gmail.com')
                ->send(new CartReservationsCreated($createdReservations, true, $totalAmount));
        } catch (\Exception $e) {
            Log::error('Failed to send admin cart email: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Cart booking created successfully',
            'data' => $createdReservations,
            'total_amount' => $totalAmount,
        ], 201);
    }

    // Check availability for a given date and price
    public function checkAvailability(Request $request)
    {
        $date = $request->date;
        $priceId = $request->price_id;

        if (! $date) {
            return response()->json(['error' => 'Date is required'], 400);
        }

        if (! $priceId) {
            return response()->json(['error' => 'Price ID is required'], 400);
        }

        // Verify price exists
        $price = Price::find($priceId);
        if (! $price) {
            return response()->json(['error' => 'Price not found'], 404);
        }

        $availableSlots = $this->getAvailableSlotsForDate($date, $priceId);

        return response()->json([
            'date' => $date,
            'price_id' => $priceId,
            'price_name' => $price->name,
            'available_slots' => $availableSlots,
        ]);
    }

    // Store reservation with improved validation
    public function store(Request $request)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'required',
            'dropoff_location' => 'required',
            'reservation_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'package_price' => 'required|numeric',
            'duration_minutes' => 'required|integer',
            'comment' => 'nullable|string',
        ]);

        // Convert times to Carbon for easier comparison
        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $requestBufferEnd = $requestEnd->copy()->addMinutes(self::BOOKING_BUFFER_MINUTES);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;
        $slotHoldService = new SlotHoldService();

        try {
            $reservation = DB::transaction(function () use (
                $request,
                $slotHoldService,
                $reservationDate,
                $requestStart,
                $requestEnd,
                $requestBufferEnd,
                $priceId
            ) {
                $slotHoldService->releaseExpired();

                $existingBlock = BlockReservation::overlapsDrivingWindow(
                    $reservationDate,
                    $requestStart,
                    $requestBufferEnd,
                    self::BOOKING_BUFFER_MINUTES
                );

                if ($existingBlock) {
                    throw new BookingConflictException('Selected time slot is blocked', [], 403);
                }

                $existingReservation = $this->reservationOverlaps($reservationDate, $requestStart, $requestBufferEnd);

                if ($existingReservation) {
                    throw new BookingConflictException('Selected time slot is already reserved', [], 409);
                }

                if ($slotHoldService->activeHoldExists($reservationDate, $requestStart, $requestBufferEnd)) {
                    throw new BookingConflictException('Selected time slot is temporarily held by another checkout', [], 409);
                }

                $holdToken = $slotHoldService->acquire(
                    $reservationDate,
                    $requestStart,
                    $requestBufferEnd
                );

                $reservation = UserReservation::create([
                    'user_name' => $request->user_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'pickup_location' => $request->pickup_location,
                    'dropoff_location' => $request->dropoff_location,
                    'reservation_date' => $reservationDate,
                    'start_time' => $requestStart->format('H:i:s'),
                    'end_time' => $requestEnd->format('H:i:s'),
                    'price_id' => $priceId,
                    'package_type' => $request->package_type,
                    'package_price' => $request->package_price,
                    'duration_minutes' => $request->duration_minutes,
                    'status' => 'Pending',
                    'comment' => $request->comment,
                ]);

                $slotHoldService->releaseToken($holdToken);

                Notification::create([
                    'message' => "New reservation from {$reservation->user_name} for {$reservationDate} ({$requestStart->format('h:i A')} - {$requestEnd->format('h:i A')})".Price::find($priceId)->name,
                    'is_read' => false,
                ]);

                return $reservation;
            }, 3);
        } catch (BookingConflictException $exception) {
            return response()->json([
                'error' => $exception->getMessage(),
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], $exception->statusCode());
        }

        // Send email to customer
        try {
            Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer email: '.$e->getMessage());
        }

        // Send email to admin
        try {
            // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
            // $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
            // Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
            Mail::to('Wheelmasterdriving@gmail.com')
                ->send(new ReservationCreated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin email: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Reservation created successfully',
            'data' => $reservation,
        ]);
    }

    // Get timeslots for frontend calendar - Now requires price_id
    public function timeSlots(Request $request)
    {
        try {
            // Get price_id from request
            $priceId = $request->get('price_id');
            if (! $priceId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Price ID is required',
                ], 400);
            }

            // Verify price exists
            $price = Price::find($priceId);
            if (! $price) {
                return response()->json([
                    'success' => false,
                    'message' => 'Price not found',
                ], 404);
            }

            // Get next 30 days of available slots for this specific price
            $slots = [];
            $today = Carbon::now()->format('Y-m-d');

            for ($i = 0; $i < 30; $i++) {
                $date = Carbon::now()->addDays($i)->format('Y-m-d');
                $availableSlots = $this->getAvailableSlotsForDate($date, $priceId);

                if (! empty($availableSlots)) {
                    $slots[$date] = $availableSlots;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $slots,
                'price' => $price,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching time slots: '.$e->getMessage(),
            ], 500);
        }
    }

    // Get available test slots for specific price
    public function getAvailableTestSlots(Request $request)
    {
        $date = $request->date;
        $priceId = $request->price_id;
        $durationMinutes = $request->duration_minutes ?? 60; // Default 1 hour test

        if (! $priceId) {
            return response()->json([
                'success' => false,
                'message' => 'Price ID is required',
            ], 400);
        }

        $workingHoursStart = Carbon::createFromTime(8, 0, 0);
        $workingHoursEnd = Carbon::createFromTime(17, 0, 0);

        $availableSlots = [];
        $current = $workingHoursStart->copy();

        while ($current < $workingHoursEnd) {
            $testEnd = $current->copy()->addMinutes($durationMinutes);
            $bufferStart = $current->copy()->subHour();
            $bufferEnd = $testEnd->copy()->addHour();

            // Check if buffer period is available

            // Check blocks (affect all prices)
            $hasBlock = BlockReservation::overlapsDrivingWindow(
                $date,
                $bufferStart,
                $bufferEnd,
                self::BOOKING_BUFFER_MINUTES
            );

            // Check reservations globally: one instructor/car cannot be booked twice.
            $hasReservation = UserReservation::where('reservation_date', $date)
                ->where('status', '!=', 'Rejected')
                ->where(function ($query) use ($bufferStart, $bufferEnd) {
                    $query->where(function ($q) use ($bufferStart, $bufferEnd) {
                        $q->where('start_time', '<', $bufferEnd->format('H:i:s'))
                            ->where('end_time', '>', $bufferStart->format('H:i:s'));
                    });
                })
                ->exists();

            $hasHold = (new SlotHoldService())->activeHoldExists($date, $bufferStart, $bufferEnd);

            if (! $hasReservation && ! $hasBlock && ! $hasHold &&
                $bufferStart >= $workingHoursStart &&
                $bufferEnd <= $workingHoursEnd) {
                $availableSlots[] = $current->format('H:i');
            }

            $current->addMinutes(30);
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'price_id' => $priceId,
            'available_test_slots' => $availableSlots,
        ]);
    }

    // New method: Get all prices with their available slots for a specific date
    public function getAllPricesAvailability(Request $request)
    {
        $date = $request->date;

        if (! $date) {
            return response()->json([
                'success' => false,
                'message' => 'Date is required',
            ], 400);
        }

        $prices = Price::where('is_active', true)->get();
        $result = [];

        foreach ($prices as $price) {
            $availableSlots = $this->getAvailableSlotsForDate($date, $price->id);

            $result[] = [
                'price_id' => $price->id,
                'price_name' => $price->name,
                'description' => $price->description,
                'price' => $price->price,
                'available_slots' => $availableSlots,
                'available_slots_count' => count($availableSlots),
                'is_available' => ! empty($availableSlots),
            ];
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'data' => $result,
        ]);
    }

    // For the Time Slot Management Page - Get all time slots for a specific date (for admin management)

    // Add this method to your ReservationController to use TimeSlot model
    private function getAvailableSlotsFromTimeSlotModel($date, $priceId = null)
    {
        // Initialize time slots for this date if they don't exist
        TimeSlot::initializeForDateRange($date, $date);

        // Get all time slots for this date
        $timeSlots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();

        // Get reservations for this date globally.
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();

        // Get blocks for this date
        $blocks = BlockReservation::where('date', $date)->get();
        $activeHolds = SlotHold::active()->forDate($date)->get();

        $availableSlots = [];

        foreach ($timeSlots as $slot) {
            // Check if slot is reserved
            $isReserved = $reservations->contains(function ($reservation) use ($slot) {
                return $reservation->start_time == $slot->start_time;
            });

            // Check if slot is blocked
            $isBlocked = false;
            foreach ($blocks as $block) {
                $blockStart = Carbon::parse($block->start_time);
                $blockEnd = $block->bufferedEndTime(self::BOOKING_BUFFER_MINUTES);
                $slotStart = Carbon::parse($slot->start_time);

                if ($slotStart->between($blockStart, $blockEnd->subMinute())) {
                    $isBlocked = true;
                    break;
                }
            }

            $isHeld = $activeHolds->contains(function ($hold) use ($slot) {
                return substr($hold->segment_start, 0, 5) === substr($slot->start_time, 0, 5);
            });

            // If slot is available (not reserved and not blocked)
            if (! $isReserved && ! $isBlocked && ! $isHeld && $slot->status === 'available') {
                $availableSlots[] = $slot->start_time;
            }
        }

        return $availableSlots;
    }
}
