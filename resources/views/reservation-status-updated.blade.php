<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Status Update</title>
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
            @if($reservation->status === 'Accepted')
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            @elseif($reservation->status === 'Rejected')
                background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            @else
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            @endif
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
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            @if($reservation->status === 'Accepted')
                background: #38ef7d;
                color: white;
            @elseif($reservation->status === 'Rejected')
                background: #f45c43;
                color: white;
            @else
                background: #ffa500;
                color: white;
            @endif
        }
        .alert-box {
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            @if($reservation->status === 'Accepted')
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            @elseif($reservation->status === 'Rejected')
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            @endif
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
        <h1>
            @if($reservation->status === 'Accepted')
                ✅ Reservation Confirmed
            @elseif($reservation->status === 'Rejected')
                ❌ Reservation Rejected
            @else
                🔄 Reservation Status Updated
            @endif
        </h1>
    </div>
    
    <div class="content">
        @if($isAdmin)
            <p>The reservation status has been updated to: <strong>{{ $reservation->status }}</strong></p>
            <p>A notification email has been sent to the customer.</p>
        @else
            <p>Dear {{ $reservation->user_name }},</p>
            
            @if($reservation->status === 'Accepted')
                <div class="alert-box">
                    <strong>Great news!</strong> Your reservation has been confirmed.
                </div>
                <p>We're pleased to confirm your booking. Please find the details below:</p>
            @elseif($reservation->status === 'Rejected')
                <div class="alert-box">
                    <strong>Reservation Update:</strong> Unfortunately, we cannot accommodate your reservation request.
                </div>
                <p>We apologize for any inconvenience. The selected time slot may no longer be available or there may be other scheduling conflicts.</p>
                <p>Please feel free to contact us to discuss alternative options or make a new reservation.</p>
            @else
                <p>Your reservation status has been updated.</p>
            @endif
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
                <span class="label">Current Status:</span>
                <span class="value"><span class="status-badge">{{ $reservation->status }}</span></span>
            </div>
        </div>

        {{-- @if(!$isAdmin)
            @if($reservation->status === 'Accepted')
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>Please arrive 10 minutes before your scheduled time</li>
                    <li>Bring any necessary identification or documents</li>
                    <li>Contact us if you need to make any changes</li>
                </ul>
            @endif
            
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
        @endif --}}

        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {{ date('Y') }} Your Company Name. All rights reserved.</p>
        </div>
    </div>
</body>
</html>