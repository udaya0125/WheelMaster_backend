<?php

namespace App\Services;

use App\Mail\GiftVoucherMail;
use App\Mail\VoucherPurchasedMail;
use App\Models\PaymentIntent;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VoucherPaymentService
{
    public function finalize(PaymentIntent $intent): void
    {
        if (Voucher::where('payment_intent_id', $intent->id)->exists()) {
            return;
        }

        $details = data_get($intent->booking_payload, 'voucher', []);

        $voucher = DB::transaction(function () use ($intent, $details) {
            $voucher = Voucher::create([
                'payment_intent_id' => $intent->id,
                'price_id'          => $details['price_id'] ?? null,
                'code'              => Voucher::generateCode(),
                'amount'            => $intent->amount_cents / 100,
                'balance'           => $intent->amount_cents / 100,
                'status'            => 'active',
                'buyer_name'        => $details['buyer_name'] ?? $intent->customer_name,
                'buyer_email'       => $details['buyer_email'] ?? $intent->customer_email,
                'recipient_email'   => $details['recipient_email'] ?? $intent->customer_email,
                'message'           => $details['message'] ?? null,
                'expires_at'        => now()->addMonths(6),
            ]);

            $intent->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            return $voucher;
        });

        $this->sendConfirmationEmails($voucher);

        Log::info('Voucher created and confirmation emails sent', [
            'voucher_id' => $voucher->id,
            'code'       => $voucher->code,
            'buyer'      => $voucher->buyer_email,
            'recipient'  => $voucher->recipient_email,
        ]);
    }

    private function sendConfirmationEmails(Voucher $voucher): void
    {
        try {
            // Always email the buyer a receipt
            Mail::to($voucher->buyer_email)->send(new VoucherPurchasedMail($voucher));

            // Only send a separate "you've been gifted" email if the recipient
            // is a different person — otherwise the buyer already has the code
            // via their own receipt above.
            if ($voucher->recipient_email && $voucher->recipient_email !== $voucher->buyer_email) {
                Mail::to($voucher->recipient_email)->send(new GiftVoucherMail($voucher));
            }
        } catch (\Throwable $e) {
            // Don't let a mail failure undo the voucher — it's already paid for
            // and valid. Log it so it can be resent manually if needed.
            Log::error('Voucher confirmation email failed to send.', [
                'voucher_id' => $voucher->id,
                'error'      => $e->getMessage(),
            ]);
        }
    }
}