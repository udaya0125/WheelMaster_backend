<?php
// app/Http/Controllers/TimeSlotController.php

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
            
        // Get reservations to mark booked slots
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
            
            // Check if this slot time exists in default slots
            $isDefaultTime = in_array($slotTime, $defaultStartTimes);
            
            // Override status if reserved
            foreach ($reservations as $reservation) {
                if ($slot->start_time == $reservation->start_time) {
                    $status = 'reserved';
                    break;
                }
            }
            
            // Override status if blocked (and not reserved)
            if ($status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd = Carbon::parse($block->end_time);
                    $slotStart = Carbon::parse($slot->start_time);
                    
                    if ($slotStart->between($blockStart, $blockEnd->subMinute())) {
                        $status = 'blocked';
                        break;
                    }
                }
            }
            
            return [
                'id' => $slot->id,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end' => $slot->formatted_end_time,
                'status' => $status,
                'is_default_time' => $isDefaultTime,
                'isEditing' => false // Add this for frontend state
            ];
        });
        
        // Find where the custom schedule starts
        $firstNonDefaultSlot = null;
        foreach ($formattedSlots as $index => $slot) {
            if (!$slot['is_default_time']) {
                $firstNonDefaultSlot = [
                    'time' => $slot['start_time'],
                    'formatted' => $slot['formatted_start'],
                    'index' => $index
                ];
                break;
            }
        }
        
        return response()->json([
            'success' => true,
            'date' => $date,
            'default_start' => '07:00',
            'current_start' => $slots->first() ? substr($slots->first()->start_time, 0, 5) : '07:00',
            'slots' => $formattedSlots,
            'custom_start_info' => $firstNonDefaultSlot ? [
                'starts_at' => $firstNonDefaultSlot['time'],
                'formatted' => $firstNonDefaultSlot['formatted'],
                'index' => $firstNonDefaultSlot['index']
            ] : null
        ]);
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
            $newTime = $request->new_time . ':00'; // Add seconds
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

            // Check if the new time conflicts with any existing slot (excluding the current one)
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
            $targetSlot->end_time = Carbon::parse($newTime)->addMinutes(30)->format('H:i:s');
            $targetSlot->save();

            // Regenerate subsequent slots with 30-minute intervals
            $currentTime = Carbon::parse($newTime)->addMinutes(30);
            
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
                    $slot->end_time = $currentTime->copy()->addMinutes(30)->format('H:i:s');
                    $slot->save();
                }
                
                $currentTime->addMinutes(30);
            }

            // Get updated slots
            $updatedSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            // Get default slots for comparison
            $defaultSlots = TimeSlot::generateDefaultSlotsForDate($date);
            $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

            // Format slots for response
            $formattedSlots = $updatedSlots->map(function($slot) use ($date, $defaultStartTimes) {
                // Check current status
                $status = $slot->status;
                
                $isReserved = UserReservation::where('reservation_date', $date)
                    ->where('start_time', $slot->start_time)
                    ->where('status', '!=', 'Rejected')
                    ->exists();
                    
                if ($isReserved) {
                    $status = 'reserved';
                } else {
                    $isBlocked = BlockReservation::where('date', $date)
                        ->where('start_time', '<=', $slot->start_time)
                        ->where('end_time', '>', $slot->start_time)
                        ->exists();
                        
                    if ($isBlocked) {
                        $status = 'blocked';
                    }
                }
                
                return [
                    'id' => $slot->id,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'formatted_start' => $slot->formatted_start_time,
                    'formatted_end' => $slot->formatted_end_time,
                    'status' => $status,
                    'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                    'isEditing' => false
                ];
            });

            // Find updated custom start info
            $firstNonDefaultSlot = null;
            foreach ($formattedSlots as $index => $slot) {
                if (!$slot['is_default_time']) {
                    $firstNonDefaultSlot = [
                        'time' => $slot['start_time'],
                        'formatted' => $slot['formatted_start'],
                        'index' => $index
                    ];
                    break;
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
                'slots' => $formattedSlots,
                'custom_start_info' => $firstNonDefaultSlot ? [
                    'starts_at' => $firstNonDefaultSlot['time'],
                    'formatted' => $firstNonDefaultSlot['formatted'],
                    'index' => $firstNonDefaultSlot['index']
                ] : null
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
     * Keeps slots before the selected time unchanged
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

        // Parse the selected time
        $selectedTime = Carbon::parse($request->start_time);
        $minTime = Carbon::createFromTime(7, 0);
        $maxTime = Carbon::createFromTime(17, 30);
        
        if ($selectedTime < $minTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time cannot be earlier than 7:00 AM'
            ], 422);
        }
        
        if ($selectedTime > $maxTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time must allow for 30-minute slots until 6:00 PM'
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
     * Integration method for ReservationController
     */
    public static function getAvailableSlotsForReservation($date, $priceId = null)
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
            $isReserved = $reservations->contains(function($reservation) use ($slot) {
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
            
            // If slot is available (not reserved and not blocked && $slot->status === 'available')
            if (!$isReserved && !$isBlocked) {
                $availableSlots[] = $slot->start_time;
            }
        }
        
        return $availableSlots;
    }


    /**
 * Update a single time slot and automatically adjust all subsequent slots
 * This is the new method that handles cascading updates
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
        $newStartTime = $request->new_start_time . ':00'; // Add seconds

        // Validate time range (7:00 AM to 6:00 PM)
        $newTimeCarbon = Carbon::parse($newStartTime);
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

        // Verify the target slot exists
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
        
        // Check blocks
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

        // Check if the new time conflicts with any existing slot (excluding the current one)
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
            
            // Check if this slot is reserved or blocked before updating
            $isSlotReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $slot->start_time)
                ->where('status', '!=', 'Rejected')
                ->exists();
                
            $isSlotBlocked = BlockReservation::where('date', $date)
                ->where('start_time', '<=', $slot->start_time)
                ->where('end_time', '>', $slot->start_time)
                ->exists();
            
            // Only update if not reserved or blocked
            if (!$isSlotReserved && !$isSlotBlocked) {
                $slot->start_time = $currentTime->format('H:i:s');
                $slot->end_time = $currentTime->copy()->addMinutes(30)->format('H:i:s');
                $slot->save();
            }
            
            $currentTime->addMinutes(30);
        }

        // Get updated slots
        $updatedSlots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();

        // Get default slots for comparison
        $defaultSlots = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

        // Format slots for response
        $formattedSlots = $updatedSlots->map(function($slot) use ($date, $defaultStartTimes) {
            // Check current status
            $status = $slot->status;
            
            $isReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $slot->start_time)
                ->where('status', '!=', 'Rejected')
                ->exists();
                
            if ($isReserved) {
                $status = 'reserved';
            } else {
                $isBlocked = BlockReservation::where('date', $date)
                    ->where('start_time', '<=', $slot->start_time)
                    ->where('end_time', '>', $slot->start_time)
                    ->exists();
                    
                if ($isBlocked) {
                    $status = 'blocked';
                }
            }
            
            return [
                'id' => $slot->id,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end' => $slot->formatted_end_time,
                'status' => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing' => false
            ];
        });

        // Find updated custom start info
        $firstNonDefaultSlot = null;
        foreach ($formattedSlots as $index => $slot) {
            if (!$slot['is_default_time']) {
                $firstNonDefaultSlot = [
                    'time' => $slot['start_time'],
                    'formatted' => $slot['formatted_start'],
                    'index' => $index
                ];
                break;
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Time slots updated successfully from ' . Carbon::parse($newStartTime)->format('g:i A') . ' onwards',
            'slots' => $formattedSlots,
            'custom_start_info' => $firstNonDefaultSlot ? [
                'starts_at' => $firstNonDefaultSlot['time'],
                'formatted' => $firstNonDefaultSlot['formatted'],
                'index' => $firstNonDefaultSlot['index']
            ] : null
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error updating time slots: ' . $e->getMessage()
        ], 500);
    }
}
}