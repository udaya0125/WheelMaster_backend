<?php

namespace App\Http\Controllers;

use App\Mail\ReservationCreated;
use App\Models\BlockReservation;
use App\Models\Notification;
use App\Models\Price;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReservationController extends Controller
{
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

        // Fetch all blocks (blocks are price-independent - they affect all prices)
        $blocks = BlockReservation::where('date', $date)
            ->orderBy('start_time', 'asc')
            ->get();

        // Fetch reservations for this specific price
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected');

        // Filter by price_id if provided
        if ($priceId) {
            $reservations->where('price_id', $priceId);
        }

        $reservations = $reservations->orderBy('start_time', 'asc')->get();

        // Combine all busy periods (blocks + reservations)
        $busyPeriods = [];

        // Blocks affect all prices
        foreach ($blocks as $block) {
            $busyPeriods[] = [
                'start' => Carbon::parse($block->start_time),
                'end' => Carbon::parse($block->end_time),
                'type' => 'block',
                'price_id' => null, // blocks are not price-specific
            ];
        }

        // Reservations are price-specific
        foreach ($reservations as $reservation) {
            $busyPeriods[] = [
                'start' => Carbon::parse($reservation->start_time),
                'end' => Carbon::parse($reservation->end_time),
                'type' => 'reservation',
                'price_id' => $reservation->price_id,
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
                $this->addAvailableSlots($availableSlots, $currentTime, $period['start'], $isToday, $now);
            }

            // Move current time to the end of this busy period
            $currentTime = max($currentTime, $period['end']);
        }

        // Add available slots from last busy period to end of working hours
        if ($currentTime < $workingHoursEnd) {
            $this->addAvailableSlots($availableSlots, $currentTime, $workingHoursEnd, $isToday, $now);
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
    private function addAvailableSlots(&$availableSlots, $startTime, $endTime, $isToday, $now)
    {
        $slotDuration = 30; // minutes

        $current = $startTime->copy();

        while ($current < $endTime) {
            $slotEnd = $current->copy()->addMinutes($slotDuration);

            // If slot would go past end time, break
            if ($slotEnd > $endTime) {
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
        ]);

        // Convert times to Carbon for easier comparison
        $requestStart = Carbon::parse($request->start_time);
        $requestEnd = Carbon::parse($request->end_time);
        $reservationDate = Carbon::parse($request->reservation_date)->format('Y-m-d');
        $priceId = $request->price_id;

        // Check if selected slot overlaps with any blocked reservation (blocks affect all prices)
        $existingBlock = BlockReservation::where('date', $reservationDate)
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    // Check if blocked slot overlaps with requested time
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($existingBlock) {
            return response()->json(['error' => 'Selected time slot is blocked'], 403);
        }

        // Check if selected slot overlaps with any existing NON-REJECTED reservation FOR THE SAME PRICE
        $existingReservation = UserReservation::where('reservation_date', $reservationDate)
            ->where('price_id', $priceId) // Only check reservations for the same price
            ->where('status', '!=', 'Rejected')
            ->where(function ($query) use ($requestStart, $requestEnd) {
                $query->where(function ($q) use ($requestStart, $requestEnd) {
                    // Check if reservation overlaps with requested time
                    $q->where('start_time', '<', $requestEnd->format('H:i:s'))
                        ->where('end_time', '>', $requestStart->format('H:i:s'));
                });
            })
            ->exists();

        if ($existingReservation) {
            return response()->json(['error' => 'Selected time slot is already reserved for this service'], 409);
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
            'price_id' => $priceId,
            'package_type' => $request->package_type,
            'package_price' => $request->package_price,
            'duration_minutes' => $request->duration_minutes,
            'status' => 'Pending',
        ]);

        // Create notification for new reservation
        $notification = Notification::create([
            'message' => "New reservation from {$reservation->user_name} for {$reservationDate} ({$requestStart->format('h:i A')} - {$requestEnd->format('h:i A')})".Price::find($priceId)->name,
            'is_read' => false,
        ]);

        // Send email to customer
        try {
            Mail::to($reservation->email)->send(new ReservationCreated($reservation, false));
        } catch (\Exception $e) {
            Log::error('Failed to send customer email: '.$e->getMessage());
        }

        // Send email to admin
        try {
            // $adminEmail = env('ADMIN_EMAIL', 'wheelmaster@outlook.com.au');
            $adminEmail = env('ADMIN_EMAIL', 'adhikariudaya736@gmail.com');
            Mail::to($adminEmail)->send(new ReservationCreated($reservation, true));
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
            $hasBlock = BlockReservation::where('date', $date)
                ->where(function ($query) use ($bufferStart, $bufferEnd) {
                    $query->where(function ($q) use ($bufferStart, $bufferEnd) {
                        $q->where('start_time', '<', $bufferEnd->format('H:i:s'))
                            ->where('end_time', '>', $bufferStart->format('H:i:s'));
                    });
                })
                ->exists();

            // Only check reservations for this specific price
            $hasReservation = UserReservation::where('reservation_date', $date)
                ->where('price_id', $priceId) // Filter by price_id
                ->where('status', '!=', 'Rejected')
                ->where(function ($query) use ($bufferStart, $bufferEnd) {
                    $query->where(function ($q) use ($bufferStart, $bufferEnd) {
                        $q->where('start_time', '<', $bufferEnd->format('H:i:s'))
                            ->where('end_time', '>', $bufferStart->format('H:i:s'));
                    });
                })
                ->exists();

            if (! $hasReservation && ! $hasBlock &&
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

        // Get reservations for this date and price
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected');

        if ($priceId) {
            $reservations->where('price_id', $priceId);
        }
        $reservations = $reservations->get();

        // Get blocks for this date
        $blocks = BlockReservation::where('date', $date)->get();

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
                $blockEnd = Carbon::parse($block->end_time);
                $slotStart = Carbon::parse($slot->start_time);

                if ($slotStart->between($blockStart, $blockEnd->subMinute())) {
                    $isBlocked = true;
                    break;
                }
            }

            // If slot is available (not reserved and not blocked)
            if (! $isReserved && ! $isBlocked && $slot->status === 'available') {
                $availableSlots[] = $slot->start_time;
            }
        }

        return $availableSlots;
    }
}
