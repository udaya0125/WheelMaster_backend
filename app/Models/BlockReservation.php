<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class BlockReservation extends Model
{
    public const DRIVER_GAP_MINUTES = 20;

    protected $fillable = [
        'date', 'start_time', 'end_time', 'duration', 'reason',
    ];

    public function bufferedEndTime(int $bufferMinutes = self::DRIVER_GAP_MINUTES): Carbon
    {
        return Carbon::parse($this->end_time)->addMinutes($bufferMinutes);
    }

    public static function overlapsDrivingWindow(
        $date,
        Carbon $startTime,
        Carbon $endTime,
        int $bufferMinutes = self::DRIVER_GAP_MINUTES
    ): bool {
        return self::where('date', $date)
            ->get()
            ->contains(function (self $block) use ($startTime, $endTime, $bufferMinutes) {
                $blockStart = Carbon::parse($block->start_time);
                $blockEnd = $block->bufferedEndTime($bufferMinutes);

                return $blockStart < $endTime && $blockEnd > $startTime;
            });
    }
}
