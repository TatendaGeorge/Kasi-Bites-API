<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID Keys
    |--------------------------------------------------------------------------
    |
    | VAPID (Voluntary Application Server Identification) keys are used to
    | identify the application server sending push notifications.
    |
    */

    'vapid' => [
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
        'subject' => env('VAPID_SUBJECT', 'mailto:admin@kasibites.com'),
    ],
];
