<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentIntent extends Model
{
    protected $fillable = [
        'uuid',
        'status',
        'amount_cents',
        'currency',
        'merchant_reference',
        'westpac_checkout_id',
        'westpac_checkout_url',
        'hold_token',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_snapshot',
        'booking_payload',
        'expires_at',
        'paid_at',
        'failed_at',
    ];

    protected $casts = [
        'customer_snapshot' => 'array',
        'booking_payload' => 'array',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function items(): HasMany
    {
        return $this->hasMany(PaymentIntentItem::class);
    }

    public function webhookEvents(): HasMany
    {
        return $this->hasMany(PaymentWebhookEvent::class);
    }

    public function reservations(): BelongsToMany
    {
        return $this->belongsToMany(
            UserReservation::class,
            'payment_reservations',
            'payment_intent_id',
            'user_reservation_id'
        )->withTimestamps();
    }
}
