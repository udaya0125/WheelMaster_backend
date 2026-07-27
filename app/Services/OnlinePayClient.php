<?php

namespace App\Services;

use App\Exceptions\OnlinePayException;
use App\Models\PaymentIntent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OnlinePayClient
{
    private const BILLING_ADDRESS_MAX_LENGTH = 40;

    public function createCheckout(PaymentIntent $intent): array
    {
        $config = config('services.onlinepay');
        $baseUrl = rtrim((string) ($config['base_url'] ?? ''), '/');
        $userId = (string) ($config['user_id'] ?? '');
        $apiKey = (string) ($config['api_key'] ?? '');

        if ($baseUrl === '' || $userId === '' || $apiKey === '') {
            throw new OnlinePayException('OnlinePay credentials are not configured.', 500);
        }

        $response = Http::acceptJson()
            ->asJson()
            ->timeout((int) ($config['timeout'] ?? 15))
            ->retry(2, 250, throw: false)
            ->withBasicAuth($userId, $apiKey)
            ->post($baseUrl.'/oidc/checkout-service/v2/checkout', $this->checkoutPayload($intent));

        if (! $response->successful()) {
            throw new OnlinePayException('OnlinePay checkout could not be created.', 502, [
                'status' => $response->status(),
                'body' => $response->json() ?: $response->body(),
            ]);
        }

        $data = $response->json();

        if (! is_array($data) || empty($data['id']) || empty($data['url'])) {
            throw new OnlinePayException('OnlinePay returned an invalid checkout response.', 502, [
                'body' => $data,
            ]);
        }

        return $data;
    }

    private function checkoutPayload(PaymentIntent $intent): array
    {
        $config = config('services.onlinepay');
        $customer = $intent->customer_snapshot ?? [];
        $nameParts = $this->splitName($intent->customer_name);

        $payload = [
            'entity_id' => $config['entity_id'],
            'currency_code' => $intent->currency,
            'amount' => $intent->amount_cents,
            'merchant_reference' => $intent->merchant_reference,
            'interaction_type' => $config['interaction_type'] ?? 'HPP',
            'return_url' => route('payments.onlinepay.return', ['paymentIntent' => $intent->uuid]),
            'customer_details' => [
                'entity_id' => $config['entity_id'],
                'email_address' => $intent->customer_email,
                'billing' => [
                    'first_name' => $nameParts['first_name'],
                    'last_name' => $nameParts['last_name'],
                    'address_1' => $this->billingAddress($customer),
                    'city' => $customer['billing_city'] ?? 'Mandurah',
                    'country_code' => $customer['billing_country_code'] ?? 'AU',
                    'postal_code' => $customer['billing_postal_code'] ?? $this->extractPostcode($customer),
                    'state' => $customer['billing_state'] ?? 'WA',
                ],
            ],
            'configurations' => [
                'card' => [
                    'shopper_interaction' => 'ECOMMERCE',
                    'payment_contract_id' => $config['ppc_id'],
                ],
            ],
        ];

        if (! empty($config['threeds_id'])) {
            $payload['configurations']['card']['threed_secure'] = [
                'threeds_contract_id' => $config['threeds_id'],
                'enabled' => true,
                'total_items' => str_pad((string) $intent->items()->count(), 2, '0', STR_PAD_LEFT),
            ];
        }

        return $payload;
    }

    private function billingAddress(array $customer): string
    {
        $address = trim((string) ($customer['pickup_location'] ?? $customer['address'] ?? 'Mandurah'));

        if ($address === '') {
            return 'Mandurah';
        }

        return Str::limit($address, self::BILLING_ADDRESS_MAX_LENGTH, '');
    }

    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $firstName = $parts[0] ?? 'Customer';
        $lastName = trim(Str::after($name, $firstName)) ?: $firstName;

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
        ];
    }

    private function extractPostcode(array $customer): string
    {
        foreach (['pickup_location', 'dropoff_location', 'address'] as $field) {
            if (preg_match('/\b(\d{4})\b/', (string) ($customer[$field] ?? ''), $matches)) {
                return $matches[1];
            }
        }

        return '6210';
    }
}
