<?php

namespace App\Http\Controllers;

use App\Exceptions\OnlinePayException;
use App\Models\PaymentIntent;
use App\Models\Price;
use App\Models\Voucher;
use App\Services\OnlinePayClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class VoucherController extends Controller
{
    /**
     * Vouchers issued from the dashboard do not have a payment intent. They are
     * intentional, admin-issued credits and are active immediately.
     */
    public function index()
    {
        return response()->json([
            'vouchers' => Voucher::with('price:id,description,price')
                ->latest()
                ->get(),
            'packageOptions' => $this->voucherEligiblePackages(),
        ]);
    }

    public function store(Request $request)
    {
        // Keep manually-entered codes in the same uppercase format as the
        // model-generated codes before applying format/uniqueness validation.
        $request->merge([
            'code' => strtoupper((string) $request->input('code')),
        ]);

        $validated = $request->validate([
            'price_id'        => 'required|integer|exists:prices,id',
            'code'            => ['required', 'string', 'size:8', 'regex:/^[A-Z0-9]{8}$/', 'unique:vouchers,code'],
            'buyer_name'      => 'required|string|max:100',
            'buyer_email'     => 'required|email|max:255',
            'recipient_email' => 'nullable|email|max:255',
            'message'         => 'nullable|string',
        ]);

        $price = Price::findOrFail($validated['price_id']);
        $this->ensureVoucherEligiblePackage($price);

        $voucher = DB::transaction(function () use ($validated, $price) {
            return Voucher::create([
                'price_id'        => $price->id,
                'code'            => $validated['code'],
                'amount'          => $price->price,
                'balance'         => $price->price,
                'status'          => 'active',
                'buyer_name'      => $validated['buyer_name'],
                'buyer_email'     => $validated['buyer_email'],
                'recipient_email' => $validated['recipient_email'] ?? $validated['buyer_email'],
                'message'         => $validated['message'] ?? null,
                'expires_at'      => now()->addYear(),
            ]);
        });

        return response()->json([
            'message' => 'Voucher created successfully without payment.',
            'voucher' => $voucher->load('price:id,description,price'),
        ], 201);
    }

    public function generateCode()
    {
        return response()->json([
            'code' => Voucher::generateCode(),
        ]);
    }

    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'buyer_name'      => 'required|string|max:100',
            'buyer_email'     => 'required|email|max:255',
            'recipient_email' => 'nullable|email|max:255',
            'message'         => 'nullable|string',
            'status'          => 'required|in:active,used,expired,cancelled',
        ]);

        $voucher->update([
            ...$validated,
            'recipient_email' => $validated['recipient_email'] ?? $validated['buyer_email'],
        ]);

        return response()->json([
            'message' => 'Voucher updated successfully.',
            'voucher' => $voucher->fresh()->load('price:id,description,price'),
        ]);
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();

        return response()->json([
            'message' => 'Voucher deleted successfully.',
        ]);
    }

    public function create()
    {
        return Inertia::render('Vouchers/Create', [
            'packageOptions' => $this->voucherEligiblePackages(),
        ]);
    }

    public function checkout(Request $request, OnlinePayClient $onlinePay)
    {
        if (config('services.onlinepay.payment_mode') !== 'onlinepay') {
            return response()->json([
                'success' => false,
                'message' => 'Online payments are not enabled.',
            ], 409);
        }

        $validated = $request->validate([
            'buyer_name'      => 'required|string|max:100',
            'buyer_email'     => 'required|email',
            'price_id'        => 'required|integer|exists:prices,id',
            'recipient_email' => 'nullable|email',
            'message'         => 'nullable|string',
        ]);

        $price = Price::findOrFail($validated['price_id']);
        $recipientEmail = $validated['recipient_email'] ?? $validated['buyer_email'];

        $intent = PaymentIntent::create([
            'uuid'               => (string) Str::uuid(),
            'status'             => 'pending',
            'amount_cents'       => (int) round($price->price * 100),
            'currency'           => config('services.onlinepay.currency', 'AUD'),
            'merchant_reference' => 'VOUCHER-' . Str::upper(Str::random(10)),
            'customer_name'      => $validated['buyer_name'],
            'customer_email'     => $validated['buyer_email'],
            'booking_payload'    => [
                'type'    => 'voucher',
                'voucher' => [
                    'price_id'        => $price->id,
                    'buyer_name'      => $validated['buyer_name'],
                    'buyer_email'     => $validated['buyer_email'],
                    'recipient_email' => $recipientEmail,
                    'message'         => $validated['message'] ?? null,
                ],
            ],
            'expires_at' => now()->addMinutes((int) config('services.onlinepay.hold_minutes', 30)),
        ]);

        try {
            $checkout = $onlinePay->createCheckout($intent);
        } catch (OnlinePayException $exception) {
            $intent->update(['status' => 'failed', 'failed_at' => now()]);

            return response()->json([
                'success' => false,
                'message' => 'Secure payment could not be started. Please try again.',
            ], $exception->statusCode());
        }

        $intent->update([
            'status'               => 'redirected',
            'westpac_checkout_id'  => $checkout['id'],
            'westpac_checkout_url' => $checkout['url'],
        ]);

        return response()->json([
            'success'        => true,
            'payment_intent' => $intent->uuid,
            'checkout_url'   => $checkout['url'],
        ], 201);
    }

    // public function validateCode(Request $request)
    // {
    //     $request->validate(['code' => 'required|string']);

    //     $voucher = Voucher::where('code', $request->code)->first();

    //     if (! $voucher || ! $voucher->isValid()) {
    //         return response()->json(['valid' => false, 'message' => 'Invalid or expired voucher code.'], 422);
    //     }

    //     return response()->json(['valid' => true, 'code' => $voucher->code, 'balance' => $voucher->balance]);
    // }

    public function validateCode(Request $request)
{
    $request->validate([
        'code'     => 'required|string',
        'price_id' => 'nullable|integer|exists:prices,id',
    ]);

    $voucher = Voucher::where('code', $request->code)->first();

    if (! $voucher || ! $voucher->isValid()) {
        return response()->json([
            'valid'   => false,
            'message' => 'Invalid or expired voucher code.',
        ], 422);
    }

    $priceId = $request->input('price_id');

    // Voucher tied to a specific package must match exactly
    if ($priceId && $voucher->price_id && (int) $voucher->price_id !== (int) $priceId) {
        return response()->json([
            'valid'   => false,
            'message' => 'This voucher was purchased for a different package and can\'t be used for this booking.',
        ], 422);
    }

    $price = $priceId ? \App\Models\Price::find($priceId) : null;
    $coversFullAmount = $price ? $voucher->balance >= $price->price : null;

    if ($price && ! $coversFullAmount) {
        return response()->json([
            'valid'   => false,
            'message' => 'This voucher\'s remaining balance doesn\'t cover the full price of this package.',
        ], 422);
    }

    return response()->json([
        'valid'    => true,
        'code'     => $voucher->code,
        'balance'  => $voucher->balance,
        'price_id' => $voucher->price_id,
    ]);
}

    // Same "bookable package" filter PriceController uses, so vouchers only
    // ever cover real, purchasable packages — not test-only or malformed entries
    private function voucherEligiblePackages()
    {
        return Price::all(['id', 'description', 'price', 'duration', 'category', 'slug'])
            ->filter(fn ($price) => $price->isCartBookableLessonPackage())
            ->values();
    }

    private function ensureVoucherEligiblePackage(Price $price): void
    {
        if (! $price->isCartBookableLessonPackage()) {
            throw ValidationException::withMessages([
                'price_id' => 'Choose a package that can be booked with a voucher.',
            ]);
        }
    }
}
