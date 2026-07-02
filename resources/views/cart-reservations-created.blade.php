<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Summary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 28px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 28px; border-radius: 0 0 10px 10px; }
        .box { background: white; padding: 18px; margin: 18px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
        .row { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee; }
        .row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #4f46e5; }
        .value { color: #374151; text-align: right; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #f59e0b; color: white; font-weight: bold; }
        .payment-box { background: #fff8e1; border: 1px solid #fbbf24; padding: 18px; margin: 18px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 28px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    @php
        $firstReservation = $reservations->first();
    @endphp

    <div class="header">
        <h1>{{ $isAdmin ? 'New Cart Booking Received' : 'Booking Request Received' }}</h1>
    </div>

    <div class="content">
        @if($isAdmin)
            <p>A customer submitted {{ $reservations->count() }} lessons in one checkout.</p>
        @else
            <p>Dear {{ $firstReservation->user_name }},</p>
            <p>Thank you for booking with <strong>Wheel Master Driving Academy</strong>. We have received your booking request for the lessons below.</p>
            <p>Your bookings will be confirmed once payment has been made. Please use your <strong>name as the payment reference</strong>.</p>
        @endif

        <div class="box">
            <h3 style="margin-top: 0; color: #4f46e5;">Customer Details</h3>
            <div class="row"><span class="label">Name:</span><span class="value">{{ $firstReservation->user_name }}</span></div>
            <div class="row"><span class="label">Email:</span><span class="value">{{ $firstReservation->email }}</span></div>
            <div class="row"><span class="label">Phone:</span><span class="value">{{ $firstReservation->phone }}</span></div>
            <div class="row"><span class="label">Area:</span><span class="value">{{ $firstReservation->address }}</span></div>
            <div class="row"><span class="label">Pickup:</span><span class="value">{{ $firstReservation->pickup_location }}</span></div>
            <div class="row"><span class="label">Dropoff:</span><span class="value">{{ $firstReservation->dropoff_location }}</span></div>
            @if($firstReservation->comment)
                <div class="row"><span class="label">Comment:</span><span class="value">{{ $firstReservation->comment }}</span></div>
            @endif
        </div>

        @foreach($reservations as $reservation)
            <div class="box">
                <h3 style="margin-top: 0; color: #4f46e5;">Booking #{{ $reservation->id }}</h3>
                <div class="row"><span class="label">Package:</span><span class="value">{{ $reservation->package_type }}</span></div>
                <div class="row"><span class="label">Date:</span><span class="value">{{ \Carbon\Carbon::parse($reservation->reservation_date)->format('F d, Y') }}</span></div>
                <div class="row"><span class="label">Time:</span><span class="value">{{ \Carbon\Carbon::parse($reservation->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($reservation->end_time)->format('g:i A') }}</span></div>
                <div class="row"><span class="label">Status:</span><span class="value"><span class="badge">{{ $reservation->status }}</span></span></div>
            </div>
        @endforeach

        <div class="box">
            <div class="row"><span class="label">Total lessons:</span><span class="value">{{ $reservations->count() }}</span></div>
            <div class="row"><span class="label">Total amount:</span><span class="value">${{ number_format($totalAmount, 2) }}</span></div>
        </div>

        @if($isAdmin)
            <p>Please review these reservations in the admin panel.</p>
        @else
            <div class="payment-box">
                <h3 style="margin-top: 0; color: #92400e;">Payment Details</h3>
                <div class="row"><span class="label">Account Name:</span><span class="value">Wheel Master Driving Academy</span></div>
                <div class="row"><span class="label">BSB:</span><span class="value">036-192</span></div>
                <div class="row"><span class="label">Account Number:</span><span class="value">346771</span></div>
                <div class="row"><span class="label">Payment Reference:</span><span class="value">{{ $firstReservation->user_name }}</span></div>
            </div>
            <p>Once payment has been made, please send a screenshot via email or message us on <strong>0481 488 216</strong>.</p>
            <p>Kind regards,<br><strong>Wheel Master Driving Academy</strong></p>
        @endif

        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {{ date('Y') }} Wheel Master Driving Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
