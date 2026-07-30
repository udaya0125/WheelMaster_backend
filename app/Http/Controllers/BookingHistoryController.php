<?php

namespace App\Http\Controllers;

use App\Models\UserReservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingHistoryController extends Controller
{
    /**
     * Return the authenticated customer's bookings.
     * Matched by email since UserReservation has no user_id.
     *
     * Query params:
     *   page   = pagination page
     */
    public function index(Request $request)
    {
        $email = Auth::user()->email;

        $query = UserReservation::with('price')
            ->where('email', $email)
            ->orderBy('reservation_date', 'desc')
            ->orderBy('start_time', 'desc');

        $reservations = $query->paginate(10)->through(function (UserReservation $reservation) {
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
