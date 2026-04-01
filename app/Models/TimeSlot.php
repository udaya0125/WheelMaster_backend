<?php
// app/Models/TimeSlot.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TimeSlot extends Model
{
    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'status'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string'
    ];

    /**
     * Get available slots for a specific date
     */
    public static function getAvailableSlotsForDate($date)
    {
        return self::where('date', $date)
            ->where('status', 'available')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Generate default time slots (7:00 AM to 6:00 PM, 20-min intervals)
     */
    // public static function generateDefaultSlotsForDate($date)
    // {
    //     $start = Carbon::createFromTime(7, 0, 0);
    //     $end = Carbon::createFromTime(18, 0, 0);
    //     $slots = [];

    //     while ($start < $end) {
    //         $slotStart = $start->format('H:i:s');
    //         $slotEnd = $start->copy()->addMinutes(30)->format('H:i:s');
            
    //         $slots[] = [
    //             'date' => $date,
    //             'start_time' => $slotStart,
    //             'end_time' => $slotEnd,
    //             'status' => 'available',
    //             'created_at' => now(),
    //             'updated_at' => now()
    //         ];
            
    //         $start->addMinutes(30);
    //     }
        
    //     return $slots;
    // }

     // In TimeSlot.php - This is already set to 20 minutes
public static function generateDefaultSlotsForDate($date)
{
    $start = Carbon::createFromTime(7, 0, 0);
    $end = Carbon::createFromTime(18, 0, 0);
    $slots = [];

    while ($start < $end) {
        $slotStart = $start->format('H:i:s');
        $slotEnd = $start->copy()->addMinutes(20)->format('H:i:s');  // 20-minute intervals
        
        $slots[] = [
            'date' => $date,
            'start_time' => $slotStart,
            'end_time' => $slotEnd,
            'status' => 'available',
            'created_at' => now(),
            'updated_at' => now()
        ];
        
        $start->addMinutes(20);  // Add 20 minutes for next slot
    }
    
    return $slots;
}

    /**
     * Initialize time slots for a date range
     */
    public static function initializeForDateRange($startDate, $endDate)
    {
        $dates = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        while ($current <= $end) {
            $dateStr = $current->format('Y-m-d');
            
            // Check if slots already exist for this date
            $existingCount = self::where('date', $dateStr)->count();
            
            // Only generate if no slots exist
            if ($existingCount === 0) {
                $slots = self::generateDefaultSlotsForDate($dateStr);
                self::insert($slots);
                $dates[] = $dateStr;
            }
            
            $current->addDay();
        }
        
        return $dates;
    }

    /**
     * Update time slots from a specific time onwards
     * Keeps slots before the cut-off time unchanged
     */
    // public static function updateFromTimeOnwards($date, $cutoffTime)
    // {
    //     // Parse the cutoff time
    //     $cutoff = Carbon::parse($cutoffTime);
        
    //     // Get all existing slots for this date
    //     $existingSlots = self::where('date', $date)
    //         ->orderBy('start_time')
    //         ->get();
        
    //     // Separate slots into before and after cutoff
    //     $beforeCutoff = [];
    //     $afterCutoff = [];
        
    //     foreach ($existingSlots as $slot) {
    //         $slotTime = Carbon::parse($slot->start_time);
    //         if ($slotTime < $cutoff) {
    //             $beforeCutoff[] = $slot;
    //         } else {
    //             $afterCutoff[] = $slot;
    //         }
    //     }
        
    //     // Delete all slots after the cutoff time
    //     if (!empty($afterCutoff)) {
    //         $afterIds = collect($afterCutoff)->pluck('id')->toArray();
    //         self::whereIn('id', $afterIds)->delete();
    //     }
        
    //     // Generate new slots starting from the cutoff time
    //     $start = $cutoff->copy();
    //     $end = Carbon::createFromTime(18, 0, 0); // End at 6:00 PM
    //     $newSlots = [];

    //     while ($start < $end) {
    //         $slotStart = $start->format('H:i:s');
    //         $slotEnd = $start->copy()->addMinutes(30)->format('H:i:s');
            
    //         // Check if this slot already exists in beforeCutoff (shouldn't, but just in case)
    //         $exists = collect($beforeCutoff)->contains(function($slot) use ($slotStart) {
    //             return $slot->start_time == $slotStart;
    //         });
            
    //         if (!$exists) {
    //             $newSlots[] = [
    //                 'date' => $date,
    //                 'start_time' => $slotStart,
    //                 'end_time' => $slotEnd,
    //                 'status' => 'available',
    //                 'created_at' => now(),
    //                 'updated_at' => now()
    //             ];
    //         }
            
    //         $start->addMinutes(30);
    //     }
        
    //     // Insert new slots
    //     if (!empty($newSlots)) {
    //         self::insert($newSlots);
    //     }
        
    //     // Return all slots for the date (before cutoff + new ones)
    //     return self::where('date', $date)
    //         ->orderBy('start_time')
    //         ->get();
    // }


        public static function updateFromTimeOnwards($date, $cutoffTime)
    {
        // Parse the cutoff time
        $cutoff = Carbon::parse($cutoffTime);
        
        // Get all existing slots for this date
        $existingSlots = self::where('date', $date)
            ->orderBy('start_time')
            ->get();
        
        // Separate slots into before and after cutoff
        $beforeCutoff = [];
        $afterCutoff = [];
        
        foreach ($existingSlots as $slot) {
            $slotTime = Carbon::parse($slot->start_time);
            if ($slotTime < $cutoff) {
                $beforeCutoff[] = $slot;
            } else {
                $afterCutoff[] = $slot;
            }
        }
        
        // Delete all slots after the cutoff time
        if (!empty($afterCutoff)) {
            $afterIds = collect($afterCutoff)->pluck('id')->toArray();
            self::whereIn('id', $afterIds)->delete();
        }
        
        // Generate new slots starting from the cutoff time
        $start = $cutoff->copy();
        $end = Carbon::createFromTime(18, 0, 0); // End at 6:00 PM
        $newSlots = [];

        while ($start < $end) {
            $slotStart = $start->format('H:i:s');
            $slotEnd = $start->copy()->addMinutes(20)->format('H:i:s');
            
            // Check if this slot already exists in beforeCutoff (shouldn't, but just in case)
            $exists = collect($beforeCutoff)->contains(function($slot) use ($slotStart) {
                return $slot->start_time == $slotStart;
            });
            
            if (!$exists) {
                $newSlots[] = [
                    'date' => $date,
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'status' => 'available',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
            
            $start->addMinutes(20);
        }
        
        // Insert new slots
        if (!empty($newSlots)) {
            self::insert($newSlots);
        }
        
        // Return all slots for the date (before cutoff + new ones)
        return self::where('date', $date)
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Mark a slot as reserved
     */
    public function markAsReserved()
    {
        $this->status = 'reserved';
        $this->save();
        
        return $this;
    }

    /**
     * Check if a time range overlaps with any reserved or blocked slots
     */
    public static function hasOverlap($date, $startTime, $endTime, $excludeId = null)
    {
        $query = self::where('date', $date)
            ->where(function($q) use ($startTime, $endTime) {
                $q->where(function($inner) use ($startTime, $endTime) {
                    $inner->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                });
            })
            ->whereIn('status', ['reserved', 'blocked']);
            
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get formatted time for display
     */
    public function getFormattedStartTimeAttribute()
    {
        return Carbon::parse($this->start_time)->format('g:i A');
    }

    public function getFormattedEndTimeAttribute()
    {
        return Carbon::parse($this->end_time)->format('g:i A');
    }

    /**
     * Scope for date range
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    
}