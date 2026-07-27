<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReservation extends Model
{
    protected $fillable = [
        'payment_intent_id',
        'user_reservation_id',
    ];

    public function paymentIntent(): BelongsTo
    {
        return $this->belongsTo(PaymentIntent::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(UserReservation::class, 'user_reservation_id');
    }
}
