<?php

namespace Tests\Feature;

use App\Mail\CartReservationsCreated;
use App\Models\PaymentIntent;
use App\Models\Price;
use App\Models\SlotHold;
use App\Models\User;
use App\Models\UserReservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class OnlinePayCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.onlinepay.payment_mode' => 'onlinepay',
            'services.onlinepay.base_url' => 'https://au.gsc.verifone.cloud',
            'services.onlinepay.user_id' => 'test-user',
            'services.onlinepay.api_key' => 'test-key',
            'services.onlinepay.entity_id' => 'entity-123',
            'services.onlinepay.ppc_id' => 'ppc-123',
            'services.onlinepay.threeds_id' => '3ds-123',
            'services.onlinepay.hold_minutes' => 30,
            'services.onlinepay.admin_email' => 'admin@example.com',
        ]);
    }

    public function test_successful_onlinepay_webhook_creates_accepted_reservation(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-123',
                'url' => 'https://pay.example.test/checkout-123',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $checkout = $this->postJson(route('payments.onlinepay.checkout'), $this->singlePayload($price, $date));

        $checkout
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('checkout_url', 'https://pay.example.test/checkout-123');

        $this->assertSame(0, UserReservation::count());
        $this->assertGreaterThan(0, SlotHold::count());

        $intent = PaymentIntent::firstOrFail();

        $this->postJson(route('webhooks.onlinepay'), $this->successWebhook($intent, 'event-1'))
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payment_intents', [
            'id' => $intent->id,
            'status' => 'paid',
        ]);

        $this->assertDatabaseHas('user_reservations', [
            'price_id' => $price->id,
            'reservation_date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Accepted',
        ]);

        $this->assertDatabaseHas('payment_reservations', [
            'payment_intent_id' => $intent->id,
            'user_reservation_id' => UserReservation::first()->id,
        ]);

        $this->assertSame(0, SlotHold::count());
        Mail::assertSent(\App\Mail\ReservationCreated::class, 2);
    }

    public function test_duplicate_success_webhook_does_not_create_duplicate_reservations(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-duplicate',
                'url' => 'https://pay.example.test/checkout-duplicate',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), $this->singlePayload($price, $date))
            ->assertCreated();

        $intent = PaymentIntent::firstOrFail();
        $payload = $this->successWebhook($intent, 'event-duplicate');

        $this->postJson(route('webhooks.onlinepay'), $payload)->assertOk();
        $this->postJson(route('webhooks.onlinepay'), $payload)
            ->assertOk()
            ->assertJsonPath('duplicate', true);

        $this->assertSame(1, UserReservation::count());
    }

    public function test_checkout_transaction_success_webhook_creates_reservation(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-standard-event',
                'url' => 'https://pay.example.test/checkout-standard-event',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), $this->singlePayload($price, $date))
            ->assertCreated();

        $intent = PaymentIntent::firstOrFail();

        $this->postJson(route('webhooks.onlinepay'), [
            'objectType' => 'StandardEvent',
            'eventId' => 'event-standard-checkout-success',
            'eventType' => 'CheckoutTransactionSuccess',
            'recordId' => $intent->westpac_checkout_id,
            'itemId' => $intent->westpac_checkout_id,
            'entityUid' => 'entity-123',
            'source' => 'CheckoutService',
        ])->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('payment_intents', [
            'id' => $intent->id,
            'status' => 'paid',
        ]);

        $this->assertSame(1, UserReservation::count());
    }

    public function test_cart_payment_creates_all_reservations_as_accepted_after_success(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-cart',
                'url' => 'https://pay.example.test/checkout-cart',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), [
            ...$this->baseCustomerPayload(),
            'booking_type' => 'cart',
            'items' => [
                ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
                ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '08:40'],
            ],
        ])->assertCreated();

        $intent = PaymentIntent::firstOrFail();

        $this->postJson(route('webhooks.onlinepay'), $this->successWebhook($intent, 'event-cart'))
            ->assertOk();

        $this->assertSame(2, UserReservation::where('status', 'Accepted')->count());
        Mail::assertSent(CartReservationsCreated::class, 2);
    }

    public function test_five_hour_bundle_payment_charges_bundle_once_and_creates_five_reservations(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-five-hour-bundle',
                'url' => 'https://pay.example.test/checkout-five-hour-bundle',
            ], 200),
        ]);

        $bundle = $this->createPrice('5 Hour Lessons', '1hr or 2hr', 340, 'Package Bundles');
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), [
            ...$this->baseCustomerPayload(),
            'booking_type' => 'cart',
            'items' => [
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '07:00'],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '08:40'],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '10:20'],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '12:00'],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '13:40'],
            ],
        ])->assertCreated();

        $intent = PaymentIntent::with('items')->firstOrFail();

        $this->assertSame(34000, $intent->amount_cents);
        $this->assertSame([34000, 0, 0, 0, 0], $intent->items->pluck('amount_cents')->all());
        $this->assertSame(20, SlotHold::count());

        $this->postJson(route('webhooks.onlinepay'), $this->successWebhook($intent, 'event-five-hour-bundle'))
            ->assertOk();

        $this->assertSame(5, UserReservation::where('status', 'Accepted')->where('price_id', $bundle->id)->count());
        $this->assertDatabaseHas('user_reservations', [
            'price_id' => $bundle->id,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Accepted',
        ]);
        Mail::assertSent(CartReservationsCreated::class, 2);
    }

    public function test_mixed_duration_five_hour_bundle_payment_charges_once_and_preserves_durations(): void
    {
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-mixed-five-hour-bundle',
                'url' => 'https://pay.example.test/checkout-mixed-five-hour-bundle',
            ], 200),
        ]);

        $bundle = $this->createPrice('5 Hour Lessons', '1hr or 2hr', 340, 'Package Bundles');
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), [
            ...$this->baseCustomerPayload(),
            'booking_type' => 'cart',
            'items' => [
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '07:00', 'duration_minutes' => 120],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '09:20', 'duration_minutes' => 120],
                ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '11:40', 'duration_minutes' => 60],
            ],
        ])->assertCreated();

        $intent = PaymentIntent::with('items')->firstOrFail();

        $this->assertSame(34000, $intent->amount_cents);
        $this->assertSame([34000, 0, 0], $intent->items->pluck('amount_cents')->all());
        $this->assertSame(['120 minutes', '120 minutes', '60 minutes'], $intent->items->pluck('package_snapshot')->pluck('duration')->all());
        $this->assertSame(18, SlotHold::count());
        $this->assertSame(300, $intent->items->first()->metadata['bundle_total_minutes']);
        $this->assertSame(3, $intent->items->first()->metadata['bundle_session_count']);
    }

    public function test_admin_reservation_index_includes_safe_payment_summary(): void
    {
        Mail::fake();
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-admin-index',
                'url' => 'https://pay.example.test/checkout-admin-index',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $this->postJson(route('payments.onlinepay.checkout'), $this->singlePayload($price, $date))
            ->assertCreated();

        $intent = PaymentIntent::firstOrFail();

        $this->postJson(route('webhooks.onlinepay'), $this->successWebhook($intent, 'event-admin-index'))
            ->assertOk();

        $paidReservation = UserReservation::where('email', 'student@example.com')->firstOrFail();
        $manualReservation = UserReservation::create([
            'price_id' => $price->id,
            'user_name' => 'Manual Student',
            'email' => 'manual@example.com',
            'phone' => '0400000001',
            'address' => 'mandurah',
            'pickup_location' => 'Manual Pickup',
            'dropoff_location' => 'Manual Dropoff',
            'package_type' => 'Standard lesson',
            'reservation_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'status' => 'Pending',
        ]);

        $response = $this->actingAs(User::factory()->create())
            ->getJson(route('ouruserreservations.index'));

        $response
            ->assertOk()
            ->assertJsonPath('success', true);

        $reservations = collect($response->json('data'));
        $paidPayload = $reservations->firstWhere('id', $paidReservation->id);
        $manualPayload = $reservations->firstWhere('id', $manualReservation->id);
        $paymentSummary = $paidPayload['payment_summary'];

        $this->assertNull($manualPayload['payment_summary']);
        $this->assertSame('OnlinePay', $paymentSummary['source']);
        $this->assertSame('paid', $paymentSummary['status']);
        $this->assertSame($intent->amount_cents, $paymentSummary['amount_cents']);
        $this->assertSame('AUD', $paymentSummary['currency']);
        $this->assertSame($intent->merchant_reference, $paymentSummary['merchant_reference']);
        $this->assertSame('checkout-admin-index', $paymentSummary['westpac_checkout_id']);
        $this->assertSame(1, $paymentSummary['linked_reservation_count']);
        $this->assertSame('Transaction Succeeded', $paymentSummary['latest_webhook_event']['event_type']);
        $this->assertSame('processed', $paymentSummary['latest_webhook_event']['status']);

        $this->assertArrayNotHasKey('westpac_checkout_url', $paymentSummary);
        $this->assertArrayNotHasKey('hold_token', $paymentSummary);
        $this->assertArrayNotHasKey('booking_payload', $paymentSummary);
        $this->assertArrayNotHasKey('customer_snapshot', $paymentSummary);
        $this->assertArrayNotHasKey('payload', $paymentSummary['latest_webhook_event']);
    }

    public function test_onlinepay_billing_address_is_capped_without_changing_booking_location(): void
    {
        Http::fake([
            'https://au.gsc.verifone.cloud/oidc/checkout-service/v2/checkout' => Http::response([
                'id' => 'checkout-long-address',
                'url' => 'https://pay.example.test/checkout-long-address',
            ], 200),
        ]);

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();
        $longPickupLocation = '123 Very Long Street Name With Extra Details Near The Shopping Centre, Mandurah, Western Australia 6210';

        $this->postJson(route('payments.onlinepay.checkout'), [
            ...$this->singlePayload($price, $date),
            'pickup_location' => $longPickupLocation,
            'dropoff_location' => $longPickupLocation,
        ])->assertCreated();

        Http::assertSent(function ($request) use ($longPickupLocation) {
            $payload = $request->data();
            $billingAddress = data_get($payload, 'customer_details.billing.address_1');

            return strlen($billingAddress) === 40
                && $billingAddress === substr($longPickupLocation, 0, 40)
                && data_get($payload, 'customer_details.billing.postal_code') === '6210';
        });

        $this->assertSame($longPickupLocation, PaymentIntent::firstOrFail()->customer_snapshot['pickup_location']);
    }

    public function test_paid_cart_return_page_clears_lesson_cart(): void
    {
        $intent = $this->createPaymentIntent('paid', 'cart');

        $this->get(route('payments.onlinepay.return', ['paymentIntent' => $intent->uuid]))
            ->assertOk()
            ->assertSee('Payment received')
            ->assertSee('wheelmaster_lesson_cart_v1', false)
            ->assertSee('let shouldClearLessonCart = true;', false)
            ->assertSee('window.localStorage.removeItem(CART_KEY);', false);
    }

    public function test_paid_non_cart_return_page_does_not_clear_lesson_cart(): void
    {
        $intent = $this->createPaymentIntent('paid', 'lesson');

        $this->get(route('payments.onlinepay.return', ['paymentIntent' => $intent->uuid]))
            ->assertOk()
            ->assertSee('Payment received')
            ->assertSee('let shouldClearLessonCart = false;', false);
    }

    public function test_unpaid_or_unbooked_cart_return_page_does_not_clear_lesson_cart_immediately(): void
    {
        foreach (['redirected', 'failed', 'cancelled', 'expired', 'paid_unbooked'] as $status) {
            $intent = $this->createPaymentIntent($status, 'cart');

            $this->get(route('payments.onlinepay.return', ['paymentIntent' => $intent->uuid]))
                ->assertOk()
                ->assertSee('let shouldClearLessonCart = false;', false);
        }
    }

    public function test_onlinepay_status_endpoint_only_allows_cart_clear_for_paid_cart_intents(): void
    {
        $paidCart = $this->createPaymentIntent('paid', 'cart');
        $paidLesson = $this->createPaymentIntent('paid', 'lesson');
        $failedCart = $this->createPaymentIntent('failed', 'cart');
        $processingCart = $this->createPaymentIntent('redirected', 'cart');

        $this->getJson(route('payments.onlinepay.status', ['paymentIntent' => $paidCart->uuid]))
            ->assertOk()
            ->assertJsonPath('status', 'paid')
            ->assertJsonPath('clear_lesson_cart', true);

        $this->getJson(route('payments.onlinepay.status', ['paymentIntent' => $paidLesson->uuid]))
            ->assertOk()
            ->assertJsonPath('status', 'paid')
            ->assertJsonPath('clear_lesson_cart', false);

        $this->getJson(route('payments.onlinepay.status', ['paymentIntent' => $failedCart->uuid]))
            ->assertOk()
            ->assertJsonPath('status', 'failed')
            ->assertJsonPath('clear_lesson_cart', false);

        $this->getJson(route('payments.onlinepay.status', ['paymentIntent' => $processingCart->uuid]))
            ->assertOk()
            ->assertJsonPath('status', 'redirected')
            ->assertJsonPath('clear_lesson_cart', false);
    }

    public function test_test_package_available_slots_route_returns_slots_for_frontend(): void
    {
        $price = $this->createPrice('Driving test package', '60 minutes', 150, 'Test Packages');
        $date = now()->addDay()->toDateString();

        $this->getJson(route('test-packages.available-slots', [
            'date' => $date,
            'price_id' => $price->id,
            'duration_minutes' => 60,
        ]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('date', $date)
            ->assertJsonPath('price_id', $price->id)
            ->assertJsonCount(19, 'available_slots')
            ->assertJsonPath('available_slots.0.time', '08:00');
    }

    private function createPrice(string $description, string $duration, int $amount, string $category = 'Driving Lessons'): Price
    {
        return Price::create([
            'description' => $description,
            'price' => $amount,
            'features' => 'Test feature',
            'duration' => $duration,
            'category' => $category,
        ]);
    }

    private function createPaymentIntent(string $status, string $bookingType): PaymentIntent
    {
        return PaymentIntent::create([
            'uuid' => (string) Str::uuid(),
            'status' => $status,
            'amount_cents' => 10000,
            'currency' => 'AUD',
            'merchant_reference' => 'WMDA-'.Str::upper(Str::random(20)),
            'customer_name' => 'Paid Student',
            'customer_email' => 'student@example.com',
            'customer_phone' => '0400000000',
            'customer_snapshot' => [
                'address' => 'mandurah',
                'pickup_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
                'dropoff_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
            ],
            'booking_payload' => [
                'booking_type' => $bookingType,
                'request' => [],
            ],
        ]);
    }

    private function singlePayload(Price $price, string $date): array
    {
        return [
            ...$this->baseCustomerPayload(),
            'booking_type' => 'lesson',
            'reservation_date' => $date,
            'price_id' => $price->id,
            'start_time' => '07:00',
        ];
    }

    private function baseCustomerPayload(): array
    {
        return [
            'user_name' => 'Paid Student',
            'email' => 'student@example.com',
            'phone' => '0400000000',
            'address' => 'mandurah',
            'pickup_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
            'dropoff_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
            'comment' => 'Paid checkout',
            'accepted_terms' => true,
        ];
    }

    private function successWebhook(PaymentIntent $intent, string $eventId): array
    {
        return [
            'eventId' => $eventId,
            'eventType' => 'Transaction Succeeded',
            'recordId' => $intent->westpac_checkout_id,
            'entityUid' => 'entity-123',
            'content' => [
                'merchant_reference' => $intent->merchant_reference,
                'currency_code' => 'AUD',
                'amount' => $intent->amount_cents,
                'transaction_status' => 'succeeded',
                'reason_code' => '0000',
            ],
        ];
    }
}
