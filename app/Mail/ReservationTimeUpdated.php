<?php

namespace App\Mail;

use App\Models\UserReservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationTimeUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserReservation $reservation,
        public array $oldSchedule
    ) {}

    public function build()
    {
        return $this->subject('Your booking time has been updated - Booking #'.$this->reservation->id)
            ->view('reservation-time-updated')
            ->with([
                'reservation' => $this->reservation,
                'oldSchedule' => $this->oldSchedule,
            ]);
    }
}
