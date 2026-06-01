<?php

namespace Tests\Feature;

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

    private function assertDatabaseCountForDate(string $date, int $expectedCount): void
    {
        $this->assertSame(
            $expectedCount,
            TimeSlot::where('date', $date)->count(),
            "Unexpected number of slots for {$date}.",
        );
    }
}
