<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\Price;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TestPackageController extends Controller
{
    /**
     * Check availability for test packages with 1-hour buffer requirement
     */
    public function checkAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'test_time' => 'required|date_format:H:i',
            'duration_minutes' => 'required|integer|min:30',
            'price_id' => 'required|exists:prices,id',
        ]);

        $date = $request->date;
        $testTime = Carbon::parse($request->test_time);
        $durationMinutes = $request->duration_minutes;
        $priceId = $request->price_id;

        // Calculate start and end times
        $startTime = $testTime->copy()->subHour();
        $endTime = $testTime->copy()->addMinutes($durationMinutes); // End at test completion

        // Check if within working hours (10:00 to 17:00)
        $workingStart = Carbon::createFromTime(10, 0, 0); // 10:00 AM
        $workingEnd = Carbon::createFromTime(17, 0, 0);   // 5:00 PM

        if ($startTime->format('H:i') < $workingStart->format('H:i') ||
            $endTime->format('H:i') > $workingEnd->format('H:i')) {
            return response()->json([
                'available' => false,
                'message' => 'Time slot is outside working hours (10:00 - 17:00)',
                'alternative_times' => $this->findAlternativeTestTimes($date, $durationMinutes, $priceId),
            ]);
        }

        // Check for overlapping reservations for THIS SPECIFIC PRICE (non-rejected)
        $overlappingReservations = UserReservation::where('reservation_date', $date)
            ->where('price_id', $priceId) // Only check for this specific price
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    // Check if reservation overlaps with our time period
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        // Check for blocked slots (block slots are universal for all prices)
        $blockedSlot = BlockReservation::where('date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        if ($overlappingReservations || $blockedSlot) {
            // Find alternative available times for this price
            $alternativeTimes = $this->findAlternativeTestTimes($date, $durationMinutes, $priceId);

            $message = $blockedSlot ?
                'Time slot is blocked' :
                'Time slot not available for this test package';

            return response()->json([
                'available' => false,
                'message' => $message,
                'alternative_times' => $alternativeTimes,
                'buffer_required' => true,
            ]);
        }

        return response()->json([
            'available' => true,
            'message' => 'Time slot available',
            'test_time' => $testTime->format('H:i'),
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'duration_minutes' => $durationMinutes,
            'price_id' => $priceId,
        ]);
    }

    /**
     * Find alternative test times that meet buffer requirements for specific price
     */
    private function findAlternativeTestTimes($date, $durationMinutes, $priceId)
    {
        $workingHoursStart = Carbon::createFromTime(10, 0, 0); // 10:00 AM
        $workingHoursEnd = Carbon::createFromTime(17, 0, 0);   // 5:00 PM

        $availableSlots = [];

        // Start checking test times from 10:00, but need to ensure 1-hour buffer before
        // So first possible test time is 10:00 + 1 hour = 11:00
        $earliestTestTime = $workingHoursStart->copy()->addHour();

        // Start checking from the earliest possible test time
        $currentTestTime = $earliestTestTime->copy();

        while ($currentTestTime < $workingHoursEnd) {
            $startTime = $currentTestTime->copy()->subHour(); // 1 hour before test
            $endTime = $currentTestTime->copy()->addMinutes($durationMinutes); // End at test completion

            // Make sure we don't exceed working hours
            if ($endTime <= $workingHoursEnd && $startTime >= $workingHoursStart) {
                // Check if this slot is available for this specific price
                $isAvailable = $this->isTestTimeAvailable($date, $startTime, $endTime, $priceId);

                if ($isAvailable) {
                    $availableSlots[] = [
                        'time' => $currentTestTime->format('H:i'),
                        'formatted' => $currentTestTime->format('h:i A'),
                    ];
                }
            }

            $currentTestTime->addMinutes(30); // Check every 30 minutes
        }

        return array_slice($availableSlots, 0, 5); // Return up to 5 alternatives
    }

    /**
     * Check if a test time slot is available for specific price
     */
    private function isTestTimeAvailable($date, $startTime, $endTime, $priceId)
    {
        // Check reservations for THIS SPECIFIC PRICE
        $hasReservation = UserReservation::where('reservation_date', $date)
            ->where('price_id', $priceId) // Only check for this specific price
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        // Check blocks (block slots are universal for all prices)
        $hasBlock = BlockReservation::where('date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        return ! $hasReservation && ! $hasBlock;
    }

    /**
     * Get all available time slots for a specific price on a specific date
     */
    public function getAvailableTimeSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'price_id' => 'required|exists:prices,id',
            'duration_minutes' => 'required|integer|min:30',
        ]);

        $date = $request->date;
        $priceId = $request->price_id;
        $durationMinutes = $request->duration_minutes;

        $workingHoursStart = Carbon::createFromTime(10, 0, 0); // 10:00 AM
        $workingHoursEnd = Carbon::createFromTime(17, 0, 0);   // 5:00 PM

        $availableSlots = [];

        // Start checking test times from 10:00, but need to ensure 1-hour buffer before
        // So first possible test time is 10:00 + 1 hour = 11:00
        $earliestTestTime = $workingHoursStart->copy()->addHour();

        // Start checking from the earliest possible test time
        $currentTestTime = $earliestTestTime->copy();

        while ($currentTestTime < $workingHoursEnd) {
            $startTime = $currentTestTime->copy()->subHour(); // 1 hour before test
            $endTime = $currentTestTime->copy()->addMinutes($durationMinutes); // End at test completion

            // Make sure we don't exceed working hours
            if ($endTime <= $workingHoursEnd && $startTime >= $workingHoursStart) {
                // Check if this slot is available for this specific price
                $isAvailable = $this->isTestTimeAvailable($date, $startTime, $endTime, $priceId);

                if ($isAvailable) {
                    $availableSlots[] = [
                        'time' => $currentTestTime->format('H:i'),
                        'formatted' => $currentTestTime->format('h:i A'),
                        'start_buffer' => $startTime->format('h:i A'),
                        'end_time' => $endTime->format('h:i A'),
                    ];
                }
            }

            $currentTestTime->addMinutes(30); // Check every 30 minutes
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'price_id' => $priceId,
            'duration_minutes' => $durationMinutes,
            'available_slots' => $availableSlots,
            'total_slots' => count($availableSlots),
        ]);
    }

    /**
     * Store test package reservation
     */
    public function storeTestReservation(Request $request)
    {
        $request->validate([
            'user_name' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'test_time' => 'required|date_format:H:i',
            'reservation_date' => 'required|date',
            'price_id' => 'required|exists:prices,id',
            'duration_minutes' => 'required|integer',
            'test_location' => 'required|string',
        ]);

        // Get test type from price table or use default
        $price = Price::find($request->price_id);
        $testType = $request->test_type ?? ($price->name ?? 'General Test');

        // Calculate start and end times based on test time
        $testTime = Carbon::parse($request->test_time);
        $durationMinutes = $request->duration_minutes;

        $startTime = $testTime->copy()->subHour(); // 1 hour before test
        $endTime = $testTime->copy()->addMinutes($durationMinutes); // End at test completion

        // Double-check availability for this specific price
        $availabilityCheck = $this->checkAvailability(new Request([
            'date' => $request->reservation_date,
            'test_time' => $request->test_time,
            'duration_minutes' => $request->duration_minutes,
            'price_id' => $request->price_id, // Include price_id in availability check
        ]));

        $availabilityData = $availabilityCheck->getData();

        if (! $availabilityData->available) {
            return response()->json([
                'success' => false,
                'message' => 'Time slot no longer available',
                'alternative_times' => $availabilityData->alternative_times ?? [],
            ], 409);
        }

        // Create reservation
        $reservation = UserReservation::create([
            'user_name' => $request->user_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'pickup_location' => $request->pickup_location,
            'dropoff_location' => $request->dropoff_location,
            'reservation_date' => $request->reservation_date,
            'start_time' => $startTime->format('H:i:s'), // Calculated start time (1 hour before test)
            'end_time' => $endTime->format('H:i:s'),     // Calculated end time (test completion)
            'test_time' => $request->test_time,          // Actual test time
            'test_location' => $request->test_location, // Store test location
            'price_id' => $request->price_id,            // Store price_id for future reference
            'package_type' => 'Test Package: '.$testType,
            'test_type' => $testType,
            'status' => 'Pending',
            'notes' => json_encode([
                'test_type' => $testType,
                'actual_test_time' => $request->test_time,
                'test_location' => $request->test_location,
                'test_duration' => $durationMinutes.' minutes',
                'buffer_before_test' => '1 hour',
                'calculated_start_time' => $startTime->format('H:i:s'),
                'calculated_end_time' => $endTime->format('H:i:s'),
                'price_id' => $request->price_id,
            ]),
        ]);

        // Create notification for new reservation
        // Create notification for new reservation - FIXED VERSION
        $notification = Notification::create([
            'message' => "New test package reservation from {$reservation->user_name} for {$reservation->reservation_date} ".
                        "({$startTime->format('h:i A')} - {$endTime->format('h:i A')}) ",
            'is_read' => false,
            'type' => 'test_package', // Add type to differentiate from other notifications
            'reservation_id' => $reservation->id,
            'user_reservation_id' => $reservation->id, // Link to the reservation
        ]);

        // Send confirmation emails
        try {
            Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        } catch (\Exception $e) {
            \Log::error('Failed to send customer email: '.$e->getMessage());
        }

        // Send email to admin
        try {
            $adminEmail = env('ADMIN_EMAIL', 'Wheelmaster@outlook.com.au');
            Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
        } catch (\Exception $e) {
            \Log::error('Failed to send admin email: '.$e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Test package reservation created successfully',
            'data' => $reservation,
            'time_details' => [
                'test_time' => $request->test_time,
                'start_time' => $startTime->format('H:i:s'), // 1 hour before test
                'end_time' => $endTime->format('H:i:s'),     // Test completion time
                'duration' => $durationMinutes.' minutes',
                'price_id' => $request->price_id,
            ],
        ], 201);
    }

    /**
     * Check multiple prices availability at once
     */
    public function checkMultiplePricesAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'test_time' => 'required|date_format:H:i',
            'duration_minutes' => 'required|integer|min:30',
            'price_ids' => 'required|array',
            'price_ids.*' => 'exists:prices,id',
        ]);

        $date = $request->date;
        $testTime = Carbon::parse($request->test_time);
        $durationMinutes = $request->duration_minutes;
        $priceIds = $request->price_ids;

        $results = [];

        foreach ($priceIds as $priceId) {
            $availability = $this->checkAvailabilityForPrice($date, $testTime, $durationMinutes, $priceId);
            $results[] = [
                'price_id' => $priceId,
                'available' => $availability['available'],
                'message' => $availability['message'],
            ];
        }

        return response()->json([
            'success' => true,
            'date' => $date,
            'test_time' => $testTime->format('H:i'),
            'results' => $results,
        ]);
    }

    /**
     * Helper method to check availability for a specific price
     */
    private function checkAvailabilityForPrice($date, $testTime, $durationMinutes, $priceId)
    {
        $startTime = $testTime->copy()->subHour();
        $endTime = $testTime->copy()->addMinutes($durationMinutes);

        // Check if within working hours
        $workingStart = Carbon::createFromTime(10, 0, 0);
        $workingEnd = Carbon::createFromTime(17, 0, 0);

        if ($startTime->format('H:i') < $workingStart->format('H:i') ||
            $endTime->format('H:i') > $workingEnd->format('H:i')) {
            return [
                'available' => false,
                'message' => 'Outside working hours',
            ];
        }

        // Check reservations for this specific price
        $overlappingReservations = UserReservation::where('reservation_date', $date)
            ->where('price_id', $priceId)
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        // Check blocks
        $blockedSlot = BlockReservation::where('date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        if ($overlappingReservations) {
            return [
                'available' => false,
                'message' => 'Slot booked for this price',
            ];
        }

        if ($blockedSlot) {
            return [
                'available' => false,
                'message' => 'Slot blocked',
            ];
        }

        return [
            'available' => true,
            'message' => 'Available',
        ];
    }
}
