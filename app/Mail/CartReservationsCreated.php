<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CartReservationsCreated extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $reservations;

    public bool $isAdmin;

    public float $totalAmount;

    public function __construct(Collection $reservations, bool $isAdmin = false, float $totalAmount = 0)
    {
        $this->reservations = $reservations;
        $this->isAdmin = $isAdmin;
        $this->totalAmount = $totalAmount;
    }

    public function build()
    {
        $firstReservation = $this->reservations->first();
        $bookingIds = $this->reservations->pluck('id')->implode(', ');

        $subject = $this->isAdmin
            ? 'New Cart Booking Received - '.$firstReservation?->user_name
            : 'Booking Confirmation - Bookings #'.$bookingIds;

        return $this->subject($subject)
            ->view('cart-reservations-created')
            ->with([
                'reservations' => $this->reservations,
                'isAdmin' => $this->isAdmin,
                'totalAmount' => $this->totalAmount,
            ]);
    }
}
