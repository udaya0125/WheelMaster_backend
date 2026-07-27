<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isAdmin ? 'New Reservation Received' : 'Booking Confirmation' }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #667eea;
        }
        .value {
            color: #555;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            background: #ffa500;
            color: white;
            font-weight: bold;
        }
        .notice-box {
            background: #eef2ff;
            border: 1px solid #c7d2fe;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
        }
        .notice-box h3 {
            margin-top: 0;
            color: #3730a3;
        }
        .notice-box ul {
            margin: 0;
            padding-left: 20px;
        }
        .notice-box li {
            margin-bottom: 10px;
        }
        .notice-box li:last-child {
            margin-bottom: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #777;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $isAdmin ? 'New Reservation Received' : 'Booking Confirmation' }}</h1>
    </div>

    <div class="content">
        @if($isAdmin)
            <p>A new reservation has been submitted and is awaiting your review.</p>
        @else
            <p>Dear {{ $reservation->user_name }},</p>
            <p>Thank you for choosing <strong>Wheel Master Driving Academy</strong>.</p>
            <p>We are pleased to confirm your booking. Please review your lesson details below.</p>
        @endif

        <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">{{ $isAdmin ? 'Reservation Details' : 'Booking Details' }}</h3>

            <div class="info-row">
                <span class="label">Booking ID:</span>
                <span class="value">#{{ $reservation->id }}</span>
            </div>

            <div class="info-row">
                <span class="label">Customer Name:</span>
                <span class="value">{{ $reservation->user_name }}</span>
            </div>

            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ $reservation->email }}</span>
            </div>

            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">{{ $reservation->phone }}</span>
            </div>

            <div class="info-row">
                <span class="label">Address:</span>
                <span class="value">{{ $reservation->address }}</span>
            </div>

            <div class="info-row">
                <span class="label">Pickup Location:</span>
                <span class="value">{{ $reservation->pickup_location }}</span>
            </div>

            <div class="info-row">
                <span class="label">Drop-off Location:</span>
                <span class="value">{{ $reservation->dropoff_location }}</span>
            </div>

            <div class="info-row">
                <span class="label">Package:</span>
                <span class="value">{{ $reservation->package_type }}</span>
            </div>

            <div class="info-row">
                <span class="label">Lesson Date:</span>
                <span class="value">{{ \Carbon\Carbon::parse($reservation->reservation_date)->format('F d, Y') }}</span>
            </div>

            <div class="info-row">
                <span class="label">Lesson Time:</span>
                <span class="value">{{ \Carbon\Carbon::parse($reservation->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($reservation->end_time)->format('g:i A') }}</span>
            </div>

            <div class="info-row">
                <span class="label">Booking Status:</span>
                <span class="value"><span class="status-badge">{{ $isAdmin ? $reservation->status : 'Confirmed' }}</span></span>
            </div>
        </div>

        @if($isAdmin)
            <p>Please review and update the reservation status in your admin panel.</p>
        @else
            <div class="notice-box">
                <h3>Important Information</h3>
                <ul>
                    <li>Please be ready at your nominated pickup location at least few minutes before your scheduled lesson time.</li>
                    <li>Ensure you have your valid learner's permit or driver's licence with you.</li>
                    <li>If you need to reschedule or cancel your booking, please contact us as soon as possible in accordance with our cancellation policy.</li>
                    <li>If there are any unforeseen changes to your booking, we will notify you promptly by phone or email.</li>
                </ul>
            </div>

            <p>Thank you for choosing Wheel Master Driving Academy. We look forward to seeing you and helping you build your driving skills.</p>
            <p>Kind regards,<br><strong>Wheel Master Driving Academy</strong></p>
        @endif

        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {{ date('Y') }} Wheel Master Driving Academy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
