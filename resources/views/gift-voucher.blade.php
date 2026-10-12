{{-- resources/views/emails/gift-voucher.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f6f7fb; color: #111827; margin: 0; padding: 24px; }
        .card { max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; }
        h1 { font-size: 20px; margin: 0 0 16px; }
        p { line-height: 1.6; color: #4b5563; margin: 0 0 16px; }
        .message-box { background: #f9fafb; border-left: 3px solid #4f46e5; padding: 12px 16px; font-style: italic; color: #374151; margin: 0 0 20px; }
        .code { font-size: 22px; font-weight: bold; letter-spacing: 2px; background: #eef2ff; color: #4338ca; padding: 12px 16px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .details { font-size: 14px; color: #6b7280; }
        .details td { padding: 4px 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>You've received a gift voucher! 🎁</h1>
        <p>{{ $voucher->buyer_name }} sent you a voucher worth ${{ number_format($voucher->amount, 2) }}.</p>

        @if($voucher->message)
            <div class="message-box">"{{ $voucher->message }}"</div>
        @endif

        <div class="code">{{ $voucher->code }}</div>

        <table class="details" width="100%">
            @if($voucher->price)
            <tr>
                <td>Package</td>
                <td align="right">{{ $voucher->price->description }}</td>
            </tr>
            @endif
            <tr>
                <td>Valid until</td>
                <td align="right">{{ $voucher->expires_at->format('d M, Y') }}</td>
            </tr>
        </table>

        <p>Enter this code at checkout before it expires to redeem your voucher.</p>
    </div>
</body>
</html>