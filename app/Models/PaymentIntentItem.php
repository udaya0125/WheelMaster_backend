<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentIntentItem extends Model
{
    protected $fillable = [
        'payment_intent_id',
        'price_id',
        'item_type',
        'reservation_date',
        'start_time',
        'end_time',
        'test_time',
        'test_location',
        'package_type',
        'amount_cents',
        'package_snapshot',
        'metadata',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'package_snapshot' => 'array',
        'metadata' => 'array',
    ];

    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class);
    }

    public function price(): BelongsTo
    {
        return $this->belongsTo(Price::class);
    }
}
