<?php

namespace App\Support;

use App\Models\UserReservation;
use Carbon\Carbon;

class ReservationCalendarInvite
{
    private const TIMEZONE = 'Australia/Perth';

    public static function filename(UserReservation $reservation): string
    {
        return 'booking-'.$reservation->id.'.ics';
    }

    public static function make(UserReservation $reservation): string
    {
        $start = self::dateTime($reservation->reservation_date, $reservation->start_time);
        $end = self::dateTime($reservation->reservation_date, $reservation->end_time);
        $status = strtolower((string) $reservation->status) === 'accepted' ? 'CONFIRMED' : 'TENTATIVE';

        return self::calendar([
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Wheel Master Driving Academy//Booking Calendar//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VTIMEZONE',
            'TZID:'.self::TIMEZONE,
            'BEGIN:STANDARD',
            'DTSTART:19700101T000000',
            'TZOFFSETFROM:+0800',
            'TZOFFSETTO:+0800',
            'TZNAME:AWST',
            'END:STANDARD',
            'END:VTIMEZONE',
            'BEGIN:VEVENT',
            'UID:'.self::escape(self::uid($reservation)),
            'DTSTAMP:'.Carbon::now('UTC')->format('Ymd\THis\Z'),
            'DTSTART;TZID='.self::TIMEZONE.':'.$start->format('Ymd\THis'),
            'DTEND;TZID='.self::TIMEZONE.':'.$end->format('Ymd\THis'),
            'SUMMARY:'.self::escape(self::summary($reservation)),
            'LOCATION:'.self::escape(self::location($reservation)),
            'DESCRIPTION:'.self::escape(self::description($reservation)),
            'STATUS:'.$status,
            'END:VEVENT',
            'END:VCALENDAR',
        ]);
    }

    private static function dateTime($date, $time): Carbon
    {
        $dateString = Carbon::parse($date, self::TIMEZONE)->format('Y-m-d');

        return Carbon::parse($dateString.' '.(string) $time, self::TIMEZONE);
    }

    private static function summary(UserReservation $reservation): string
    {
        $package = strtolower((string) $reservation->package_type);
        $isTest = $reservation->test_time || $reservation->test_location || str_contains($package, 'test');
        $prefix = $isTest ? 'Driving Test Package' : 'Driving Lesson';

        return $prefix.' - '.$reservation->user_name;
    }

    private static function location(UserReservation $reservation): string
    {
        if ($reservation->test_location) {
            return (string) $reservation->test_location;
        }

        return collect([
            $reservation->pickup_location,
            $reservation->dropoff_location ? 'Dropoff: '.$reservation->dropoff_location : null,
        ])->filter()->implode(' | ');
    }

    private static function description(UserReservation $reservation): string
    {
        return collect([
            'Booking ID: #'.$reservation->id,
            'Package: '.$reservation->package_type,
            'Customer: '.$reservation->user_name,
            'Phone: '.$reservation->phone,
            'Email: '.$reservation->email,
            $reservation->pickup_location ? 'Pickup: '.$reservation->pickup_location : null,
            $reservation->dropoff_location ? 'Dropoff: '.$reservation->dropoff_location : null,
            $reservation->test_time ? 'Test time: '.$reservation->test_time : null,
            $reservation->test_location ? 'Test location: '.$reservation->test_location : null,
            $reservation->comment ? 'Comment: '.$reservation->comment : null,
            'Status: '.$reservation->status,
        ])->filter()->implode("\n");
    }

    private static function uid(UserReservation $reservation): string
    {
        $host = parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'wheelmasterdriving.com.au';

        return 'booking-'.$reservation->id.'@'.$host;
    }

    private static function calendar(array $lines): string
    {
        return collect($lines)
            ->map(fn (string $line) => self::fold($line))
            ->implode("\r\n")."\r\n";
    }

    private static function escape(string $value): string
    {
        return str_replace(
            ["\\", ';', ',', "\r\n", "\r", "\n"],
            ["\\\\", "\;", "\,", "\\n", "\\n", "\\n"],
            $value
        );
    }

    private static function fold(string $line): string
    {
        $chunks = str_split($line, 73);

        return array_shift($chunks).collect($chunks)
            ->map(fn (string $chunk) => "\r\n ".$chunk)
            ->implode('');
    }
}
