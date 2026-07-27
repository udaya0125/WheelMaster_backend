<?php

namespace App\Http\Controllers;

use App\Exceptions\BookingConflictException;
use App\Exceptions\OnlinePayException;
use App\Models\PaymentIntent;
use App\Models\PaymentWebhookEvent;
use App\Services\OnlinePayClient;
use App\Services\PaymentBookingService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Js;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function checkout(
        Request $request,
        PaymentBookingService $bookingService,
        OnlinePayClient $onlinePay
    ) {
        if (config('services.onlinepay.payment_mode') !== 'onlinepay') {
            return response()->json([
                'success' => false,
                'message' => 'Online payments are not enabled.',
            ], 409);
        }

        try {
            $intent = $bookingService->createIntentFromRequest($request);
            $checkout = $onlinePay->createCheckout($intent);

            $intent->update([
                'status' => 'redirected',
                'westpac_checkout_id' => $checkout['id'],
                'westpac_checkout_url' => $checkout['url'],
            ]);

            return response()->json([
                'success' => true,
                'payment_intent' => $intent->uuid,
                'checkout_id' => $checkout['id'],
                'checkout_url' => $checkout['url'],
            ], 201);
        } catch (BookingConflictException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'errors' => $exception->errors(),
            ], $exception->statusCode());
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (OnlinePayException $exception) {
            if (isset($intent)) {
                $bookingService->failIntent($intent);
            }

            Log::error('OnlinePay checkout creation failed.', [
                'message' => $exception->getMessage(),
                'context' => $exception->context(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Secure payment could not be started. Please try again.',
            ], $exception->statusCode());
        }
    }

    public function paymentReturn(PaymentIntent $paymentIntent)
    {
        $paymentIntent->refresh();
        $content = $this->returnContent($paymentIntent);

        return response($this->returnPage(
            $content['heading'],
            $content['message'],
            $content['status'],
            $content['clear_lesson_cart'],
            route('payments.onlinepay.status', ['paymentIntent' => $paymentIntent->uuid])
        ), 200)
            ->header('Content-Type', 'text/html');
    }

    public function status(PaymentIntent $paymentIntent)
    {
        $paymentIntent->refresh();

        return response()->json($this->returnContent($paymentIntent));
    }

    public function webhook(Request $request, PaymentBookingService $bookingService)
    {
        $payload = $request->json()->all() ?: $request->all();
        $eventId = data_get($payload, 'eventId');
        $eventType = data_get($payload, 'eventType');
        $checkoutId = data_get($payload, 'recordId') ?: data_get($payload, 'eventId');

        try {
            $event = PaymentWebhookEvent::create([
                'event_id' => $eventId,
                'event_type' => $eventType,
                'westpac_checkout_id' => $checkoutId,
                'payload' => $payload,
                'status' => 'received',
            ]);
        } catch (QueryException $exception) {
            if (($exception->errorInfo[0] ?? null) === '23000' && $eventId) {
                return response()->json(['success' => true, 'duplicate' => true]);
            }

            throw $exception;
        }

        $intent = $this->findIntentForWebhook($payload);

        if (! $intent) {
            $event->update([
                'status' => 'ignored',
                'processed_at' => now(),
            ]);

            return response()->json(['success' => true, 'ignored' => true]);
        }

        $event->update(['payment_intent_id' => $intent->id]);

        if ($this->webhookMatchesIntent($payload, $intent) === false) {
            $event->update([
                'status' => 'rejected',
                'processed_at' => now(),
            ]);

            Log::warning('OnlinePay webhook rejected because it did not match the payment intent.', [
                'payment_intent_id' => $intent->id,
                'event_id' => $eventId,
            ]);

            return response()->json(['success' => false], 422);
        }

        if ($this->isSuccessfulWebhook($payload)) {
            $bookingService->finalizeSuccessfulPayment($intent);
            $event->update([
                'status' => 'processed',
                'processed_at' => now(),
            ]);

            return response()->json(['success' => true]);
        }

        if ($this->isFailedWebhook($payload)) {
            $bookingService->failIntent($intent, 'failed');
            $event->update([
                'status' => 'processed',
                'processed_at' => now(),
            ]);

            return response()->json(['success' => true]);
        }

        $event->update([
            'status' => 'ignored',
            'processed_at' => now(),
        ]);

        return response()->json(['success' => true, 'ignored' => true]);
    }

    private function findIntentForWebhook(array $payload): ?PaymentIntent
    {
        $merchantReference = data_get($payload, 'content.merchant_reference')
            ?: data_get($payload, 'merchant_reference');

        if ($merchantReference) {
            return PaymentIntent::where('merchant_reference', $merchantReference)->first();
        }

        $checkoutId = data_get($payload, 'recordId') ?: data_get($payload, 'eventId');

        if ($checkoutId) {
            return PaymentIntent::where('westpac_checkout_id', $checkoutId)->first();
        }

        return null;
    }

    private function webhookMatchesIntent(array $payload, PaymentIntent $intent): bool
    {
        $merchantReference = data_get($payload, 'content.merchant_reference')
            ?: data_get($payload, 'merchant_reference');

        if ($merchantReference && $merchantReference !== $intent->merchant_reference) {
            return false;
        }

        $currency = data_get($payload, 'content.currency_code');

        if ($currency && strtoupper($currency) !== strtoupper($intent->currency)) {
            return false;
        }

        $amount = data_get($payload, 'content.amount');

        if ($amount !== null) {
            $numericAmount = (float) $amount;
            $amountCents = (int) round($numericAmount * 100);

            if ($amountCents !== (int) $intent->amount_cents && (int) round($numericAmount) !== (int) $intent->amount_cents) {
                return false;
            }
        }

        $entity = data_get($payload, 'entityUid');
        $configuredEntity = config('services.onlinepay.entity_id');

        if ($entity && $configuredEntity && $entity !== $configuredEntity) {
            return false;
        }

        return true;
    }

    private function isSuccessfulWebhook(array $payload): bool
    {
        $eventType = strtolower((string) data_get($payload, 'eventType'));
        $transactionStatus = strtolower((string) data_get($payload, 'content.transaction_status'));
        $reasonCode = (string) data_get($payload, 'content.reason_code');

        if (str_contains($eventType, 'failed') || str_contains($eventType, 'declined')) {
            return false;
        }

        return $eventType === 'checkouttransactionsuccess'
            || str_contains($eventType, 'transaction succeeded')
            || str_contains($eventType, 'sale approved')
            || str_contains($eventType, 'txnsaleapproved')
            || in_array($transactionStatus, ['success', 'succeeded', 'authorised', 'authorized', 'captured', 'settled'], true)
            || $reasonCode === '0000';
    }

    private function isFailedWebhook(array $payload): bool
    {
        $eventType = strtolower((string) data_get($payload, 'eventType'));
        $transactionStatus = strtolower((string) data_get($payload, 'content.transaction_status'));

        return $eventType === 'checkouttransactionfailed'
            || str_contains($eventType, 'transaction failed')
            || str_contains($eventType, 'failed')
            || str_contains($eventType, 'declined')
            || in_array($transactionStatus, ['failed', 'cancelled', 'canceled', 'declined'], true);
    }

    private function returnContent(PaymentIntent $paymentIntent): array
    {
        $heading = match ($paymentIntent->status) {
            'paid' => 'Payment received',
            'failed', 'expired', 'cancelled' => 'Payment was not completed',
            default => 'Payment is processing',
        };

        $message = match ($paymentIntent->status) {
            'paid' => 'Your booking has been confirmed. A confirmation email will arrive shortly.',
            'failed', 'expired', 'cancelled' => 'Your booking was not confirmed because the payment was not completed.',
            'paid_unbooked' => 'Your payment was received, but we need to manually confirm the booking time. We will contact you shortly.',
            default => 'We are waiting for the payment confirmation from Westpac. You can close this page once your confirmation email arrives.',
        };

        return [
            'status' => $paymentIntent->status,
            'heading' => $heading,
            'message' => $message,
            'clear_lesson_cart' => $this->shouldClearLessonCart($paymentIntent),
        ];
    }

    private function shouldClearLessonCart(PaymentIntent $paymentIntent): bool
    {
        return $paymentIntent->status === 'paid'
            && data_get($paymentIntent->booking_payload, 'booking_type') === 'cart';
    }

    private function returnPage(
        string $heading,
        string $message,
        string $status,
        bool $clearLessonCart,
        string $statusUrl
    ): string
    {
        $escapedHeading = e($heading);
        $escapedMessage = e($message);
        $statusJson = Js::from($status);
        $statusUrlJson = Js::from($statusUrl);
        $clearLessonCartJson = Js::from($clearLessonCart);

        return <<<HTML
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{$escapedHeading}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #111827; margin: 0; }
        main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
        section { max-width: 560px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; box-shadow: 0 12px 28px rgba(15, 23, 42, .08); }
        h1 { margin: 0 0 12px; font-size: 28px; }
        p { margin: 0 0 24px; line-height: 1.6; color: #4b5563; }
        a { display: inline-block; color: #fff; background: #4f46e5; padding: 12px 18px; border-radius: 6px; text-decoration: none; font-weight: 700; }
    </style>
</head>
<body>
<main>
    <section>
        <h1 id="payment-heading">{$escapedHeading}</h1>
        <p id="payment-message">{$escapedMessage}</p>
        <a href="/">Return home</a>
    </section>
</main>
<script>
(() => {
    const CART_KEY = "wheelmaster_lesson_cart_v1";
    const statusUrl = {$statusUrlJson};
    const terminalStatuses = new Set(["paid", "failed", "expired", "cancelled", "paid_unbooked"]);
    let currentStatus = {$statusJson};
    let shouldClearLessonCart = {$clearLessonCartJson};
    let attempts = 0;

    const clearLessonCart = () => {
        try {
            window.localStorage.removeItem(CART_KEY);
        } catch (error) {
            // Some browsers block localStorage; the payment result should still render.
        }
    };

    const updateContent = (payload) => {
        const heading = document.getElementById("payment-heading");
        const message = document.getElementById("payment-message");

        if (heading && payload.heading) {
            heading.textContent = payload.heading;
        }

        if (message && payload.message) {
            message.textContent = payload.message;
        }
    };

    const pollStatus = async () => {
        if (terminalStatuses.has(currentStatus) || attempts >= 20) {
            return;
        }

        attempts += 1;

        try {
            const response = await fetch(statusUrl, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            if (!response.ok) {
                window.setTimeout(pollStatus, 3000);
                return;
            }

            const payload = await response.json();
            currentStatus = payload.status || currentStatus;
            shouldClearLessonCart = Boolean(payload.clear_lesson_cart);
            updateContent(payload);

            if (shouldClearLessonCart) {
                clearLessonCart();
                return;
            }

            if (!terminalStatuses.has(currentStatus)) {
                window.setTimeout(pollStatus, 3000);
            }
        } catch (error) {
            window.setTimeout(pollStatus, 3000);
        }
    };

    if (shouldClearLessonCart) {
        clearLessonCart();
        return;
    }

    if (!terminalStatuses.has(currentStatus)) {
        window.setTimeout(pollStatus, 3000);
    }
})();
</script>
</body>
</html>
HTML;
    }
}
