<?php

namespace App\Mail;

use App\Models\UserReservation;
use App\Support\ReservationCalendarInvite;
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
            : 'Booking confirmation- Wheel Master Driving Academy';

        $mail = $this->subject($subject)
                    ->view('reservation-created')
                    ->with([
                        'reservation' => $this->reservation,
                        'isAdmin' => $this->isAdmin,
                    ]);

        if ($this->isAdmin) {
            $mail->attachData(
                ReservationCalendarInvite::make($this->reservation),
                ReservationCalendarInvite::filename($this->reservation),
                ['mime' => 'text/calendar']
            );
        }

        return $mail;
    }
}


