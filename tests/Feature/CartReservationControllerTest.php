<?php

namespace Tests\Feature;

use App\Mail\CartReservationsCreated;
use App\Models\BlockReservation;
use App\Models\Price;
use App\Models\SlotHold;
use App\Models\UserReservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CartReservationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_checkout_creates_multiple_reservations_and_sends_summary_emails(): void
    {
        Mail::fake();

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '08:40'],
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');

        $this->assertSame(2, UserReservation::count());
        $this->assertDatabaseHas('user_reservations', [
            'price_id' => $price->id,
            'reservation_date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Pending',
        ]);

        Mail::assertSent(CartReservationsCreated::class, 2);
    }

    public function test_unavailable_cart_item_rejects_entire_checkout(): void
    {
        Mail::fake();

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        UserReservation::create([
            'price_id' => $price->id,
            'user_name' => 'Existing Student',
            'email' => 'existing@example.com',
            'phone' => '0400000000',
            'address' => 'mandurah',
            'pickup_location' => 'Pickup',
            'dropoff_location' => 'Dropoff',
            'package_type' => 'Standard lesson',
            'reservation_date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Pending',
        ]);

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '08:40'],
        ]));

        $response
            ->assertConflict()
            ->assertJsonPath('success', false);

        $this->assertSame(1, UserReservation::count());
        Mail::assertNothingSent();
    }

    public function test_duplicate_or_overlapping_cart_items_are_rejected_without_creating_rows(): void
    {
        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:20'],
        ]));

        $response
            ->assertConflict()
            ->assertJsonPath('success', false);

        $this->assertSame(0, UserReservation::count());
    }

    public function test_cart_checkout_supports_different_normal_lesson_types(): void
    {
        $oneHour = $this->createPrice('One hour lesson', '1 hour', 100);
        $twoHour = $this->createPrice('Two hour lesson', '2 hours', 180);
        $date = now()->addDay()->toDateString();

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $oneHour->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $twoHour->id, 'reservation_date' => $date, 'start_time' => '08:40'],
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('total_amount', 280);

        $this->assertDatabaseHas('user_reservations', [
            'price_id' => $twoHour->id,
            'start_time' => '08:40:00',
            'end_time' => '10:40:00',
        ]);
    }

    public function test_five_hour_bundle_cart_checkout_creates_five_one_hour_reservations_for_bundle_price(): void
    {
        Mail::fake();

        $bundle = $this->createPrice('5 Hour Lessons', '1hr or 2hr', 340, 'Package Bundles');
        $date = now()->addDay()->toDateString();

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '08:40'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '10:20'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '12:00'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '13:40'],
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('total_amount', 340)
            ->assertJsonCount(5, 'data');

        $this->assertSame(5, UserReservation::where('price_id', $bundle->id)->count());
        $this->assertDatabaseHas('user_reservations', [
            'price_id' => $bundle->id,
            'reservation_date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Pending',
        ]);

        Mail::assertSent(CartReservationsCreated::class, 2);
    }

    public function test_five_hour_bundle_cart_checkout_supports_mixed_one_and_two_hour_lessons(): void
    {
        Mail::fake();

        $combinations = [
            [[120, '07:00'], [120, '09:20'], [60, '11:40']],
            [[120, '07:00'], [60, '09:20'], [60, '10:40'], [60, '12:00']],
            [[60, '07:00'], [60, '08:20'], [60, '09:40'], [60, '11:00'], [60, '12:20']],
        ];

        foreach ($combinations as $index => $combination) {
            $bundle = $this->createPrice("5 Hour Lessons {$index}", '1hr or 2hr', 340, 'Package Bundles');
            $date = now()->addDays($index + 1)->toDateString();
            $items = collect($combination)->map(fn ($selection) => [
                'price_id' => $bundle->id,
                'reservation_date' => $date,
                'start_time' => $selection[1],
                'duration_minutes' => $selection[0],
            ])->all();

            $this->postJson(route('ourreservations.cart'), $this->payload($items))
                ->assertCreated()
                ->assertJsonPath('total_amount', 340)
                ->assertJsonCount(count($combination), 'data');
        }

        $this->assertDatabaseHas('user_reservations', [
            'start_time' => '07:00:00',
            'end_time' => '09:00:00',
        ]);
    }

    public function test_five_hour_bundle_cart_checkout_requires_exactly_five_total_hours(): void
    {
        $bundle = $this->createPrice('5 Hour Lessons', '1hr or 2hr', 340, 'Package Bundles');
        $date = now()->addDay()->toDateString();

        $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '08:40'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '10:20'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '12:00'],
        ]))
            ->assertConflict()
            ->assertJsonPath('errors.items.0', 'The 5 hour lesson bundle requires selected 1-hour and 2-hour lessons totaling exactly 5 hours.');

        $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '08:40'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '10:20'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '12:00'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '13:40'],
            ['price_id' => $bundle->id, 'reservation_date' => $date, 'start_time' => '15:20'],
        ]))
            ->assertConflict()
            ->assertJsonPath('errors.items.5', 'The 5 hour lesson bundle requires selected 1-hour and 2-hour lessons totaling exactly 5 hours.');

        $this->assertSame(0, UserReservation::count());
    }

    public function test_five_hour_bundle_rejects_unsupported_session_duration(): void
    {
        $bundle = $this->createPrice('5 Hour Lessons', '1hr or 2hr', 340, 'Package Bundles');

        $this->postJson(route('ourreservations.cart'), $this->payload([[
            'price_id' => $bundle->id,
            'reservation_date' => now()->addDay()->toDateString(),
            'start_time' => '07:00',
            'duration_minutes' => 90,
        ]]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.duration_minutes');
    }

    public function test_blocked_cart_item_rejects_entire_checkout(): void
    {
        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        BlockReservation::create([
            'date' => $date,
            'start_time' => '08:40:00',
            'end_time' => '09:40:00',
            'duration' => 1,
            'reason' => 'Admin block',
        ]);

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '08:40'],
        ]));

        $response->assertConflict();
        $this->assertSame(0, UserReservation::count());
    }

    public function test_active_slot_hold_rejects_cart_checkout(): void
    {
        Mail::fake();

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        SlotHold::create([
            'hold_token' => 'payment-checkout-token',
            'reservation_date' => $date,
            'segment_start' => '07:00:00',
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
        ]));

        $response
            ->assertConflict()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.items.0', 'This time slot is temporarily held by another checkout.');

        $this->assertSame(0, UserReservation::count());
        Mail::assertNothingSent();
    }

    public function test_expired_slot_hold_is_released_before_cart_checkout(): void
    {
        Mail::fake();

        $price = $this->createPrice('Standard lesson', '1 hour', 100);
        $date = now()->addDay()->toDateString();

        SlotHold::create([
            'hold_token' => 'expired-payment-checkout-token',
            'reservation_date' => $date,
            'segment_start' => '07:00:00',
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->postJson(route('ourreservations.cart'), $this->payload([
            ['price_id' => $price->id, 'reservation_date' => $date, 'start_time' => '07:00'],
        ]));

        $response
            ->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertSame(1, UserReservation::count());
        $this->assertSame(0, SlotHold::count());
    }

    public function test_single_booking_rejects_time_reserved_by_different_package(): void
    {
        Mail::fake();

        $existingPrice = $this->createPrice('Standard lesson', '1 hour', 100);
        $newPrice = $this->createPrice('Premium lesson', '1 hour', 120);
        $date = now()->addDay()->toDateString();

        UserReservation::create([
            'price_id' => $existingPrice->id,
            'user_name' => 'Existing Student',
            'email' => 'existing@example.com',
            'phone' => '0400000000',
            'address' => 'mandurah',
            'pickup_location' => 'Pickup',
            'dropoff_location' => 'Dropoff',
            'package_type' => 'Standard lesson',
            'reservation_date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '08:00:00',
            'status' => 'Pending',
        ]);

        $response = $this->postJson(route('ourreservations.store'), [
            'user_name' => 'New Student',
            'email' => 'new@example.com',
            'phone' => '0400000001',
            'address' => 'mandurah',
            'pickup_location' => 'Pickup',
            'dropoff_location' => 'Dropoff',
            'reservation_date' => $date,
            'start_time' => '07:20',
            'end_time' => '08:20',
            'price_id' => $newPrice->id,
            'package_type' => 'Premium lesson',
            'package_price' => 120,
            'duration_minutes' => 60,
            'accepted_terms' => true,
        ]);

        $response
            ->assertConflict()
            ->assertJsonPath('message', 'Selected time slot is already reserved');

        $this->assertSame(1, UserReservation::count());
        Mail::assertNothingSent();
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

    private function payload(array $items): array
    {
        return [
            'user_name' => 'Cart Student',
            'email' => 'student@example.com',
            'phone' => '0400000000',
            'address' => 'mandurah',
            'pickup_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
            'dropoff_location' => '7 Lakes Close, Mandurah, Western Australia 6210',
            'comment' => 'Cart checkout',
            'accepted_terms' => true,
            'items' => $items,
        ];
    }
}
