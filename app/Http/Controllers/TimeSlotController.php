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

        TimeSlot::initializeForDateRange($date, $date);

        $timeSlots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();

        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();

        $blocks = BlockReservation::where('date', $date)->get();

        foreach ($timeSlots as $slot) {
            foreach ($reservations as $reservation) {
                if ($slot->start_time == $reservation->start_time) {
                    $slot->status             = 'reserved';
                    $slot->reservation_details = $reservation;
                    break;
                }
            }

            if ($slot->status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd   = Carbon::parse($block->end_time);
                    $slotStart  = Carbon::parse($slot->start_time);

                    if ($slotStart->between($blockStart, $blockEnd->subMinute())) {
                        $slot->status        = 'blocked';
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

        TimeSlot::initializeForDateRange($date, $date);

        $slots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();

        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();

        $blocks = BlockReservation::where('date', $date)->get();

        $defaultSlots      = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

        $formattedSlots = $slots->map(function ($slot) use ($reservations, $blocks, $defaultStartTimes) {
            $status    = $slot->status;
            $slotStart = Carbon::parse($slot->start_time);
            $slotEnd   = Carbon::parse($slot->end_time);

            foreach ($reservations as $reservation) {
                $resStart = Carbon::parse($reservation->start_time);
                $resEnd   = Carbon::parse($reservation->end_time);

                if ($slotStart->between($resStart, $resEnd->subMinute()) ||
                    $slotEnd->between($resStart, $resEnd->subMinute()) ||
                    ($slotStart <= $resStart && $slotEnd >= $resEnd)) {
                    $status = 'reserved';
                    break;
                }
            }

            if ($status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd   = Carbon::parse($block->end_time);

                    if ($slotStart->between($blockStart, $blockEnd->subMinute()) ||
                        $slotEnd->between($blockStart, $blockEnd->subMinute()) ||
                        ($slotStart <= $blockStart && $slotEnd >= $blockEnd)) {
                        $status = 'blocked';
                        break;
                    }
                }
            }

            return [
                'id'              => $slot->id,
                'start_time'      => substr($slot->start_time, 0, 5),
                'end_time'        => substr($slot->end_time, 0, 5),
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end'   => $slot->formatted_end_time,
                'status'          => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing'       => false,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'date'    => $date,
            'slots'   => $formattedSlots,
        ]);
    }

    /**
     * Shared helper: build formatted slots with live reservation/block overlay
     */
    private function buildFormattedSlots($date, $updatedSlots)
    {
        $defaultSlots      = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();

        $blocks = BlockReservation::where('date', $date)->get();

        return $updatedSlots->map(function ($slot) use ($reservations, $blocks, $defaultStartTimes) {
            $status    = $slot->status;
            $slotStart = Carbon::parse($slot->start_time);
            $slotEnd   = Carbon::parse($slot->end_time);

            // Overlay reservations
            foreach ($reservations as $reservation) {
                $resStart = Carbon::parse($reservation->start_time);
                $resEnd   = Carbon::parse($reservation->end_time);

                if ($slotStart->between($resStart, $resEnd->subMinute()) ||
                    $slotEnd->between($resStart, $resEnd->subMinute()) ||
                    ($slotStart <= $resStart && $slotEnd >= $resEnd)) {
                    $status = 'reserved';
                    break;
                }
            }

            // Overlay blocks (only if not already reserved)
            if ($status !== 'reserved') {
                foreach ($blocks as $block) {
                    $blockStart = Carbon::parse($block->start_time);
                    $blockEnd   = Carbon::parse($block->end_time);

                    if ($slotStart->between($blockStart, $blockEnd->subMinute()) ||
                        $slotEnd->between($blockStart, $blockEnd->subMinute()) ||
                        ($slotStart <= $blockStart && $slotEnd >= $blockEnd)) {
                        $status = 'blocked';
                        break;
                    }
                }
            }

            return [
                'id'              => $slot->id,
                'start_time'      => substr($slot->start_time, 0, 5),
                'end_time'        => substr($slot->end_time, 0, 5),
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end'   => $slot->formatted_end_time,
                'status'          => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing'       => false,
            ];
        })->values();
    }

    /**
     * Mark a time slot as reserved after booking
     */
    public static function markSlotAsReserved($date, $startTime, $durationMinutes = 20)
    {
        TimeSlot::initializeForDateRange($date, $date);

        if ($durationMinutes > 20) {
            $startTimeCarbon = Carbon::parse($startTime);
            $endTimeCarbon   = $startTimeCarbon->copy()->addMinutes($durationMinutes);
            $currentTime     = $startTimeCarbon->copy();

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
        }

        $timeSlot = TimeSlot::where('date', $date)
            ->where('start_time', $startTime)
            ->first();

        if ($timeSlot) {
            $timeSlot->status = 'reserved';
            $timeSlot->save();
            return true;
        }

        return false;
    }

    /**
     * Update a single time slot and regenerate subsequent slots only
     */
    public function updateSingleSlot(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'     => 'required|date',
            'old_time' => 'required|date_format:H:i:s',
            'new_time' => 'required|date_format:H:i',
            'index'    => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $date        = $request->date;
            $oldTime     = $request->old_time;
            $newTime     = $request->new_time . ':00';
            $targetIndex = $request->index;

            $newTimeCarbon = Carbon::parse($newTime);
            $minTime       = Carbon::createFromTime(7, 0, 0);
            $maxTime       = Carbon::createFromTime(18, 0, 0);

            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and 6:00 PM',
                ], 422);
            }

            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            if (!isset($allSlots[$targetIndex]) || $allSlots[$targetIndex]->start_time !== $oldTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot not found or has been modified',
                ], 404);
            }

            $timeExists = $allSlots->where('start_time', $newTime)
                ->where('id', '!=', $allSlots[$targetIndex]->id)
                ->isNotEmpty();

            if ($timeExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'A slot at this time already exists',
                ], 422);
            }

            $targetSlot = $allSlots[$targetIndex];

            $isReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $oldTime)
                ->where('status', '!=', 'Rejected')
                ->exists();

            if ($isReserved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a reserved time slot',
                ], 422);
            }

            $isBlocked = BlockReservation::where('date', $date)
                ->where('start_time', '<=', $oldTime)
                ->where('end_time', '>', $oldTime)
                ->exists();

            if ($isBlocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a blocked time slot',
                ], 422);
            }

            $targetSlot->start_time = $newTime;
            $targetSlot->end_time   = Carbon::parse($newTime)->addMinutes(20)->format('H:i:s');
            $targetSlot->save();

            $currentTime = Carbon::parse($newTime)->addMinutes(20);

            for ($i = $targetIndex + 1; $i < $allSlots->count(); $i++) {
                $slot = $allSlots[$i];

                $isSubsequentReserved = UserReservation::where('reservation_date', $date)
                    ->where('start_time', $slot->start_time)
                    ->where('status', '!=', 'Rejected')
                    ->exists();

                $isSubsequentBlocked = BlockReservation::where('date', $date)
                    ->where('start_time', '<=', $slot->start_time)
                    ->where('end_time', '>', $slot->start_time)
                    ->exists();

                if (!$isSubsequentReserved && !$isSubsequentBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time   = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }

                $currentTime->addMinutes(20);
            }

            $updatedSlots   = TimeSlot::where('date', $date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
                'slots'   => $formattedSlots,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update availability from a specific time onwards
     */
    public function updateAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'       => 'required|date',
            'start_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $selectedTime = Carbon::parse($request->start_time);
        $minTime      = Carbon::createFromTime(7, 0);
        $maxTime      = Carbon::createFromTime(17, 40);

        if ($selectedTime < $minTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time cannot be earlier than 7:00 AM',
            ], 422);
        }

        if ($selectedTime > $maxTime) {
            return response()->json([
                'success' => false,
                'message' => 'Start time must allow for 20-minute slots until 6:00 PM',
            ], 422);
        }

        try {
            $existingSlots = TimeSlot::where('date', $request->date)
                ->orderBy('start_time')
                ->get();

            $slotsBeforeSelected = $existingSlots->filter(function ($slot) use ($selectedTime) {
                return Carbon::parse($slot->start_time) < $selectedTime;
            });

            $allSlots = TimeSlot::updateFromTimeOnwards(
                $request->date,
                $request->start_time
            );

            return response()->json([
                'success' => true,
                'message' => 'Time slots updated successfully from ' . $selectedTime->format('g:i A') . ' onwards',
                'data'    => [
                    'slots_before'  => $slotsBeforeSelected->values(),
                    'all_slots'     => $allSlots,
                    'modified_from' => $request->start_time,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: ' . $e->getMessage(),
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
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            TimeSlot::where('date', $request->date)->delete();

            $slots = TimeSlot::generateDefaultSlotsForDate($request->date);
            TimeSlot::insert($slots);

            $updatedSlots   = TimeSlot::where('date', $request->date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($request->date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Reset to default 7:00 AM start time',
                'slots'   => $formattedSlots,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resetting time slots: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a slot and cascade changes both forward and backward
     */
    public function updateSingleSlotWithSubsequent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date'           => 'required|date',
            'start_index'    => 'required|integer',
            'new_start_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $date         = $request->date;
            $startIndex   = $request->start_index;
            $newStartTime = $request->new_start_time . ':00';

            $newTimeCarbon = Carbon::parse($newStartTime);
            $minTime       = Carbon::createFromTime(7, 0, 0);
            $maxTime       = Carbon::createFromTime(18, 0, 0);

            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and 6:00 PM',
                ], 422);
            }

            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            if (!isset($allSlots[$startIndex])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot not found',
                ], 404);
            }

            $targetSlot = $allSlots[$startIndex];

            // Guard: cannot edit reserved slot
            $isReserved = UserReservation::where('reservation_date', $date)
                ->where('start_time', $targetSlot->start_time)
                ->where('status', '!=', 'Rejected')
                ->exists();

            if ($isReserved) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a reserved time slot',
                ], 422);
            }

            // Guard: cannot edit blocked slot
            $isBlocked = BlockReservation::where('date', $date)
                ->where('start_time', '<=', $targetSlot->start_time)
                ->where('end_time', '>', $targetSlot->start_time)
                ->exists();

            if ($isBlocked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit a blocked time slot',
                ], 422);
            }

            // Guard: no duplicate time
            $timeExists = $allSlots->where('start_time', $newStartTime)
                ->where('id', '!=', $targetSlot->id)
                ->isNotEmpty();

            if ($timeExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'A slot at this time already exists',
                ], 422);
            }

            // ── FORWARD cascade: slot N, N+1, N+2 … ──────────────────────────
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
                    $slot->end_time   = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }

                $currentTime->addMinutes(20);
            }

            // ── BACKWARD cascade: slot N-1, N-2 … 0 ─────────────────────────
            $currentTime = Carbon::parse($newStartTime)->subMinutes(20);

            for ($i = $startIndex - 1; $i >= 0; $i--) {
                // Hard floor: never push a slot before 07:00
                if ($currentTime->format('H:i:s') < '07:00:00') {
                    break;
                }

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
                    $slot->end_time   = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }

                $currentTime->subMinutes(20);
            }

            // ── Return refreshed slots with live reservation/block overlay ────
            $updatedSlots   = TimeSlot::where('date', $date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Time slots updated from ' . Carbon::parse($newStartTime)->format('g:i A') . ' (both directions)',
                'slots'   => $formattedSlots,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: ' . $e->getMessage(),
            ], 500);
        }
    }
}