{{-- resources/views/emails/voucher-purchased.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #111827; margin: 0; padding: 24px; }
        .card { max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; }
        h1 { font-size: 20px; margin: 0 0 16px; }
        p { line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
        .code { font-size: 22px; font-weight: bold; letter-spacing: 2px; background: #f3f4f6; padding: 12px 16px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .details { font-size: 14px; color: #6b7280; }
        .details td { padding: 4px 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Thanks, {{ $voucher->buyer_name }}!</h1>
        <p>Your gift voucher purchase has been confirmed.</p>

        <div class="code">{{ $voucher->code }}</div>

        <table class="details" width="100%">
            <tr>
                <td>Amount</td>
                <td align="right"><strong>${{ number_format($voucher->amount, 2) }}</strong></td>
            </tr>
            @if($voucher->price)
            <tr>
                <td>Package</td>
                <td align="right">{{ $voucher->price->description }}</td>
            </tr>
            @endif
            <tr>
                <td>Sent to</td>
                <td align="right">{{ $voucher->recipient_email }}</td>
            </tr>
            <tr>
                <td>Expires</td>
                <td align="right">{{ $voucher->expires_at->format('d M, Y') }}</td>
            </tr>
        </table>

        @if($voucher->recipient_email !== $voucher->buyer_email)
            <p>We've also emailed the voucher code directly to {{ $voucher->recipient_email }}.</p>
        @else
            <p>Keep this code safe — you can use it toward your next booking with us.</p>
        @endif
    </div>
</body>
</html>