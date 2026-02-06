<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\WebPushSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    private ?WebPush $webPush = null;

    private function getWebPush(): ?WebPush
    {
        if ($this->webPush !== null) {
            return $this->webPush;
        }

        $publicKey = config('webpush.vapid.public_key');
        $privateKey = config('webpush.vapid.private_key');
        $subject = config('webpush.vapid.subject');

        if (!$publicKey || !$privateKey) {
            Log::warning('Web Push: VAPID keys not configured');
            return null;
        }

        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => $subject,
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);

        return $this->webPush;
    }

    public function sendToOrder(Order $order, string $title, string $body, array $data = []): void
    {
        $subscriptions = $this->getSubscriptionsForOrder($order);

        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = array_merge($data, [
            'order_number' => $order->order_number,
        ]);

        $this->send($subscriptions, $title, $body, $payload);
    }

    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $subscriptions = $user->webPushSubscriptions;

        if ($subscriptions->isEmpty()) {
            return;
        }

        $this->send($subscriptions, $title, $body, $data);
    }

    private function getSubscriptionsForOrder(Order $order)
    {
        if ($order->user_id) {
            return $order->user->webPushSubscriptions;
        }

        // For guest orders, get subscriptions created around the same time as the order
        return WebPushSubscription::whereNull('user_id')
            ->where('created_at', '>=', $order->created_at->subHours(24))
            ->get();
    }

    private function send($subscriptions, string $title, string $body, array $data = []): void
    {
        $webPush = $this->getWebPush();

        if (!$webPush) {
            return;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'icon' => '/icons/icon-192x192.png',
            'badge' => '/icons/icon-72x72.png',
        ]);

        foreach ($subscriptions as $subscription) {
            $pushSubscription = Subscription::create([
                'endpoint' => $subscription->endpoint,
                'keys' => [
                    'p256dh' => $subscription->p256dh_key,
                    'auth' => $subscription->auth_key,
                ],
            ]);

            $webPush->queueNotification($pushSubscription, $payload);
        }

        $failedEndpoints = [];

        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                $endpoint = $report->getRequest()->getUri()->__toString();
                $reason = $report->getReason();

                Log::warning('Web Push notification failed', [
                    'endpoint' => $endpoint,
                    'reason' => $reason,
                ]);

                // Remove expired or invalid subscriptions (404, 410 status codes)
                if ($report->isSubscriptionExpired()) {
                    $failedEndpoints[] = $endpoint;
                }
            }
        }

        // Clean up failed subscriptions
        if (!empty($failedEndpoints)) {
            WebPushSubscription::whereIn('endpoint', $failedEndpoints)->delete();
            Log::info('Removed expired web push subscriptions', ['count' => count($failedEndpoints)]);
        }
    }
}
