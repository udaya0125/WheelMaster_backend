<?php

namespace App\Http\Controllers;

use App\Models\TimeSlot;
use App\Models\UserReservation;
use App\Models\BlockReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TimeSlotController extends Controller
{
    /**
     * Display time slot management page
     */
    public function index(Request $request)
    {
        $date = $request->get('date', Carbon::now()->format('Y-m-d'));
        
        // Initialize slots for this date if they don't exist
        TimeSlot::initializeForDateRange($date, $date);
        
        // Get slots for the selected date
        $timeSlots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();
            
        // Get reservations for this date to show which slots are booked
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();
            
        // Get blocks for this date
        $blocks = BlockReservation::where('date', $date)->get();
        
        // Mark slots as reserved or blocked
        foreach ($timeSlots as $slot) {
            // Check if reserved
            foreach ($reservations as $reservation) {
                if ($slot->start_time == $reservation->start_time) {
                    $slot->status = 'reserved';
                    $slot->reservation_details = $reservation;
                    break;
                }
            }
            
            // Check if blocked (if not already reserved)
            if ($slot->status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd = Carbon::parse($block->end_time);
                    $slotStart = Carbon::parse($slot->start_time);
                    
                    if ($slotStart->between($blockStart, $blockEnd->subMinute())) {
                        $slot->status = 'blocked';
                        $slot->block_details = $block;
                        break;
                    }
                }
            }
        }
        
        return view('admin.time-slots.index', compact('timeSlots', 'date'));
    }

    /**
     * Get slots for a specific date (API endpoint)
     */
    public function getSlotsForDate(Request $request)
    {
        $date = $request->get('date', Carbon::now()->format('Y-m-d'));
        
        // Initialize if needed
        TimeSlot::initializeForDateRange($date, $date);
        
        $slots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();
            
        // Get ALL reservations for this date (regardless of price_id)
        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();
            
        $blocks = BlockReservation::where('date', $date)->get();
        
        // Get the default 7:00 AM slots for reference
        $defaultSlots = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();
        
        $formattedSlots = $slots->map(function($slot) use ($reservations, $blocks, $defaultStartTimes) {
            $status = $slot->status;
            $slotTime = $slot->start_time;
            
            // Check if this slot time is reserved by ANY reservation
            foreach ($reservations as $reservation) {
                $reservationStart = Carbon::parse($reservation->start_time);
                $reservationEnd = Carbon::parse($reservation->end_time);
                $slotStart = Carbon::parse($slot->start_time);
                $slotEnd = Carbon::parse($slot->end_time);
                
                // Check if this 20-minute slot falls within any reservation
                if ($slotStart->between($reservationStart, $reservationEnd->subMinute()) ||
                    $slotEnd->between($reservationStart, $reservationEnd->subMinute()) ||
                    ($slotStart <= $reservationStart && $slotEnd >= $reservationEnd)) {
                    $status = 'reserved';
                    break;
                }
            }
            
            // Check if blocked (if not already reserved)
            if ($status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd = Carbon::parse($block->end_time);
                    $slotStart = Carbon::parse($slot->start_time);
                    $slotEnd = Carbon::parse($slot->end_time);
                    
                    if ($slotStart->between($blockStart, $blockEnd->subMinute()) ||
                        $slotEnd->between($blockStart, $blockEnd->subMinute()) ||
                        ($slotStart <= $blockStart && $slotEnd >= $blockEnd)) {
                        $status = 'blocked';
                        break;
                    }
                }
            }
            
            return [
                'id' => $slot->id,
                'start_time' => substr($slot->start_time, 0, 5), // Return only HH:MM
                'end_time' => substr($slot->end_time, 0, 5),
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end' => $slot->formatted_end_time,
                'status' => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing' => false
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'date' => $date,
            'slots' => $formattedSlots,
        ]);
    }

    /**
     * Mark a time slot as reserved after booking
     */
    public static function markSlotAsReserved($date, $startTime, $durationMinutes = 20)
    {
        // Initialize time slots for this date if they don't exist
        TimeSlot::initializeForDateRange($date, $date);
        
        // If duration is more than 20 minutes, mark multiple slots
        if ($durationMinutes > 20) {
            $startTimeCarbon = Carbon::parse($startTime);
            $endTimeCarbon = $startTimeCarbon->copy()->addMinutes($durationMinutes);
            
            $currentTime = $startTimeCarbon->copy();
            
            while ($currentTime < $endTimeCarbon) {
                $timeSlot = TimeSlot::where('date', $date)
                    ->where('start_time', $currentTime->format('H:i:s'))
                    ->first();
                
                if ($timeSlot) {
                    $timeSlot->status = 'reserved';
                    $timeSlot->save();
                }
                
                $currentTime->addMinutes(20);
            }
            
            return true;
        } else {
            // Mark single slot
            $timeSlot = TimeSlot::where('date', $date)
                ->where('start_time', $startTime)
                ->first();
            
            if ($timeSlot) {
                $timeSlot->status = 'reserved';
                $timeSlot->save();
                return true;
            }
        }
        
        return false;
    }

    /**
     * Update a single time slot and regenerate subsequent slots
     */
    public function updateSingleSlot(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'old_time' => 'required|date_format:H:i:s',
            'new_time' => 'required|date_format:H:i',
            'index' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $date = $request->date;
            $oldTime = $request->old_time;
            $newTime = $request->new_time . ':00';
            $targetIndex = $request->index;

            // Validate time range (7:00 AM to 6:00 PM)
            $newTimeCarbon = Carbon::parse($newTime);
            $minTime = Carbon::createFromTime(7, 0, 0);
            $maxTime = Carbon::createFromTime(18, 0, 0);
            
            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and 6:00 PM'
                ], 422);
            }

            // Get all slots for the date
            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            // Verify the target slot exists and matches the old time
            if (!isset($allSlots[$targetIndex]) || $allSlots[$targetIndex]->start_time !== $oldTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot not found or has been modified'
                ], 404);
            }

            // Check if the new time conflicts with any existing slot
            $timeExists = $allSlots->where('start_time', $newTime)->where('id', '!=', $allSlots[$targetIndex]->id)->isNotEmpty();
            if ($timeExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'A slot at this time already exists'
                ], 422);
            }

            // Check if the slot is reserved or blocked
            $targetSlot = $allSlots[$targetIndex];
            
            // Check reservations
            $isReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $oldTime)
                ->where('status', '!=', 'Rejected')
                ->exists();
                
            if ($isReserved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a reserved time slot'
                ], 422);
            }
            
            // Check blocks
            $isBlocked = BlockReservation::where('date', $date)
                ->where('start_time', '<=', $oldTime)
                ->where('end_time', '>', $oldTime)
                ->exists();
                
            if ($isBlocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a blocked time slot'
                ], 422);
            }

            // Update the target slot
            $targetSlot->start_time = $newTime;
            $targetSlot->end_time = Carbon::parse($newTime)->addMinutes(20)->format('H:i:s');
            $targetSlot->save();

            // Regenerate subsequent slots with 20-minute intervals
            $currentTime = Carbon::parse($newTime)->addMinutes(20);
            
            for ($i = $targetIndex + 1; $i < $allSlots->count(); $i++) {
                $slot = $allSlots[$i];
                
                // Check if this slot is reserved or blocked before updating
                $isSubsequentReserved = UserReservation::where('reservation_date', $date)
                    ->where('start_time', $slot->start_time)
                    ->where('status', '!=', 'Rejected')
                    ->exists();
                    
                $isSubsequentBlocked = BlockReservation::where('date', $date)
                    ->where('start_time', '<=', $slot->start_time)
                    ->where('end_time', '>', $slot->start_time)
                    ->exists();
                
                // Only update if not reserved or blocked
                if (!$isSubsequentReserved && !$isSubsequentBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }
                
                $currentTime->addMinutes(20);
            }

            // Get updated slots
            $updatedSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
                'slots' => $updatedSlots,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slot: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update availability from a specific time onwards
     */
    public function updateAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $selectedTime = Carbon::parse($request->start_time);
        $minTime = Carbon::createFromTime(7, 0);
        $maxTime = Carbon::createFromTime(17, 40); // Changed to allow for 20-minute slots until 6:00 PM
        
        if ($selectedTime < $minTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time cannot be earlier than 7:00 AM'
            ], 422);
        }
        
        if ($selectedTime > $maxTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time must allow for 20-minute slots until 6:00 PM'
            ], 422);
        }

        try {
            // Get existing slots before updating
            $existingSlots = TimeSlot::where('date', $request->date)
                ->orderBy('start_time')
                ->get();
            
            // Find slots before the selected time
            $slotsBeforeSelected = $existingSlots->filter(function($slot) use ($selectedTime) {
                return Carbon::parse($slot->start_time) < $selectedTime;
            });
            
            // Update slots from the selected time onwards
            $allSlots = TimeSlot::updateFromTimeOnwards(
                $request->date,
                $request->start_time
            );

            return response()->json([
                'success' => true,
                'message' => 'Time slots updated successfully from ' . $selectedTime->format('g:i A') . ' onwards',
                'data' => [
                    'slots_before' => $slotsBeforeSelected->values(),
                    'all_slots' => $allSlots,
                    'modified_from' => $request->start_time
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset to default slots (7:00 AM start)
     */
    public function resetToDefault(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Delete existing slots
            TimeSlot::where('date', $request->date)->delete();
            
            // Generate default slots
            $slots = TimeSlot::generateDefaultSlotsForDate($request->date);
            TimeSlot::insert($slots);

            return response()->json([
                'success' => true,
                'message' => 'Reset to default 7:00 AM start time',
                'data' => $slots
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resetting time slots: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a single time slot and automatically adjust all subsequent slots
     */
    public function updateSingleSlotWithSubsequent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'start_index' => 'required|integer',
            'new_start_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $date = $request->date;
            $startIndex = $request->start_index;
            $newStartTime = $request->new_start_time . ':00';

            $newTimeCarbon = Carbon::parse($newStartTime);
            $minTime = Carbon::createFromTime(7, 0, 0);
            $maxTime = Carbon::createFromTime(18, 0, 0);
            
            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and 6:00 PM'
                ], 422);
            }

            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            if (!isset($allSlots[$startIndex])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot not found'
                ], 404);
            }

            $targetSlot = $allSlots[$startIndex];

            // Check if the slot is reserved or blocked
            $isReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $targetSlot->start_time)
                ->where('status', '!=', 'Rejected')
                ->exists();
                
            if ($isReserved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a reserved time slot'
                ], 422);
            }
            
            $isBlocked = BlockReservation::where('date', $date)
                ->where('start_time', '<=', $targetSlot->start_time)
                ->where('end_time', '>', $targetSlot->start_time)
                ->exists();
                
            if ($isBlocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a blocked time slot'
                ], 422);
            }

            // Check if the new time conflicts with any existing slot
            $timeExists = $allSlots->where('start_time', $newStartTime)
                ->where('id', '!=', $targetSlot->id)
                ->isNotEmpty();
                
            if ($timeExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'A slot at this time already exists'
                ], 422);
            }

            // Update the target slot and all subsequent slots
            $currentTime = Carbon::parse($newStartTime);
            
            for ($i = $startIndex; $i < $allSlots->count(); $i++) {
                $slot = $allSlots[$i];
                
                $isSlotReserved = UserReservation::where('reservation_date', $date)
                    ->where('start_time', $slot->start_time)
                    ->where('status', '!=', 'Rejected')
                    ->exists();
                    
                $isSlotBlocked = BlockReservation::where('date', $date)
                    ->where('start_time', '<=', $slot->start_time)
                    ->where('end_time', '>', $slot->start_time)
                    ->exists();
                
                if (!$isSlotReserved && !$isSlotBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }
                
                $currentTime->addMinutes(20);
            }

            $updatedSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Time slots updated successfully from ' . Carbon::parse($newStartTime)->format('g:i A') . ' onwards',
                'slots' => $updatedSlots,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: ' . $e->getMessage()
            ], 500);
        }
    }
}