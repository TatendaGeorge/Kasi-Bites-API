<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebPushController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $subscription = WebPushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id' => $request->user()?->id,
                'p256dh_key' => $request->input('keys.p256dh'),
                'auth_key' => $request->input('keys.auth'),
            ]
        );

        return response()->json([
            'message' => 'Web push subscription registered',
            'subscription_id' => $subscription->id,
        ], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        WebPushSubscription::where('endpoint', $request->endpoint)->delete();

        return response()->json([
            'message' => 'Web push subscription removed',
        ]);
    }

    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('webpush.vapid.public_key'),
        ]);
    }
}
