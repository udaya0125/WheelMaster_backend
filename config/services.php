<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google_analytics' => [
        'property_id' => env('ANALYTICS_PROPERTY_ID'),
    ],

    'onlinepay' => [
        'payment_mode' => env('BOOKING_PAYMENT_MODE', 'manual'),
        'base_url' => env('ONLINEPAY_BASE_URL', 'https://au.gsc.verifone.cloud'),
        'user_id' => env('ONLINEPAY_USER_ID'),
        'api_key' => env('ONLINEPAY_API_KEY'),
        'entity_id' => env('ONLINEPAY_ENTITY_ID'),
        'ppc_id' => env('ONLINEPAY_PPC_ID'),
        'threeds_id' => env('ONLINEPAY_3DS_ID'),
        'currency' => env('ONLINEPAY_CURRENCY', 'AUD'),
        'interaction_type' => env('ONLINEPAY_INTERACTION_TYPE', 'HPP'),
        'hold_minutes' => (int) env('ONLINEPAY_HOLD_MINUTES', 30),
        'timeout' => (int) env('ONLINEPAY_TIMEOUT', 15),
        'admin_email' => env('ADMIN_EMAIL', 'Wheelmasterdriving@gmail.com'),
    ],

];
