<?php

namespace Tests\Feature;

use App\Models\BlockReservation;
use App\Models\Price;
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

        $response->assertOk();
        $this->assertSame('blocked', $slot['status']);
        $this->assertSame($block->id, $slot['block_id']);
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
