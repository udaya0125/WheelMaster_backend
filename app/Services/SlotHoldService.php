<?php

namespace App\Services;

use App\Exceptions\BookingConflictException;
use App\Models\SlotHold;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Str;

class SlotHoldService
{
    public const SLOT_MINUTES = 20;
    public const DEFAULT_HOLD_MINUTES = 15;

    public function releaseExpired(): void
    {
        SlotHold::where('expires_at', '<=', now())->delete();
    }

    public function releaseToken(string $holdToken): void
    {
        SlotHold::where('hold_token', $holdToken)->delete();
    }

    public function activeHoldExists(
        string $date,
        Carbon $start,
        Carbon $end,
        ?string $exceptToken = null
    ): bool {
        $segments = self::segmentsForWindow($start, $end);

        if (empty($segments)) {
            return false;
        }

        return SlotHold::active()
            ->forDate($date)
            ->whereIn('segment_start', $segments)
            ->when($exceptToken, fn ($query) => $query->where('hold_token', '!=', $exceptToken))
            ->exists();
    }

    public function acquire(
        string $date,
        Carbon $start,
        Carbon $end,
        ?string $holdToken = null,
        int $holdMinutes = self::DEFAULT_HOLD_MINUTES
    ): string {
        $this->releaseExpired();

        $holdToken ??= (string) Str::uuid();
        $expiresAt = now()->addMinutes($holdMinutes);

        foreach (self::segmentsForWindow($start, $end) as $segmentStart) {
            try {
                SlotHold::create([
                    'hold_token' => $holdToken,
                    'reservation_date' => $date,
                    'segment_start' => $segmentStart,
                    'expires_at' => $expiresAt,
                ]);
            } catch (QueryException $exception) {
                if ($this->isUniqueConstraintViolation($exception)) {
                    throw new BookingConflictException('Selected time slot is no longer available.');
                }

                throw $exception;
            }
        }

        return $holdToken;
    }

    public static function segmentsForWindow(Carbon $start, Carbon $end): array
    {
        $segments = [];
        $current = $start->copy()->seconds(0);

        while ($current < $end) {
            $segments[] = $current->format('H:i:s');
            $current->addMinutes(self::SLOT_MINUTES);
        }

        return $segments;
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return ($exception->errorInfo[0] ?? null) === '23000';
    }
}
