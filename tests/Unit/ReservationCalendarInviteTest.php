<?php

namespace Tests\Unit;

use App\Mail\CartReservationsCreated;
use App\Mail\ReservationCreated;
use App\Models\UserReservation;
use App\Support\ReservationCalendarInvite;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ReservationCalendarInviteTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::parse('2026-07-07 10:00:00', 'UTC'));
        config(['app.url' => 'https://booking.wheelmasterdriving.com.au']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_it_generates_outlook_compatible_ics_content_for_a_reservation(): void
    {
        $reservation = $this->reservation();
        $ics = $this->unfold(ReservationCalendarInvite::make($reservation));

        $this->assertStringContainsString('BEGIN:VCALENDAR', $ics);
        $this->assertStringContainsString('BEGIN:VEVENT', $ics);
        $this->assertStringContainsString('TZID:Australia/Perth', $ics);
        $this->assertStringContainsString('UID:booking-123@booking.wheelmasterdriving.com.au', $ics);
        $this->assertStringContainsString('DTSTART;TZID=Australia/Perth:20260708T090000', $ics);
        $this->assertStringContainsString('DTEND;TZID=Australia/Perth:20260708T100000', $ics);
        $this->assertStringContainsString('SUMMARY:Driving Lesson - Calendar Student', $ics);
        $this->assertStringContainsString('Booking ID: #123', $ics);
        $this->assertStringContainsString('Phone: 0400000000', $ics);
        $this->assertStringContainsString('Email: student@example.com', $ics);
        $this->assertStringContainsString('END:VCALENDAR', $ics);
    }

    public function test_reservation_created_only_attaches_calendar_invite_for_admin(): void
    {
        $reservation = $this->reservation();
        $ics = ReservationCalendarInvite::make($reservation);

        (new ReservationCreated($reservation, true))->assertHasAttachedData(
            $ics,
            'booking-123.ics',
            ['mime' => 'text/calendar']
        );

        $customerMail = (new ReservationCreated($reservation, false))->build();

        $this->assertFalse($customerMail->hasAttachedData(
            $ics,
            'booking-123.ics',
            ['mime' => 'text/calendar']
        ));
    }

    public function test_cart_reservations_created_attaches_one_calendar_invite_per_reservation_for_admin(): void
    {
        $first = $this->reservation(id: 123, startTime: '09:00:00', endTime: '10:00:00');
        $second = $this->reservation(id: 124, startTime: '10:40:00', endTime: '11:40:00');
        $reservations = new Collection([$first, $second]);

        $adminMail = new CartReservationsCreated($reservations, true, 200);

        $adminMail->assertHasAttachedData(
            ReservationCalendarInvite::make($first),
            'booking-123.ics',
            ['mime' => 'text/calendar']
        );
        $adminMail->assertHasAttachedData(
            ReservationCalendarInvite::make($second),
            'booking-124.ics',
            ['mime' => 'text/calendar']
        );

        $customerMail = (new CartReservationsCreated($reservations, false, 200))->build();

        $this->assertFalse($customerMail->hasAttachedData(
            ReservationCalendarInvite::make($first),
            'booking-123.ics',
            ['mime' => 'text/calendar']
        ));
        $this->assertFalse($customerMail->hasAttachedData(
            ReservationCalendarInvite::make($second),
            'booking-124.ics',
            ['mime' => 'text/calendar']
        ));
    }

    public function test_customer_reservation_email_excludes_bank_details_and_uses_booking_confirmation_copy(): void
    {
        $html = (new ReservationCreated($this->reservation(), false))->render();

        $this->assertStringNotContainsString('BSB', $html);
        $this->assertStringNotContainsString('Account Number', $html);
        $this->assertStringNotContainsString('Payment Reference', $html);
        $this->assertStringNotContainsString('screenshot', $html);
        $this->assertStringContainsString('We are pleased to confirm your booking', $html);
        $this->assertStringContainsString('Booking Details', $html);
        $this->assertStringContainsString('Booking Status:', $html);
        $this->assertStringContainsString('Confirmed', $html);
        $this->assertStringContainsString('we will notify you promptly by phone or email', $html);
    }

    public function test_customer_cart_email_excludes_bank_details_and_mentions_slot_timing_contact(): void
    {
        $reservations = new Collection([
            $this->reservation(id: 123, startTime: '09:00:00', endTime: '10:00:00'),
            $this->reservation(id: 124, startTime: '10:40:00', endTime: '11:40:00'),
        ]);

        $html = (new CartReservationsCreated($reservations, false, 200))->render();

        $this->assertStringNotContainsString('BSB', $html);
        $this->assertStringNotContainsString('Account Number', $html);
        $this->assertStringNotContainsString('Payment Reference', $html);
        $this->assertStringNotContainsString('screenshot', $html);
        $this->assertStringContainsString('slot timing', $html);
        $this->assertStringContainsString('will contact you directly', $html);
    }

    private function reservation(int $id = 123, string $startTime = '09:00:00', string $endTime = '10:00:00'): UserReservation
    {
        $reservation = new UserReservation([
            'user_name' => 'Calendar Student',
            'email' => 'student@example.com',
            'phone' => '0400000000',
            'address' => 'Mandurah',
            'pickup_location' => '7 Lakes Close',
            'dropoff_location' => 'Mandurah Forum',
            'package_type' => 'Standard lesson',
            'reservation_date' => '2026-07-08',
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'Pending',
            'comment' => 'Please meet near the driveway.',
        ]);

        $reservation->id = $id;

        return $reservation;
    }

    private function unfold(string $ics): string
    {
        return str_replace("\r\n ", '', $ics);
    }
}
