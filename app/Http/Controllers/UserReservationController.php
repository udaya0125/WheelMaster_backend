<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Mail\ReservationStatusUpdated;
use App\Mail\ReservationTimeUpdated;
use App\Models\BlockReservation;
use App\Models\TimeSlot;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UserReservationController extends Controller
{
    private const BOOKING_BUFFER_MINUTES = 20;

    private const DEFAULT_SCHEDULE_END = '18:00:00';

    // ---------------------------------------
    // Helper: Extract number of lessons from package description
    // ---------------------------------------
    // private function extractLessonCount($packageDescription)
    // {
    //     if (preg_match('/^(\d+)\s*x\s*/', $packageDescription, $matches)) {
    //         return (int) $matches[1];
    //     }
    //     return 1;
    // }

    private function extractLessonCount($packageDescription)
    {
        // Pattern 1: "10 x Driving Lessons" or "5x Lessons" with multiplication symbol
        if (preg_match('/^(\d+)\s*[x×]\s*/', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        // Pattern 2: "10-Hour Express Test Prep" or "5-Hour Package" with hyphen
        if (preg_match('/^(\d+)-Hour/i', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        // Pattern 3: "10 Hours Package" or "5 hours training" (optional, for consistency with frontend)
        if (preg_match('/^(\d+)\s+hours?/i', $packageDescription, $matches)) {
            return (int) $matches[1];
        }

        return 1;
    }

    // ---------------------------------------
    // Helper: Check if package is a bundle
    // ---------------------------------------
    // private function isBundlePackage($packageDescription)
    // {
    //     return preg_match('/^(\d+)\s*x\s*/', $packageDescription) === 1;
    // }

    private function isBundlePackage($packageDescription)
    {
        // Check for multiplication pattern OR hyphen pattern OR hours pattern
        return preg_match('/^(\d+)\s*[x×]\s*/', $packageDescription) === 1 ||
               preg_match('/^(\d+)-Hour/i', $packageDescription) === 1 ||
               preg_match('/^(\d+)\s+hours?/i', $packageDescription) === 1;
    }

    // ---------------------------------------
    // Helper: Parse duration string to minutes
    // ---------------------------------------
    private function parseDurationToMinutes($duration)
    {
        if (! $duration) {
            return null;
        }

        $durationStr = strtolower($duration);

        if (preg_match('/(\d+(?:\.\d+)?)\s*hours?/', $durationStr, $matches)) {
            return (float) $matches[1] * 60;
        }

        if (preg_match('/(\d+)\s*minutes?/', $durationStr, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    private function bookingBufferEnd($endTime)
    {
        return Carbon::parse($endTime)->addMinutes(self::BOOKING_BUFFER_MINUTES);
    }

    private function hasBlockOverlap($date, Carbon $start, Carbon $bufferEnd)
    {
        return BlockReservation::overlapsDrivingWindow($date, $start, $bufferEnd);
    }

    private function getScheduleEndForDate($date)
    {
        $lastEndTime = TimeSlot::where('date', $date)
            ->orderByDesc('end_time')
            ->value('end_time');

        return Carbon::parse($lastEndTime ?: self::DEFAULT_SCHEDULE_END);
    }

    private function findReservationConflict(
        $date,
        Carbon $start,
        Carbon $end,
        ?UserReservation $exclude = null
    ): ?array
    {
        $query = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected');

        // An update is allowed to overlap the reservation's old time window.
        // Only other reservations can make the requested window unavailable.
        if ($exclude) {
            $query->whereKeyNot($exclude->getKey());
        }

        $requestBufferEnd = $this->bookingBufferEnd($end);

        foreach ($query->get() as $reservation) {
            $reservationStart = Carbon::parse($reservation->start_time);
            $reservationEnd = Carbon::parse($reservation->end_time);
            $reservationBufferEnd = $this->bookingBufferEnd($reservation->end_time);

            $directOverlap = $reservationStart < $end && $reservationEnd > $start;
            $bufferOverlap = $reservationStart < $requestBufferEnd && $reservationBufferEnd > $start;

            if ($directOverlap || $bufferOverlap) {
                return [
                    'reservation' => $reservation,
                    'type' => $directOverlap ? 'direct_overlap' : 'buffer_violation',
                    'requested_buffered_end' => $requestBufferEnd,
                    'reservation_buffered_end' => $reservationBufferEnd,
                ];
            }
        }

        return null;
    }

    private function hasReservationOverlap($date, Carbon $start, Carbon $end, ?UserReservation $exclude = null): bool
    {
        return $this->findReservationConflict($date, $start, $end, $exclude) !== null;
    }

    // ---------------------------------------
    // Helper: Check if a single session is available
    // ---------------------------------------
    private function isSessionAvailable($date, $startTime, $endTime, $priceId)
    {
        $dateFormatted = Carbon::parse($date)->format('Y-m-d');
        $requestStart = Carbon::parse($startTime);
        $requestEnd = Carbon::parse($endTime);
        $requestBufferEnd = $this->bookingBufferEnd($requestEnd);

        // Check blocked slots
        $blocked = $this->hasBlockOverlap($dateFormatted, $requestStart, $requestBufferEnd);

        if ($blocked) {
            return false;
        }

        // Check existing reservations
        return ! $this->hasReservationOverlap($dateFormatted, $requestStart, $requestEnd);
    }

    // ---------------------------------------
    // INDEX - list all reservations
    // ---------------------------------------
    public function index()
    {
        $reservations = UserReservation::with('price')->get();
        $paymentSummaries = $this->paymentSummariesForReservations($reservations->pluck('id')->all());
        $data = $reservations->map(function (UserReservation $reservation) use ($paymentSummaries) {
            $reservationData = $reservation->toArray();
            $reservationData['payment_summary'] = $paymentSummaries[$reservation->id] ?? null;

            return $reservationData;
        })->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ], 200);
    }

    private function paymentSummariesForReservations(array $reservationIds): array
    {
        if (empty($reservationIds)) {
            return [];
        }

        $paymentLinks = DB::table('payment_reservations')
            ->whereIn('user_reservation_id', $reservationIds)
            ->get(['payment_intent_id', 'user_reservation_id']);

        if ($paymentLinks->isEmpty()) {
            return [];
        }

        $intentIds = $paymentLinks->pluck('payment_intent_id')->unique()->values();
        $paymentIntents = DB::table('payment_intents')
            ->whereIn('id', $intentIds)
            ->get([
                'id',
                'status',
                'amount_cents',
                'currency',
                'merchant_reference',
                'westpac_checkout_id',
                'paid_at',
                'failed_at',
            ])
            ->keyBy('id');

        $linkedReservationCounts = DB::table('payment_reservations')
            ->whereIn('payment_intent_id', $intentIds)
            ->select('payment_intent_id', DB::raw('count(*) as linked_reservation_count'))
            ->groupBy('payment_intent_id')
            ->pluck('linked_reservation_count', 'payment_intent_id');

        $latestWebhookEvents = DB::table('payment_webhook_events')
            ->whereIn('payment_intent_id', $intentIds)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get([
                'payment_intent_id',
                'event_type',
                'status',
                'processed_at',
            ])
            ->unique('payment_intent_id')
            ->keyBy('payment_intent_id');

        return $paymentLinks->mapWithKeys(function ($paymentLink) use ($paymentIntents, $linkedReservationCounts, $latestWebhookEvents) {
            $paymentIntent = $paymentIntents->get($paymentLink->payment_intent_id);

            if (! $paymentIntent) {
                return [$paymentLink->user_reservation_id => null];
            }

            $latestWebhookEvent = $latestWebhookEvents->get($paymentIntent->id);

            return [
                $paymentLink->user_reservation_id => [
                    'source' => 'OnlinePay',
                    'status' => $paymentIntent->status,
                    'amount_cents' => $paymentIntent->amount_cents,
                    'currency' => $paymentIntent->currency,
                    'merchant_reference' => $paymentIntent->merchant_reference,
                    'westpac_checkout_id' => $paymentIntent->westpac_checkout_id,
                    'paid_at' => $paymentIntent->paid_at,
                    'failed_at' => $paymentIntent->failed_at,
                    'linked_reservation_count' => (int) ($linkedReservationCounts[$paymentIntent->id] ?? 1),
                    'latest_webhook_event' => $latestWebhookEvent ? [
                        'event_type' => $latestWebhookEvent->event_type,
                        'status' => $latestWebhookEvent->status,
                        'processed_at' => $latestWebhookEvent->processed_at,
                    ] : null,
                ],
            ];
        })->all();
    }

    // ---------------------------------------
    // STORE - create new reservation (handles bundles)
    // ---------------------------------------
    public function store(Request $request)
    {
        // Check if this is a bundle request
        $isBundle = $request->has('bundle_sessions') && is_array($request->bundle_sessions) && count($request->bundle_sessions) > 0;

        if ($isBundle) {
            return $this->storeBundle($request);
        }

        return $this->storeSingle($request);
    }

    // ---------------------------------------
    // Store single reservation
    // ---------------------------------------
    private function storeSingle(Request $request)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'nullable|string',
            'dropoff_location' => 'nullable|string',
            'reservation_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'test_time' => 'nullable',
            'test_location' => 'nullable|string',
            'comment' => 'nullable|string',
        ]);

        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $requestBufferEnd = $this->bookingBufferEnd($request->end_time);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;

        // Check for blocked slots
        $existingBlock = $this->hasBlockOverlap($reservationDate, $requestStart, $requestBufferEnd);

        if ($existingBlock) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already BLOCKED',
            ], 409);
        }

        // Check for existing reservations
        $existingReservation = $this->hasReservationOverlap($reservationDate, $requestStart, $requestEnd);

        if ($existingReservation) {
            return response()->json([
                'success' => false,
                'message' => 'This time slot is already BOOKED',
            ], 409);
        }

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
            'price_id' => $request->price_id,
            'status' => 'Pending',
            'package_type' => $request->package_type ?? 'Standard',
            'test_time' => $request->test_time,
            'test_location' => $request->test_location,
            'comment' => $request->comment,
        ]);

        // $this->sendReservationEmails($reservation);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created successfully',
            'data' => $reservation,
        ], 201);
    }

    // ---------------------------------------
    // Store bundle reservation - creates multiple records
    // ---------------------------------------
    private function storeBundle(Request $request)
    {
        // Validate bundle-specific data (no single reservation fields required)
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'nullable|string',
            'dropoff_location' => 'nullable|string',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'bundle_sessions' => 'required|array|min:1',
            'bundle_sessions.*.reservation_date' => 'required|date',
            'bundle_sessions.*.start_time' => 'required',
            'bundle_sessions.*.end_time' => 'required',
        ]);

        $sessions = $request->bundle_sessions;
        $totalSessions = count($sessions);
        $priceId = $request->price_id;

        // Get the package to check expected session count
        $price = \App\Models\Price::find($priceId);
        $expectedCount = $this->extractLessonCount($price->description);

        if ($totalSessions != $expectedCount) {
            return response()->json([
                'success' => false,
                'message' => "This package requires {$expectedCount} sessions. You provided {$totalSessions} sessions.",
            ], 422);
        }

        $createdReservations = [];
        $errors = [];

        // Validate all sessions first
        foreach ($sessions as $index => $session) {
            $isAvailable = $this->isSessionAvailable(
                $session['reservation_date'],
                $session['start_time'],
                $session['end_time'],
                $priceId
            );

            if (! $isAvailable) {
                $errors[] = 'Session '.($index + 1)." on {$session['reservation_date']} from {$session['start_time']} to {$session['end_time']} is not available";
            }
        }

        if (! empty($errors)) {
            return response()->json([
                'success' => false,
                'message' => 'Some sessions are not available',
                'errors' => $errors,
            ], 409);
        }

        // Create all reservation records
        foreach ($sessions as $index => $session) {
            $reservationDate = Carbon::parse($session['reservation_date'])->format('Y-m-d');
            $startTime = Carbon::parse($session['start_time'])->format('H:i:s');
            $endTime = Carbon::parse($session['end_time'])->format('H:i:s');

            $reservation = UserReservation::create([
                'user_name' => $request->user_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'pickup_location' => $request->pickup_location,
                'dropoff_location' => $request->dropoff_location,
                'reservation_date' => $reservationDate,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'price_id' => $priceId,
                'status' => 'Pending',
                'package_type' => $request->package_type,
                'test_time' => $session['test_time'] ?? null,
                'test_location' => $session['test_location'] ?? $request->test_location,
                'comment' => $request->comment,
            ]);

            $createdReservations[] = $reservation;
        }

        // Send bundle email summary
        // $this->sendBundleReservationEmails($createdReservations, $totalSessions);

        return response()->json([
            'success' => true,
            'message' => "Bundle reservation created successfully with {$totalSessions} sessions",
            'data' => $createdReservations,
        ], 201);
    }

    // ---------------------------------------
    // UPDATE - update existing reservation
    // ---------------------------------------
    public function update(Request $request, $id)
    {
        $reservation = UserReservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ], 404);
        }

        // Check if this is a status-only update
        $isStatusOnly = $request->has('status') && count($request->all()) === 1;

        if ($isStatusOnly) {
            return $this->updateStatus($request, $reservation);
        }

        return $this->updateSingle($request, $reservation);
    }

    // ---------------------------------------
    // Update single reservation
    // ---------------------------------------
    private function updateSingle(Request $request, $reservation)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'pickup_location' => 'nullable|string',
            'dropoff_location' => 'nullable|string',
            'reservation_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'price_id' => 'required|exists:prices,id',
            'package_type' => 'required|string',
            'test_time' => 'nullable',
            'test_location' => 'nullable|string',
                'comment' => 'nullable|string',
        ]);

        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $requestBufferEnd = $this->bookingBufferEnd($request->end_time);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;

        // Check for blocked slots
        $existingBlock = $this->hasBlockOverlap($reservationDate, $requestStart, $requestBufferEnd);

        if ($existingBlock) {
            return response()->json([
                'success' => false,
                'message' => 'Selected time slot is blocked',
            ], 403);
        }

        // Check for overlapping reservations
        $conflict = $this->findReservationConflict(
            $reservationDate,
            $requestStart,
            $requestEnd,
            $reservation
        );

        if ($conflict) {
            $conflictingReservation = $conflict['reservation'];
            Log::warning('Reservation update rejected due to time conflict', [
                'reservation_id' => $reservation->getKey(),
                'reservation_date' => $reservationDate,
                'submitted_start_time' => $requestStart->format('H:i:s'),
                'submitted_end_time' => $requestEnd->format('H:i:s'),
                'submitted_buffered_end_time' => $conflict['requested_buffered_end']->format('H:i:s'),
                'conflicting_reservation_id' => $conflictingReservation->getKey(),
                'conflict_type' => $conflict['type'],
            ]);

            return response()->json([
                'success' => false,
                'message' => $conflict['type'] === 'direct_overlap'
                    ? 'Selected lesson time overlaps another reservation'
                    : 'Selected lesson time violates the required 20-minute driving buffer',
                'conflict' => [
                    'type' => $conflict['type'],
                    'reservation_id' => $conflictingReservation->getKey(),
                    'start_time' => Carbon::parse($conflictingReservation->start_time)->format('H:i:s'),
                    'end_time' => Carbon::parse($conflictingReservation->end_time)->format('H:i:s'),
                    'buffered_end_time' => $conflict['reservation_buffered_end']->format('H:i:s'),
                    'requested_buffered_end_time' => $conflict['requested_buffered_end']->format('H:i:s'),
                ],
            ], 409);
        }

        $oldStatus = $reservation->status;
        $oldSchedule = [
            'reservation_date' => $reservation->reservation_date,
            'start_time' => $reservation->start_time,
            'end_time' => $reservation->end_time,
        ];

        $reservation->update([
            'user_name' => $request->user_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            // The dashboard edit form does not expose every optional field.
            // Missing fields must not erase values already stored on the booking.
            'pickup_location' => $request->input('pickup_location', $reservation->pickup_location),
            'dropoff_location' => $request->input('dropoff_location', $reservation->dropoff_location),
            'reservation_date' => $reservationDate,
            'start_time' => $requestStart->format('H:i:s'),
            'end_time' => $requestEnd->format('H:i:s'),
            'price_id' => $priceId,
            'package_type' => $request->package_type,
            'test_time' => $request->input('test_time', $reservation->test_time),
            'test_location' => $request->input('test_location', $reservation->test_location),
            'comment' => $request->input('comment', $reservation->comment),
        ]);

        if ($oldStatus !== $reservation->status) {
            $this->sendStatusUpdateEmails($reservation, $oldStatus);
        }

        $scheduleChanged =
            Carbon::parse($oldSchedule['reservation_date'])->format('Y-m-d') !== $reservationDate ||
            Carbon::parse($oldSchedule['start_time'])->format('H:i:s') !== $requestStart->format('H:i:s') ||
            Carbon::parse($oldSchedule['end_time'])->format('H:i:s') !== $requestEnd->format('H:i:s');

        if ($scheduleChanged) {
            $this->sendTimeUpdateEmail($reservation, $oldSchedule);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reservation updated successfully',
            'data' => $reservation,
        ], 200);
    }

    // ---------------------------------------
    // Update status only
    // ---------------------------------------
    private function updateStatus(Request $request, $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Accepted,Rejected',
        ]);

        $oldStatus = $reservation->status;
        $newStatus = $validated['status'];

        if ($newStatus === 'Rejected') {
            $reservation->status = $newStatus;
            $reservation->save();
            $this->sendStatusUpdateEmails($reservation, $oldStatus);

            return response()->json([
                'success' => true,
                'message' => 'Reservation rejected successfully',
                'data' => $reservation,
            ], 200);
        }

        // For Accepting or Resetting to Pending, check for conflicts
        if ($newStatus === 'Accepted' || $newStatus === 'Pending') {
            $reservationStart = Carbon::parse($reservation->start_time);
            $overlappingReservation = $this->hasReservationOverlap(
                $reservation->reservation_date,
                $reservationStart,
                Carbon::parse($reservation->end_time),
                $reservation
            );

            if ($overlappingReservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot conflicts with another reservation for the same service',
                ], 409);
            }

            $blockedSlot = $this->hasBlockOverlap(
                $reservation->reservation_date,
                $reservationStart,
                $this->bookingBufferEnd($reservation->end_time)
            );

            if ($blockedSlot) {
                return response()->json([
                    'success' => false,
                    'message' => 'This time slot is blocked',
                ], 409);
            }
        }

        $reservation->status = $newStatus;
        $reservation->save();

        if ($oldStatus !== $newStatus) {
            $this->sendStatusUpdateEmails($reservation, $oldStatus);
        }

        return response()->json([
            'success' => true,
            'message' => 'Reservation status updated successfully',
            'data' => $reservation,
        ], 200);
    }

    // ---------------------------------------
    // DELETE - delete a reservation
    // ---------------------------------------
    public function destroy($id)
    {
        $reservation = UserReservation::find($id);

        if (! $reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ], 404);
        }

        $reservation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reservation deleted successfully',
        ], 200);
    }

    // ---------------------------------------
    // Helper: Send reservation emails
    // ---------------------------------------
    // private function sendReservationEmails($reservation)
    // {
    //     try {
    //         Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send customer email: '.$e->getMessage());
    //     }

    //     try {
    //         $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
    //         // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
    //         Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send admin email: '.$e->getMessage());
    //     }
    // }

    // ---------------------------------------
    // Helper: Send bundle reservation emails
    // ---------------------------------------
    // private function sendBundleReservationEmails($reservations, $sessionCount)
    // {
    //     if (empty($reservations)) {
    //         return;
    //     }

    //     $firstReservation = $reservations[0];

    //     try {
    //         Mail::to($firstReservation->email)->send(new ReservationCreated($firstReservation, false, $sessionCount));
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send customer bundle email: '.$e->getMessage());
    //     }

    //     try {
    //         $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
    //         // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
    //         Mail::to($adminEmail)->send(new ReservationCreated($firstReservation, true, $sessionCount));
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send admin bundle email: '.$e->getMessage());
    //     }
    // }

    // ---------------------------------------
    // Helper: Send status update emails
    // ---------------------------------------
    private function sendStatusUpdateEmails($reservation, $oldStatus)
    {
        if ($oldStatus === $reservation->status) {
            return;
        }

        try {
            Mail::to($reservation->email)->send(new ReservationStatusUpdated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer status update email: '.$e->getMessage());
        }

        try {
            Mail::to(config('services.onlinepay.admin_email', 'Wheelmasterdriving@gmail.com'))
                ->send(new ReservationStatusUpdated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin status update email: '.$e->getMessage());
        }
    }

    private function sendTimeUpdateEmail(UserReservation $reservation, array $oldSchedule): void
    {
        try {
            Mail::to($reservation->email)->send(new ReservationTimeUpdated($reservation, $oldSchedule));
        } catch (\Exception $e) {
            Log::error('Failed to send reservation time update email', [
                'reservation_id' => $reservation->getKey(),
                'customer_email' => $reservation->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    // This is for the Rescheduling 

    // ---------------------------------------
// RESCHEDULE - change date/time on an existing reservation only
// ---------------------------------------
public function reschedule(Request $request, $id)
{
    $reservation = UserReservation::find($id);

    if (! $reservation) {
        return response()->json([
            'success' => false,
            'message' => 'Booking not found',
        ], 404);
    }

    if ($reservation->status === 'Rejected') {
        return response()->json([
            'success' => false,
            'message' => 'This booking has been cancelled and cannot be rescheduled.',
        ], 422);
    }

    $validated = $request->validate([
        'reservation_date' => 'required|date|after_or_equal:today',
        'start_time' => 'required',
        'end_time' => 'required',
    ]);

    $requestStart = Carbon::parse($validated['start_time']);
    $requestEnd = Carbon::parse($validated['end_time']);
    $requestBufferEnd = $this->bookingBufferEnd($validated['end_time']);
    $reservationDate = Carbon::parse($validated['reservation_date'])->format('Y-m-d');

    $existingBlock = $this->hasBlockOverlap($reservationDate, $requestStart, $requestBufferEnd);

    if ($existingBlock) {
        return response()->json([
            'success' => false,
            'message' => 'That time slot is blocked. Please choose another.',
        ], 409);
    }

    TimeSlot::initializeForDateRange($reservationDate, $reservationDate);

    $startsOnAvailableSlot = TimeSlot::where('date', $reservationDate)
        ->where('start_time', $requestStart->format('H:i:s'))
        ->where('status', 'available')
        ->exists();

    if (! $startsOnAvailableSlot || $requestBufferEnd > $this->getScheduleEndForDate($reservationDate)) {
        return response()->json([
            'success' => false,
            'message' => 'That lesson does not fit inside the available schedule. Please choose another time.',
        ], 409);
    }

    $conflict = $this->findReservationConflict(
        $reservationDate,
        $requestStart,
        $requestEnd,
        $reservation
    );

    if ($conflict) {
        return response()->json([
            'success' => false,
            'message' => $conflict['type'] === 'direct_overlap'
                ? 'That time slot is already booked. Please choose another.'
                : 'That time is too close to another booking — a 20-minute buffer is required.',
        ], 409);
    }

    $oldSchedule = [
        'reservation_date' => $reservation->reservation_date,
        'start_time' => $reservation->start_time,
        'end_time' => $reservation->end_time,
    ];

    // Rescheduling puts the booking back to Pending so the instructor
    // re-confirms the new time. Drop the 'status' line below if you'd
    // rather keep an Accepted booking Accepted after a self-reschedule.
    $reservation->update([
        'reservation_date' => $reservationDate,
        'start_time' => $requestStart->format('H:i:s'),
        'end_time' => $requestEnd->format('H:i:s'),
        'status' => 'Pending',
    ]);

    $this->sendTimeUpdateEmail($reservation, $oldSchedule);

    return response()->json([
        'success' => true,
        'message' => 'Booking rescheduled successfully',
        'data' => $reservation,
    ], 200);
}
}
