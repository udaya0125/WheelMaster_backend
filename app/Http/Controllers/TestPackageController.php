<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\Price;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
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
        $endTime = $testTime->copy()->addMinutes($durationMinutes);

        // Check if within working hours (7:00 to 18:00)
        $workingStart = Carbon::createFromTime(7, 0, 0);
        $workingEnd = Carbon::createFromTime(18, 0, 0);

        if ($startTime->format('H:i') < $workingStart->format('H:i') ||
            $endTime->format('H:i') > $workingEnd->format('H:i')) {
            return response()->json([
                'available' => false,
                'message' => 'Time slot is outside working hours (7:00 - 18:00)',
                'alternative_times' => $this->findAlternativeTestTimes($date, $durationMinutes, $priceId),
            ]);
        }

        // Check for overlapping reservations for THIS SPECIFIC PRICE (non-rejected)
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
            $alternativeTimes = $this->findAlternativeTestTimes($date, $durationMinutes, $priceId);

            $message = $blockedSlot ?
                'Time slot is blocked' :
                'The current time is not available. Please call 0481488216 to see if we can arrange something.';

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
        $workingHoursStart = Carbon::createFromTime(7, 0, 0);
        $workingHoursEnd = Carbon::createFromTime(18, 0, 0);

        $availableSlots = [];

        // First possible test time is 8:00 AM (7:00 + 1 hour buffer)
        $earliestTestTime = $workingHoursStart->copy()->addHour();
        $currentTestTime = $earliestTestTime->copy();

        while ($currentTestTime < $workingHoursEnd) {
            $startTime = $currentTestTime->copy()->subHour();
            $endTime = $currentTestTime->copy()->addMinutes($durationMinutes);

            // Make sure we don't exceed working hours
            if ($endTime <= $workingHoursEnd && $startTime >= $workingHoursStart) {
                $isAvailable = $this->isTestTimeAvailable($date, $startTime, $endTime, $priceId);

                if ($isAvailable) {
                    $availableSlots[] = [
                        'time' => $currentTestTime->format('H:i'),
                        'formatted' => $currentTestTime->format('h:i A'),
                    ];
                }
            }

            $currentTestTime->addMinutes(30);
        }

        return array_slice($availableSlots, 0, 5);
    }

    /**
     * Check if a test time slot is available for specific price
     */
    private function isTestTimeAvailable($date, $startTime, $endTime, $priceId)
    {
        $hasReservation = UserReservation::where('reservation_date', $date)
            ->where('price_id', $priceId)
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        $hasBlock = BlockReservation::where('date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime->format('H:i:s'))
                        ->where('end_time', '>', $startTime->format('H:i:s'));
                });
            })
            ->exists();

        return !$hasReservation && !$hasBlock;
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

        $workingHoursStart = Carbon::createFromTime(7, 0, 0);
        $workingHoursEnd = Carbon::createFromTime(18, 0, 0);

        $availableSlots = [];

        $earliestTestTime = $workingHoursStart->copy()->addHour();
        $currentTestTime = $earliestTestTime->copy();

        while ($currentTestTime < $workingHoursEnd) {
            $startTime = $currentTestTime->copy()->subHour();
            $endTime = $currentTestTime->copy()->addMinutes($durationMinutes);

            if ($endTime <= $workingHoursEnd && $startTime >= $workingHoursStart) {
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

            $currentTestTime->addMinutes(30);
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
            'user_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'test_time' => 'required|date_format:H:i',
            'reservation_date' => 'required|date',
            'price_id' => 'required|exists:prices,id',
            'duration_minutes' => 'required|integer',
            'test_location' => 'required|string',
            'test_type' => 'nullable|string', // Added validation for test_type
            'pickup_location' => 'nullable|string', // Added missing field
            'dropoff_location' => 'nullable|string', // Added missing field
        ]);

        // Get test type from price table or use default
        $price = Price::find($request->price_id);
        $testType = $request->test_type ?? ($price->name ?? 'General Test');

        // Calculate start and end times based on test time
        $testTime = Carbon::parse($request->test_time);
        $durationMinutes = $request->duration_minutes;

        $startTime = $testTime->copy()->subHour();
        $endTime = $testTime->copy()->addMinutes($durationMinutes);

        // Double-check availability for this specific price
        $availabilityCheck = $this->checkAvailability(new Request([
            'date' => $request->reservation_date,
            'test_time' => $request->test_time,
            'duration_minutes' => $request->duration_minutes,
            'price_id' => $request->price_id,
        ]));

        $availabilityData = $availabilityCheck->getData();

        if (!$availabilityData->available) {
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
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'test_time' => $request->test_time,
            'test_location' => $request->test_location,
            'price_id' => $request->price_id,
            'package_type' => 'Test Package: ' . $testType,
            'test_type' => $testType,
            'status' => 'Pending',
            'notes' => json_encode([
                'test_type' => $testType,
                'actual_test_time' => $request->test_time,
                'test_location' => $request->test_location,
                'test_duration' => $durationMinutes . ' minutes',
                'buffer_before_test' => '1 hour',
                'calculated_start_time' => $startTime->format('H:i:s'),
                'calculated_end_time' => $endTime->format('H:i:s'),
                'price_id' => $request->price_id,
            ]),
        ]);

        // Create notification for new reservation - FIXED: Removed duplicate field
        $notification = Notification::create([
            'message' => "New test package reservation from {$reservation->user_name} for {$reservation->reservation_date} " .
                        "({$startTime->format('h:i A')} - {$endTime->format('h:i A')})",
            'is_read' => false,
            'type' => 'test_package',
            'reservation_id' => $reservation->id, // Keep only one field
        ]);

        // Send confirmation emails
        try {
            Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer email: ' . $e->getMessage());
        }

        // Send email to admin
        try {
            $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
            Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
        } catch (\Exception $e) {
            Log::error('Failed to send admin email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Test package reservation created successfully',
            'data' => $reservation,
            'time_details' => [
                'test_time' => $request->test_time,
                'start_time' => $startTime->format('H:i:s'),
                'end_time' => $endTime->format('H:i:s'),
                'duration' => $durationMinutes . ' minutes',
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

        $workingStart = Carbon::createFromTime(7, 0, 0);
        $workingEnd = Carbon::createFromTime(18, 0, 0);

        if ($startTime->format('H:i') < $workingStart->format('H:i') ||
            $endTime->format('H:i') > $workingEnd->format('H:i')) {
            return [
                'available' => false,
                'message' => 'Outside working hours',
            ];
        }

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