<?php

namespace App\Http\Controllers;

use App\Models\UserReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BookingHistoryController extends Controller
{
    /**
     * Return the authenticated customer's bookings.
     * Matched by email since UserReservation has no user_id.
     *
     * Query params:
     *   page     = pagination page
     *   per_page = results per page (default 9, capped at 50)
     *   upcoming = 1 to only return bookings whose date/time is in the future
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
            // Combine date + time into a single comparable timestamp at the DB level
            $query->whereRaw(
                "TIMESTAMP(reservation_date, start_time) >= ?",
                [now()]
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