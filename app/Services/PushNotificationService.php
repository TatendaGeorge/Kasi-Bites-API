<?php

namespace App\Services;

use App\Models\DeviceToken;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    public function sendToOrder(Order $order, string $title, string $body, array $data = []): void
    {
        $tokens = $this->getTokensForOrder($order);

        if (empty($tokens)) {
            return;
        }

        $this->send($tokens, $title, $body, array_merge($data, [
            'order_number' => $order->order_number,
        ]));
    }

    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->deviceTokens->pluck('token')->toArray();

        if (empty($tokens)) {
            return;
        }

        $this->send($tokens, $title, $body, $data);
    }

    private function getTokensForOrder(Order $order): array
    {
        if ($order->user_id) {
            return $order->user->deviceTokens->pluck('token')->toArray();
        }

        return DeviceToken::whereNull('user_id')
            ->where('created_at', '>=', $order->created_at->subHours(24))
            ->pluck('token')
            ->toArray();
    }

    private function send(array $tokens, string $title, string $body, array $data = []): void
    {
        $messages = array_map(fn($token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ], $tokens);

        try {
            $response = Http::post(self::EXPO_PUSH_URL, $messages);

            if (!$response->successful()) {
                Log::error('Expo push notification failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Expo push notification exception', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
