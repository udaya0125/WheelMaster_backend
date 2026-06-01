<?php

namespace App\Http\Controllers;

use App\Models\BlockReservation;
use App\Models\TimeSlot;
use App\Models\UserReservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TimeSlotController extends Controller
{
    private const SLOT_MINUTES = 20;

    private const DEFAULT_START_TIME = '07:00:00';

    private const DEFAULT_END_TIME = '18:00:00';

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
                    $slot->status = 'reserved';
                    $slot->reservation_details = $reservation;
                    break;
                }
            }

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
        $priceId = $request->get('price_id');

        TimeSlot::initializeForDateRange($date, $date);

        $slots = TimeSlot::where('date', $date)
            ->orderBy('start_time')
            ->get();

        $reservationsQuery = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected');

        if ($priceId) {
            $reservationsQuery->where('price_id', $priceId);
        }

        $reservations = $reservationsQuery->get();

        $blocks = BlockReservation::where('date', $date)->get();
        $durationMinutes = $this->getDurationMinutesForPrice($priceId);

        $defaultSlots = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

        $formattedSlots = $slots->map(function ($slot) use ($reservations, $blocks, $defaultStartTimes, $date, $priceId, $durationMinutes) {
            $status = $slot->status;
            $slotStart = Carbon::parse($slot->start_time);
            $slotEnd = Carbon::parse($slot->end_time);

            foreach ($reservations as $reservation) {
                $resStart = Carbon::parse($reservation->start_time);
                $resEnd = Carbon::parse($reservation->end_time);

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
                    $blockEnd = Carbon::parse($block->end_time);

                    if ($slotStart->between($blockStart, $blockEnd->subMinute()) ||
                        $slotEnd->between($blockStart, $blockEnd->subMinute()) ||
                        ($slotStart <= $blockStart && $slotEnd >= $blockEnd)) {
                        $status = 'blocked';
                        break;
                    }
                }
            }

            if ($status === 'available' && $priceId && ! $this->isBookableForDuration($date, $priceId, $slotStart, $durationMinutes)) {
                $status = 'blocked';
            }

            return [
                'id' => $slot->id,
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end' => $slot->formatted_end_time,
                'status' => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing' => false,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'date' => $date,
            'slots' => $formattedSlots,
            'current_start' => optional($slots->first())->start_time
                ? substr($slots->first()->start_time, 0, 5)
                : substr(self::DEFAULT_START_TIME, 0, 5),
            'current_end' => optional($slots->last())->end_time
                ? substr($slots->last()->end_time, 0, 5)
                : substr(self::DEFAULT_END_TIME, 0, 5),
        ]);
    }

    private function getDurationMinutesForPrice($priceId)
    {
        if (! $priceId) {
            return 20;
        }

        $price = \App\Models\Price::find($priceId);

        return $this->parseDurationToMinutes($price?->duration);
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

    private function isBookableForDuration($date, $priceId, Carbon $startTime, $durationMinutes)
    {
        $bufferEnd = $startTime->copy()
            ->addMinutes($durationMinutes)
            ->addMinutes(self::SLOT_MINUTES);

        if ($bufferEnd > $this->getScheduleEndForDate($date)) {
            return false;
        }

        $hasBlock = BlockReservation::where('date', $date)
            ->where('start_time', '<', $bufferEnd->format('H:i:s'))
            ->where('end_time', '>', $startTime->format('H:i:s'))
            ->exists();

        if ($hasBlock) {
            return false;
        }

        return ! UserReservation::where('reservation_date', $date)
            ->where('price_id', $priceId)
            ->where('status', '!=', 'Rejected')
            ->get()
            ->contains(function ($reservation) use ($startTime, $bufferEnd) {
                $existingStart = Carbon::parse($reservation->start_time);
                $existingBufferEnd = Carbon::parse($reservation->end_time)->addMinutes(20);

                return $existingStart < $bufferEnd && $existingBufferEnd > $startTime;
            });
    }

    private function getScheduleEndForDate($date)
    {
        $lastEndTime = TimeSlot::where('date', $date)
            ->orderByDesc('end_time')
            ->value('end_time');

        return Carbon::parse($lastEndTime ?: self::DEFAULT_END_TIME);
    }

    /**
     * Shared helper: build formatted slots with live reservation/block overlay
     */
    private function buildFormattedSlots($date, $updatedSlots)
    {
        $defaultSlots = TimeSlot::generateDefaultSlotsForDate($date);
        $defaultStartTimes = collect($defaultSlots)->pluck('start_time')->toArray();

        $reservations = UserReservation::where('reservation_date', $date)
            ->where('status', '!=', 'Rejected')
            ->get();

        $blocks = BlockReservation::where('date', $date)->get();

        return $updatedSlots->map(function ($slot) use ($reservations, $blocks, $defaultStartTimes) {
            $status = $slot->status;
            $slotStart = Carbon::parse($slot->start_time);
            $slotEnd = Carbon::parse($slot->end_time);

            // Overlay reservations
            foreach ($reservations as $reservation) {
                $resStart = Carbon::parse($reservation->start_time);
                $resEnd = Carbon::parse($reservation->end_time);

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
                    $blockEnd = Carbon::parse($block->end_time);

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
                'start_time' => substr($slot->start_time, 0, 5),
                'end_time' => substr($slot->end_time, 0, 5),
                'formatted_start' => $slot->formatted_start_time,
                'formatted_end' => $slot->formatted_end_time,
                'status' => $status,
                'is_default_time' => in_array($slot->start_time, $defaultStartTimes),
                'isEditing' => false,
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
            'date' => 'required|date',
            'old_time' => 'required|date_format:H:i:s',
            'new_time' => 'required|date_format:H:i',
            'index' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $date = $request->date;
            $oldTime = $request->old_time;
            $newTime = $request->new_time.':00';
            $targetIndex = $request->index;

            $newTimeCarbon = Carbon::parse($newTime);
            $minTime = Carbon::createFromTime(7, 0, 0);
            $maxTime = $this->getScheduleEndForDate($date)->subMinutes(self::SLOT_MINUTES);

            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and '.$maxTime->format('g:i A'),
                ], 422);
            }

            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            if (! isset($allSlots[$targetIndex]) || $allSlots[$targetIndex]->start_time !== $oldTime) {
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
            $targetSlot->end_time = Carbon::parse($newTime)->addMinutes(20)->format('H:i:s');
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

                if (! $isSubsequentReserved && ! $isSubsequentBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }

                $currentTime->addMinutes(20);
            }

            $updatedSlots = TimeSlot::where('date', $date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Time slot updated successfully',
                'slots' => $formattedSlots,
                'current_start' => substr($updatedSlots->first()->start_time, 0, 5),
                'current_end' => substr($updatedSlots->last()->end_time, 0, 5),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slot: '.$e->getMessage(),
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
                'errors' => $validator->errors(),
            ], 422);
        }

        $selectedTime = Carbon::parse($request->start_time);
        $minTime = Carbon::createFromTime(7, 0);
        $maxTime = Carbon::createFromTime(17, 40);

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
                'message' => 'Time slots updated successfully from '.$selectedTime->format('g:i A').' onwards',
                'data' => [
                    'slots_before' => $slotsBeforeSelected->values(),
                    'all_slots' => $allSlots,
                    'modified_from' => $request->start_time,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the schedule end time for a date by trimming or appending slots.
     */
    public function updateEndTime(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'end_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $date = $request->date;
            $newEnd = Carbon::parse($request->end_time);

            TimeSlot::initializeForDateRange($date, $date);

            $slots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            $firstStart = Carbon::parse($slots->first()?->start_time ?: self::DEFAULT_START_TIME);
            $minutesFromStart = (int) $firstStart->diffInMinutes($newEnd, false);

            if ($minutesFromStart < self::SLOT_MINUTES) {
                return response()->json([
                    'success' => false,
                    'message' => 'End time must be at least 20 minutes after the first slot.',
                ], 422);
            }

            if ($minutesFromStart % self::SLOT_MINUTES !== 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'End time must align with the 20-minute slot interval.',
                ], 422);
            }

            $newEndTime = $newEnd->format('H:i:s');
            $currentEnd = $this->getScheduleEndForDate($date);

            if ($newEnd < $currentEnd) {
                $hasReservationAfterEnd = UserReservation::where('reservation_date', $date)
                    ->where(function ($query) {
                        $query->whereNull('status')
                            ->orWhere('status', '!=', 'Rejected');
                    })
                    ->where('end_time', '>', $newEndTime)
                    ->exists();

                if ($hasReservationAfterEnd) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot shorten the day because a reservation extends past the new end time.',
                    ], 422);
                }

                TimeSlot::where('date', $date)
                    ->where('end_time', '>', $newEndTime)
                    ->delete();
            }

            $lastEndTime = TimeSlot::where('date', $date)
                ->orderByDesc('end_time')
                ->value('end_time');

            $currentTime = Carbon::parse($lastEndTime ?: $firstStart->format('H:i:s'));

            while ($currentTime < $newEnd) {
                TimeSlot::create([
                    'date' => $date,
                    'start_time' => $currentTime->format('H:i:s'),
                    'end_time' => $currentTime->copy()->addMinutes(self::SLOT_MINUTES)->format('H:i:s'),
                    'status' => 'available',
                ]);

                $currentTime->addMinutes(self::SLOT_MINUTES);
            }

            $updatedSlots = TimeSlot::where('date', $date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Schedule end time updated to '.$newEnd->format('g:i A'),
                'slots' => $formattedSlots,
                'current_start' => substr($updatedSlots->first()->start_time, 0, 5),
                'current_end' => substr($updatedSlots->last()->end_time, 0, 5),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating end time: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Replace the schedule for every date in a range.
     */
    public function updateDateRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->startOfDay();

        if ($startDate->diffInDays($endDate) > 365) {
            return response()->json([
                'success' => false,
                'message' => 'Date range cannot exceed 365 days.',
            ], 422);
        }

        $scheduleStart = Carbon::parse($request->start_time);
        $scheduleEnd = Carbon::parse($request->end_time);
        $scheduleMinutes = (int) $scheduleStart->diffInMinutes($scheduleEnd, false);

        if ($scheduleStart < Carbon::parse(self::DEFAULT_START_TIME)) {
            return response()->json([
                'success' => false,
                'message' => 'Start time cannot be earlier than 7:00 AM.',
            ], 422);
        }

        if ($scheduleMinutes < self::SLOT_MINUTES) {
            return response()->json([
                'success' => false,
                'message' => 'End time must be at least 20 minutes after start time.',
            ], 422);
        }

        if ($scheduleMinutes % self::SLOT_MINUTES !== 0) {
            return response()->json([
                'success' => false,
                'message' => 'The schedule must align with the 20-minute slot interval.',
            ], 422);
        }

        $scheduleStartTime = $scheduleStart->format('H:i:s');
        $scheduleEndTime = $scheduleEnd->format('H:i:s');
        $conflictingReservation = UserReservation::whereBetween('reservation_date', [
            $startDate->toDateString(),
            $endDate->toDateString(),
        ])
            ->where(function ($query) {
                $query->whereNull('status')
                    ->orWhere('status', '!=', 'Rejected');
            })
            ->where(function ($query) use ($scheduleStartTime, $scheduleEndTime) {
                $query->where('start_time', '<', $scheduleStartTime)
                    ->orWhere('end_time', '>', $scheduleEndTime);
            })
            ->orderBy('reservation_date')
            ->orderBy('start_time')
            ->first();

        if ($conflictingReservation) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot apply this schedule because a reservation on '.
                    Carbon::parse($conflictingReservation->reservation_date)->format('M j, Y').
                    ' falls outside the selected hours.',
            ], 422);
        }

        try {
            $updatedDays = DB::transaction(function () use ($startDate, $endDate, $scheduleStart, $scheduleEnd) {
                $updatedDays = 0;
                $date = $startDate->copy();

                while ($date->lte($endDate)) {
                    $dateString = $date->toDateString();
                    TimeSlot::where('date', $dateString)->delete();
                    TimeSlot::insert($this->generateSlotsForSchedule($dateString, $scheduleStart, $scheduleEnd));
                    $updatedDays++;
                    $date->addDay();
                }

                return $updatedDays;
            });

            return response()->json([
                'success' => true,
                'message' => $updatedDays.' day(s) updated to '.
                    $scheduleStart->format('g:i A').' - '.$scheduleEnd->format('g:i A'),
                'updated_days' => $updatedDays,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating date range: '.$e->getMessage(),
            ], 500);
        }
    }

    private function generateSlotsForSchedule($date, Carbon $scheduleStart, Carbon $scheduleEnd)
    {
        $slots = [];
        $currentTime = $scheduleStart->copy();

        while ($currentTime < $scheduleEnd) {
            $slots[] = [
                'date' => $date,
                'start_time' => $currentTime->format('H:i:s'),
                'end_time' => $currentTime->copy()->addMinutes(self::SLOT_MINUTES)->format('H:i:s'),
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $currentTime->addMinutes(self::SLOT_MINUTES);
        }

        return $slots;
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
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            TimeSlot::where('date', $request->date)->delete();

            $slots = TimeSlot::generateDefaultSlotsForDate($request->date);
            TimeSlot::insert($slots);

            $updatedSlots = TimeSlot::where('date', $request->date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($request->date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Reset to default 7:00 AM start time',
                'slots' => $formattedSlots,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resetting time slots: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a slot and cascade changes both forward and backward
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
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $date = $request->date;
            $startIndex = $request->start_index;
            $newStartTime = $request->new_start_time.':00';

            $newTimeCarbon = Carbon::parse($newStartTime);
            $minTime = Carbon::createFromTime(7, 0, 0);
            $maxTime = $this->getScheduleEndForDate($date)->subMinutes(self::SLOT_MINUTES);

            if ($newTimeCarbon < $minTime || $newTimeCarbon > $maxTime) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time must be between 7:00 AM and '.$maxTime->format('g:i A'),
                ], 422);
            }

            $allSlots = TimeSlot::where('date', $date)
                ->orderBy('start_time')
                ->get();

            if (! isset($allSlots[$startIndex])) {
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

                if (! $isSlotReserved && ! $isSlotBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time = $currentTime->copy()->addMinutes(20)->format('H:i:s');
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

                if (! $isSlotReserved && ! $isSlotBlocked) {
                    $slot->start_time = $currentTime->format('H:i:s');
                    $slot->end_time = $currentTime->copy()->addMinutes(20)->format('H:i:s');
                    $slot->save();
                }

                $currentTime->subMinutes(20);
            }

            // ── Return refreshed slots with live reservation/block overlay ────
            $updatedSlots = TimeSlot::where('date', $date)->orderBy('start_time')->get();
            $formattedSlots = $this->buildFormattedSlots($date, $updatedSlots);

            return response()->json([
                'success' => true,
                'message' => 'Time slots updated from '.Carbon::parse($newStartTime)->format('g:i A').' (both directions)',
                'slots' => $formattedSlots,
                'current_start' => substr($updatedSlots->first()->start_time, 0, 5),
                'current_end' => substr($updatedSlots->last()->end_time, 0, 5),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating time slots: '.$e->getMessage(),
            ], 500);
        }
    }
}
