<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Confirmation</title>
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
        <h1>{{ $isAdmin ? '🔔 New Reservation Received' : '✅ Reservation Confirmed' }}</h1>
    </div>
    
    <div class="content">
        @if($isAdmin)
            <p>A new reservation has been submitted and is awaiting your review.</p>
        @else
            <p>Dear {{ $reservation->user_name }},</p>
            <p>Thank you for your reservation! We have received your booking request and it is currently pending approval.</p>
        @endif

        <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">Reservation Details</h3>
            
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
                <span class="label">Dropoff Location:</span>
                <span class="value">{{ $reservation->dropoff_location }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Package Type:</span>
                <span class="value">{{ $reservation->package_type }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Reservation Date:</span>
                <span class="value">{{ \Carbon\Carbon::parse($reservation->reservation_date)->format('F d, Y') }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">{{ \Carbon\Carbon::parse($reservation->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($reservation->end_time)->format('g:i A') }}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status-badge">{{ $reservation->status }}</span></span>
            </div>
        </div>

        @if($isAdmin)
            <p>Please review and update the reservation status in your admin panel.</p>
        @else
            <p>We will review your reservation and send you a confirmation email shortly.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
        @endif

        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {{ date('Y') }} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>