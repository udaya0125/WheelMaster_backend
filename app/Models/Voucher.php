<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Voucher extends Model
{
    //
    // protected $fillable = [
    //     'payment_intent_id', 'code', 'amount', 'balance', 'status', 'recipient_name', 'recipient_email', 'message', 'purchased_by', 'redeemed_by', 'redeemed_at', 'expires_at',
    // ];

    protected $fillable = [
        'payment_intent_id', 'price_id', 'code', 'amount', 'balance', 'status',
        'buyer_name', 'buyer_email', 'recipient_email', 'message',
        'redeemed_by', 'redeemed_at', 'expires_at',
    ];


    // ADD THIS — without it, expires_at/redeemed_at come back as plain strings,
    // and Carbon methods like isFuture() will fail.
    protected $casts = [
        'expires_at'  => 'datetime',
        'redeemed_at' => 'datetime',
        'amount'      => 'decimal:2',
        'balance'     => 'decimal:2',
    ];

    // The payment that funded this voucher
    public function paymentIntent()
    {
        return $this->belongsTo(PaymentIntent::class);
    }

    // The price package this voucher was purchased for
    public function price()
    {
        return $this->belongsTo(Price::class);
    }

    // Who bought this voucher
    public function purchaser()
    {
        return $this->belongsTo(User::class, 'purchased_by');
    }

    // Who redeemed this voucher
    public function redeemer()
    {
        return $this->belongsTo(User::class, 'redeemed_by');
    }

    // // Generate a unique voucher code

    // Generate a unique voucher code
    public static function generateCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('code', $code)->exists());

        return $code;
    }
    // public static function generateCode(): string
    // {
    //     do {
    //         $code = 'GIFT-' . strtoupper(Str::random(8));
    //     } while (self::where('code', $code)->exists());

    //     return $code;
    // }

    // Check if this voucher can still be used
    public function isValid(): bool
    {
        return $this->status === 'active'
            && $this->balance > 0
            && (! $this->expires_at || $this->expires_at->isFuture());
    }

    // Deduct this voucher's balance and mark it accordingly
    public function redeem(float $amount, ?string $redeemedByEmail = null): void
    {
        $this->balance = max(0, $this->balance - $amount);
        $this->status = $this->balance <= 0 ? 'used' : 'active';
        $this->redeemed_by = $redeemedByEmail;
        $this->redeemed_at = now();
        $this->save();
    }
}
