<?php

namespace App\Http\Controllers;

use App\Models\UserReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingHistoryController extends Controller
{
    // A booking stays in the "upcoming" list for this many minutes after
    // its start time has passed. Keeps the API in sync with the dashboard,
    // which also gives a booking a 10-minute grace period before hiding
    // it, instead of dropping it the instant the clock hits start_time.
    private const UPCOMING_GRACE_MINUTES = 10;

    /**
     * Return the authenticated customer's bookings.
     * Matched by email since UserReservation has no user_id.
     *
     * Query params:
     *   page     = pagination page
     *   per_page = results per page (default 9, capped at 50)
     *   upcoming = 1 to only return bookings whose date/time is in the
     *              future, or within the last UPCOMING_GRACE_MINUTES
     *   sort     = 'asc' or 'desc' (default 'desc', i.e. newest first)
     */
    public function index(Request $request)
    {
        $email = Auth::user()->email;

        $perPage = (int) $request->input('per_page', 9);
        $perPage = max(1, min($perPage, 50));

        $direction = strtolower($request->input('sort', 'desc')) === 'asc' ? 'asc' : 'desc';

        $query = UserReservation::with('price')
            ->where('email', $email);

        if ($request->boolean('upcoming')) {
            // Combine date + time into a single comparable timestamp at the
            // DB level. Cutoff is "now minus the grace period" rather than
            // "now", so a booking that started a few minutes ago still
            // counts as upcoming until the grace window elapses.
            $cutoff = now()->subMinutes(self::UPCOMING_GRACE_MINUTES);

            $query->whereRaw(
                "TIMESTAMP(reservation_date, start_time) >= ?",
                [$cutoff]
            );
        }

        $query->orderByRaw("TIMESTAMP(reservation_date, start_time) {$direction}");

        $reservations = $query->paginate($perPage)->through(function (UserReservation $reservation) {
            return [
                'id'               => $reservation->id,
                'reservation_date' => $reservation->reservation_date,
                'start_time'       => $reservation->start_time,
                'end_time'         => $reservation->end_time,
                'package_type'     => $reservation->package_type,
                'pickup_location'  => $reservation->pickup_location,
                'dropoff_location' => $reservation->dropoff_location,
                'test_location'    => $reservation->test_location,
                'price'            => $reservation->price?->name,
                'status'           => $reservation->status,
                'comment'          => $reservation->comment,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $reservations,
        ]);
    }
}