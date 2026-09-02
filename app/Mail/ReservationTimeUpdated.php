<?php

namespace App\Mail;

use App\Models\UserReservation;
use App\Support\ReservationCalendarInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReservationTimeUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserReservation $reservation,
        public array $oldSchedule,
        public bool $isAdmin = false
    ) {}

    public function build()
    {
        $subject = $this->isAdmin
            ? 'Booking Time Updated - '.$this->reservation->user_name.' - Booking #'.$this->reservation->id
            : 'Your booking time has been updated - Booking #'.$this->reservation->id;

        $mail = $this->subject($subject)
            ->view('reservation-time-updated')
            ->with([
                'reservation' => $this->reservation,
                'oldSchedule' => $this->oldSchedule,
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