<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class SlotHold extends Model
{
    protected $fillable = [
        'hold_token',
        'reservation_date',
        'segment_start',
        'expires_at',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'expires_at' => 'datetime',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->where('reservation_date', $date);
    }
}
