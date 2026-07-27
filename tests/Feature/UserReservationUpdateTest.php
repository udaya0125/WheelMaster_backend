<?php

namespace Tests\Feature;

use App\Mail\ReservationTimeUpdated;
use App\Models\Price;
use App\Models\User;
use App\Models\UserReservation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserReservationUpdateTest extends TestCase
{
    use RefreshDatabase;

    private Price $price;

    private string $date;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->actingAs(User::factory()->create());
        $this->price = Price::create([
            'description' => 'Standard lesson',
            'price' => 100,
            'features' => 'Test feature',
            'duration' => '1 hour',
            'category' => 'Driving Lessons',
        ]);
        $this->date = now()->addDay()->toDateString();
    }

    public function test_lone_reservation_can_be_shifted_five_minutes_without_conflicting_with_itself(): void
    {
        $reservation = $this->reservation('07:00', '08:00');

        $response = $this->putJson(
            route('ouruserreservations.update', ['id' => $reservation->id]),
            $this->updatePayload($reservation, '07:05', '08:05'),
        );

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.start_time', '07:05:00')
            ->assertJsonPath('data.end_time', '08:05:00');

        $this->assertDatabaseHas('user_reservations', [
            'id' => $reservation->id,
            'email' => 'student@example.com',
            'address' => 'Mandurah',
            'pickup_location' => '7 Lakes Close, Mandurah',
            'dropoff_location' => 'Mandurah Station',
            'comment' => 'Please call on arrival',
            'start_time' => '07:05:00',
            'end_time' => '08:05:00',
        ]);

        Mail::assertSent(ReservationTimeUpdated::class, function (ReservationTimeUpdated $mail) use ($reservation) {
            return $mail->hasTo('student@example.com') &&
                $mail->reservation->is($reservation) &&
                $mail->oldSchedule === [
                    'reservation_date' => $this->date,
                    'start_time' => '07:00:00',
                    'end_time' => '08:00:00',
                ];
        });
    }

    public function test_rejected_reservation_does_not_block_an_update(): void
    {
        $reservation = $this->reservation('07:00', '08:00');
        $this->reservation('08:10', '09:10', 'Rejected');

        $this->putJson(
            route('ouruserreservations.update', ['id' => $reservation->id]),
            $this->updatePayload($reservation, '07:05', '08:05'),
        )->assertOk();
    }

    public function test_direct_overlap_returns_structured_conflict_details(): void
    {
        $reservation = $this->reservation('07:00', '08:00');
        $conflicting = $this->reservation('08:10', '09:10', 'Accepted');

        $this->putJson(
            route('ouruserreservations.update', ['id' => $reservation->id]),
            $this->updatePayload($reservation, '07:15', '08:15'),
        )
            ->assertConflict()
            ->assertJsonPath('conflict.type', 'direct_overlap')
            ->assertJsonPath('conflict.reservation_id', $conflicting->id)
            ->assertJsonPath('conflict.start_time', '08:10:00')
            ->assertJsonPath('conflict.end_time', '09:10:00')
            ->assertJsonPath('conflict.buffered_end_time', '09:30:00')
            ->assertJsonPath('conflict.requested_buffered_end_time', '08:35:00');
    }

    public function test_booking_inside_twenty_minute_gap_returns_buffer_conflict(): void
    {
        $reservation = $this->reservation('07:00', '08:00');
        $conflicting = $this->reservation('08:20', '09:20', 'Pending');

        $this->putJson(
            route('ouruserreservations.update', ['id' => $reservation->id]),
            $this->updatePayload($reservation, '07:05', '08:05'),
        )
            ->assertConflict()
            ->assertJsonPath('conflict.type', 'buffer_violation')
            ->assertJsonPath('conflict.reservation_id', $conflicting->id)
            ->assertJsonPath('conflict.requested_buffered_end_time', '08:25:00');
    }

    public function test_booking_at_exact_end_of_twenty_minute_gap_is_allowed(): void
    {
        $reservation = $this->reservation('07:00', '08:00');
        $this->reservation('08:25', '09:25', 'Pending');

        $this->putJson(
            route('ouruserreservations.update', ['id' => $reservation->id]),
            $this->updatePayload($reservation, '07:05', '08:05'),
        )->assertOk();
    }

    private function reservation(string $start, string $end, string $status = 'Pending'): UserReservation
    {
        return UserReservation::create([
            'price_id' => $this->price->id,
            'user_name' => 'Existing Student',
            'email' => 'student@example.com',
            'phone' => '0400000000',
            'address' => 'Mandurah',
            'pickup_location' => '7 Lakes Close, Mandurah',
            'dropoff_location' => 'Mandurah Station',
            'comment' => 'Please call on arrival',
            'package_type' => 'Standard lesson',
            'reservation_date' => $this->date,
            'start_time' => $start.':00',
            'end_time' => $end.':00',
            'status' => $status,
        ]);
    }

    private function updatePayload(UserReservation $reservation, string $start, string $end): array
    {
        return [
            'user_name' => $reservation->user_name,
            'email' => $reservation->email,
            'phone' => $reservation->phone,
            'address' => $reservation->address,
            'reservation_date' => $this->date,
            'start_time' => $start,
            'end_time' => $end,
            'price_id' => $this->price->id,
            'package_type' => $reservation->package_type,
        ];
    }
}
