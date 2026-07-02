<?php

namespace Tests\Feature;

use App\Models\BlockReservation;
use App\Models\Price;
use App\Models\SlotHold;
use App\Models\TimeSlot;
use App\Models\UserReservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimeSlotControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_can_be_applied_to_a_date_range(): void
    {
        $startDate = now()->addDay()->toDateString();
        $endDate = now()->addDays(2)->toDateString();

        $response = $this->postJson(route('ourtimeslots.update-range'), [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('updated_days', 2);

        foreach ([$startDate, $endDate] as $date) {
            $this->assertDatabaseCountForDate($date, 3);
            $this->assertDatabaseHas('time_slots', [
                'date' => $date,
                'start_time' => '08:00:00',
                'end_time' => '08:20:00',
            ]);
            $this->assertDatabaseHas('time_slots', [
                'date' => $date,
                'start_time' => '08:40:00',
                'end_time' => '09:00:00',
            ]);
        }
    }

    public function test_conflicting_reservation_prevents_the_entire_range_update(): void
    {
        $startDate = now()->addDay()->toDateString();
        $endDate = now()->addDays(2)->toDateString();

        foreach ([$startDate, $endDate] as $date) {
            TimeSlot::insert(TimeSlot::generateDefaultSlotsForDate($date));
        }

        $price = Price::create([
            'description' => 'Range update test package',
            'price' => 100,
            'features' => 'Test feature',
            'duration' => '1 hour',
        ]);

        UserReservation::create([
            'price_id' => $price->id,
            'user_name' => 'Test Driver',
            'email' => 'driver@example.com',
            'phone' => '555-0100',
            'address' => '123 Test Street',
            'package_type' => 'Range update test package',
            'reservation_date' => $endDate,
            'start_time' => '17:00:00',
            'end_time' => '18:00:00',
            'status' => null,
        ]);

        $response = $this->postJson(route('ourtimeslots.update-range'), [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'start_time' => '08:00',
            'end_time' => '17:00',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonPath('success', false);

        foreach ([$startDate, $endDate] as $date) {
            $this->assertDatabaseCountForDate($date, 33);
            $this->assertDatabaseHas('time_slots', [
                'date' => $date,
                'start_time' => '07:00:00',
            ]);
        }
    }

    public function test_duration_or_buffer_conflict_is_unavailable_without_a_block_id(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '17:20:00',
            'end_time' => '18:00:00',
            'duration' => 0.7,
            'reason' => 'End of day block',
        ]);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $price->id,
        ]));

        $slot = collect($response->json('slots'))->firstWhere('start_time', '16:20');

        $response->assertOk();
        $this->assertSame('unavailable', $slot['status']);
        $this->assertNull($slot['block_id']);
    }

    public function test_block_starting_at_buffer_end_does_not_disable_previous_lesson(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '09:40',
            'end_time' => '10:40',
            'duration' => 1,
            'reason' => 'Admin block',
        ]);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $price->id,
        ]));

        $lessonStart = collect($response->json('slots'))->firstWhere('start_time', '08:20');
        $bufferSlot = collect($response->json('slots'))->firstWhere('start_time', '09:20');
        $blockedSlot = collect($response->json('slots'))->firstWhere('start_time', '09:40');

        $response->assertOk();
        $this->assertSame('available', $lessonStart['status']);
        $this->assertSame('unavailable', $bufferSlot['status']);
        $this->assertNull($bufferSlot['block_id']);
        $this->assertSame('blocked', $blockedSlot['status']);
    }

    public function test_admin_block_end_buffer_disables_the_next_twenty_minutes(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '09:40:00',
            'end_time' => '10:40:00',
            'duration' => 1,
            'reason' => 'Admin block',
        ]);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $price->id,
        ]));

        $bufferSlot = collect($response->json('slots'))
            ->firstWhere('start_time', '10:40');
        $nextSlot = collect($response->json('slots'))
            ->firstWhere('start_time', '11:00');

        $response->assertOk();
        $this->assertSame('unavailable', $bufferSlot['status']);
        $this->assertNull($bufferSlot['block_id']);
        $this->assertSame('available', $nextSlot['status']);
    }

    public function test_booking_cannot_start_inside_admin_block_end_buffer(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '09:40:00',
            'end_time' => '10:40:00',
            'duration' => 1,
            'reason' => 'Admin block',
        ]);

        $response = $this->postJson(route('ourreservations.store'), [
            'user_name' => 'Test Student',
            'email' => 'student@example.com',
            'phone' => '555-0101',
            'address' => 'mandurah',
            'pickup_location' => 'Pickup address',
            'dropoff_location' => 'Dropoff address',
            'reservation_date' => $date,
            'start_time' => '10:40',
            'end_time' => '11:40',
            'price_id' => $price->id,
            'package_type' => 'One hour lesson',
            'package_price' => 100,
            'duration_minutes' => 60,
        ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('error', 'Selected time slot is blocked');
    }

    public function test_real_blocked_slot_includes_the_block_reservation_id(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        $block = BlockReservation::create([
            'date' => $date,
            'start_time' => '16:20:00',
            'end_time' => '17:20:00',
            'duration' => 1,
            'reason' => 'Admin block',
        ]);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $price->id,
        ]));

        $slot = collect($response->json('slots'))->firstWhere('start_time', '16:20');
        $overlappedSlot = collect($response->json('slots'))->firstWhere('start_time', '16:40');

        $response->assertOk();
        $response->assertJsonCount(1, 'blocks');
        $response->assertJsonPath('blocks.0.id', $block->id);
        $response->assertJsonPath('blocks.0.start_time', '16:20');
        $response->assertJsonPath('blocks.0.end_time', '17:20');
        $response->assertJsonPath('blocks.0.reason', 'Admin block');
        $this->assertSame('blocked', $slot['status']);
        $this->assertSame($block->id, $slot['block_id']);
        $this->assertSame('blocked', $overlappedSlot['status']);
        $this->assertSame($block->id, $overlappedSlot['block_id']);
    }

    public function test_time_slot_status_without_a_block_record_is_not_presented_as_unblockable(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        TimeSlot::initializeForDateRange($date, $date);
        TimeSlot::where('date', $date)
            ->where('start_time', '16:20:00')
            ->update(['status' => 'blocked']);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $price->id,
        ]));

        $slot = collect($response->json('slots'))->firstWhere('start_time', '16:20');

        $response->assertOk();
        $this->assertSame('unavailable', $slot['status']);
        $this->assertNull($slot['block_id']);
    }

    public function test_reservation_for_another_package_still_reserves_the_time(): void
    {
        $date = now()->addDay()->toDateString();
        $selectedPrice = $this->createPrice('Selected package', '1 hour');
        $otherPrice = $this->createPrice('Other package', '1 hour');

        UserReservation::create([
            'price_id' => $otherPrice->id,
            'user_name' => 'Test Driver',
            'email' => 'driver@example.com',
            'phone' => '555-0100',
            'address' => '123 Test Street',
            'package_type' => 'Other package',
            'reservation_date' => $date,
            'start_time' => '16:20:00',
            'end_time' => '17:20:00',
            'status' => 'Pending',
        ]);

        $response = $this->getJson(route('ourtimeslots.get', [
            'date' => $date,
            'price_id' => $selectedPrice->id,
        ]));

        $slot = collect($response->json('slots'))->firstWhere('start_time', '16:20');

        $response->assertOk();
        $this->assertSame('reserved', $slot['status']);
    }

    public function test_block_summary_marks_full_day_blocked_with_default_schedule(): void
    {
        $date = now()->addDay()->toDateString();

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '18:00:00',
            'duration' => 11,
            'reason' => 'Full day block',
        ]);

        $response = $this->getJson(route('ourtimeslots.block-summary', [
            'start_date' => $date,
            'end_date' => $date,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath("data.{$date}", 'blocked');

        $this->assertSame(0, TimeSlot::where('date', $date)->count());
    }

    public function test_block_summary_marks_partial_block_available(): void
    {
        $date = now()->addDay()->toDateString();

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '12:00:00',
            'duration' => 5,
            'reason' => 'Partial day block',
        ]);

        $response = $this->getJson(route('ourtimeslots.block-summary', [
            'start_date' => $date,
            'end_date' => $date,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}", 'available');
    }

    public function test_block_summary_can_be_available_when_no_package_can_be_booked(): void
    {
        $date = now()->addDay()->toDateString();

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '12:20:00',
            'duration' => 5.33,
            'reason' => 'Morning block',
        ]);

        BlockReservation::create([
            'date' => $date,
            'start_time' => '13:00:00',
            'end_time' => '18:10:00',
            'duration' => 5.17,
            'reason' => 'Afternoon block',
        ]);

        $response = $this->getJson(route('ourtimeslots.block-summary', [
            'start_date' => $date,
            'end_date' => $date,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}", 'available');
    }

    public function test_block_summary_marks_adjacent_blocks_covering_day_blocked(): void
    {
        $date = now()->addDay()->toDateString();

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '12:00:00',
            'duration' => 5,
            'reason' => 'Morning block',
        ]);

        BlockReservation::create([
            'date' => $date,
            'start_time' => '12:00:00',
            'end_time' => '18:00:00',
            'duration' => 6,
            'reason' => 'Afternoon block',
        ]);

        $response = $this->getJson(route('ourtimeslots.block-summary', [
            'start_date' => $date,
            'end_date' => $date,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}", 'blocked');
    }

    public function test_block_summary_uses_existing_schedule_bounds_when_present(): void
    {
        $date = now()->addDay()->toDateString();

        TimeSlot::insert([
            [
                'date' => $date,
                'start_time' => '08:00:00',
                'end_time' => '08:20:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date' => $date,
                'start_time' => '08:20:00',
                'end_time' => '08:40:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date' => $date,
                'start_time' => '08:40:00',
                'end_time' => '09:00:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        BlockReservation::create([
            'date' => $date,
            'start_time' => '08:00:00',
            'end_time' => '09:00:00',
            'duration' => 1,
            'reason' => 'Custom schedule block',
        ]);

        $response = $this->getJson(route('ourtimeslots.block-summary', [
            'start_date' => $date,
            'end_date' => $date,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}", 'blocked');
    }

    public function test_availability_summary_uses_default_slots_without_creating_rows(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath("data.{$date}.status", 'available')
            ->assertJsonPath("data.{$date}.current_end", '18:00');

        $this->assertContains('07:00', $response->json("data.{$date}.available_slots"));
        $this->assertSame(0, TimeSlot::where('date', $date)->count());
    }

    public function test_availability_summary_marks_full_admin_block_unavailable(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '18:00:00',
            'duration' => 11,
            'reason' => 'Full day block',
        ]);

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}.status", 'unavailable')
            ->assertJsonPath("data.{$date}.available_slots", []);
    }

    public function test_availability_summary_marks_split_blocks_with_too_small_gap_unavailable(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        BlockReservation::create([
            'date' => $date,
            'start_time' => '07:00:00',
            'end_time' => '12:20:00',
            'duration' => 5.33,
            'reason' => 'Morning block',
        ]);

        BlockReservation::create([
            'date' => $date,
            'start_time' => '13:00:00',
            'end_time' => '18:10:00',
            'duration' => 5.17,
            'reason' => 'Afternoon block',
        ]);

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}.status", 'unavailable')
            ->assertJsonPath("data.{$date}.available_slots", []);
    }

    public function test_availability_summary_applies_reservation_buffer_to_bookable_starts(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        UserReservation::create([
            'price_id' => $price->id,
            'user_name' => 'Test Driver',
            'email' => 'driver@example.com',
            'phone' => '555-0100',
            'address' => '123 Test Street',
            'package_type' => 'One hour lesson',
            'reservation_date' => $date,
            'start_time' => '09:40:00',
            'end_time' => '10:40:00',
            'status' => 'Pending',
        ]);

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $slots = $response->json("data.{$date}.available_slots");

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}.status", 'available');
        $this->assertContains('08:20', $slots);
        $this->assertNotContains('08:40', $slots);
        $this->assertNotContains('10:40', $slots);
        $this->assertContains('11:00', $slots);
    }

    public function test_availability_summary_excludes_active_slot_holds(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('One hour lesson', '1 hour');

        SlotHold::create([
            'hold_token' => 'payment-checkout-token',
            'reservation_date' => $date,
            'segment_start' => '09:40:00',
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $slots = $response->json("data.{$date}.available_slots");

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}.status", 'available');
        $this->assertNotContains('08:40', $slots);
        $this->assertNotContains('09:40', $slots);
    }

    public function test_availability_summary_package_duration_controls_late_day_starts(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('Two hour lesson', '2 hours');

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $slots = $response->json("data.{$date}.available_slots");

        $response->assertOk();
        $this->assertContains('15:40', $slots);
        $this->assertNotContains('16:00', $slots);
    }

    public function test_availability_summary_respects_custom_schedule_bounds(): void
    {
        $date = now()->addDay()->toDateString();
        $price = $this->createPrice('Short lesson', '20 minutes');

        TimeSlot::insert([
            [
                'date' => $date,
                'start_time' => '08:00:00',
                'end_time' => '08:20:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date' => $date,
                'start_time' => '08:20:00',
                'end_time' => '08:40:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date' => $date,
                'start_time' => '08:40:00',
                'end_time' => '09:00:00',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $response = $this->getJson(route('ourtimeslots.availability-summary', [
            'start_date' => $date,
            'end_date' => $date,
            'price_id' => $price->id,
        ]));

        $slots = $response->json("data.{$date}.available_slots");

        $response
            ->assertOk()
            ->assertJsonPath("data.{$date}.current_end", '09:00');
        $this->assertContains('08:20', $slots);
        $this->assertNotContains('08:40', $slots);
    }

    private function createPrice(string $description, string $duration): Price
    {
        return Price::create([
            'description' => $description,
            'price' => 100,
            'features' => 'Test feature',
            'duration' => $duration,
            'category' => 'Driving Lessons',
        ]);
    }

    private function assertDatabaseCountForDate(string $date, int $expectedCount): void
    {
        $this->assertSame(
            $expectedCount,
            TimeSlot::where('date', $date)->count(),
            "Unexpected number of slots for {$date}.",
        );
    }
}
