<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Time Updated</title>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
        <div style="background:#2563eb;color:#fff;padding:24px;border-radius:10px 10px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:24px;">Your booking time has been updated</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:0 0 10px 10px;">
            <p>Dear {{ $reservation->user_name }},</p>
            <p>The date or time for booking <strong>#{{ $reservation->id }}</strong> has been updated. Please use the new schedule below.</p>

            <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:18px;margin:22px 0;">
                <h2 style="font-size:18px;color:#1d4ed8;margin:0 0 14px;">New schedule</h2>
                <p style="margin:6px 0;"><strong>Date:</strong> {{ \Carbon\Carbon::parse($reservation->reservation_date)->format('l, F j, Y') }}</p>
                <p style="margin:6px 0;"><strong>Time:</strong> {{ \Carbon\Carbon::parse($reservation->start_time)->format('g:i A') }} – {{ \Carbon\Carbon::parse($reservation->end_time)->format('g:i A') }}</p>
            </div>

            <div style="color:#6b7280;font-size:14px;margin:22px 0;">
                <strong>Previous schedule</strong><br>
                {{ \Carbon\Carbon::parse($oldSchedule['reservation_date'])->format('l, F j, Y') }}<br>
                {{ \Carbon\Carbon::parse($oldSchedule['start_time'])->format('g:i A') }} – {{ \Carbon\Carbon::parse($oldSchedule['end_time'])->format('g:i A') }}
            </div>

            @if($reservation->pickup_location)
                <p><strong>Pickup location:</strong> {{ $reservation->pickup_location }}</p>
            @endif

            <p>If you have any questions about this change, please contact Wheel Master Driving Academy.</p>
        </div>
    </div>
</body>
</html>
