<?php

namespace App\Mail;

use App\Models\UserReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $reservation;
    public $isAdmin;

    /**
     * Create a new message instance.
     */
    public function __construct(UserReservation $reservation, $isAdmin = false)
    {
        $this->reservation = $reservation;
        $this->isAdmin = $isAdmin;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $subject = $this->isAdmin 
            ? 'New Reservation Received - ' . $this->reservation->user_name
            : 'Reservation Confirmation - Booking #' . $this->reservation->id;

        return $this->subject($subject)
                    ->view('reservation-created')
                    ->with([
                        'reservation' => $this->reservation,
                        'isAdmin' => $this->isAdmin,
                    ]);
    }
}