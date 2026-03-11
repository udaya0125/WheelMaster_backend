<?php

namespace App\Mail;

use App\Models\UserReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationStatusUpdated extends Mailable
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
        $status = $this->reservation->status;

        if ($this->isAdmin) {
            $subject = "Reservation Status Updated - {$this->reservation->user_name} - {$status}";
        } else {
            $subject = "Reservation {$status} - Booking #{$this->reservation->id}";
        }

        return $this->subject($subject)
            ->view('reservation-status-updated')
            ->with([
                'reservation' => $this->reservation,
                'isAdmin' => $this->isAdmin,
            ]);
    }
}
