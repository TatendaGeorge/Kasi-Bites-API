<?php

namespace App\Listeners;

use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Services\PushNotificationService;
use App\Services\WebPushService;

class SendOrderStatusNotification
{
    public function __construct(
        private PushNotificationService $pushNotificationService,
        private WebPushService $webPushService
    ) {}

    public function handle(OrderStatusUpdated $event): void
    {
        $order = $event->order;
        $newStatus = $event->newStatus;

        $title = $this->getNotificationTitle($newStatus);
        $body = $this->getNotificationBody($order, $newStatus);

        $data = [
            'type' => 'order_status_update',
            'status' => $newStatus->value,
        ];

        // Send via Expo Push (mobile app)
        $this->pushNotificationService->sendToOrder($order, $title, $body, $data);

        // Send via Web Push (PWA)
        $this->webPushService->sendToOrder($order, $title, $body, $data);
    }

    private function getNotificationTitle(OrderStatus $status): string
    {
        return match ($status) {
            OrderStatus::CONFIRMED => 'Order Confirmed!',
            OrderStatus::PREPARING => 'Preparing Your Order',
            OrderStatus::READY => 'Order Ready!',
            OrderStatus::OUT_FOR_DELIVERY => 'On The Way!',
            OrderStatus::DELIVERED => 'Order Delivered',
            OrderStatus::CANCELLED => 'Order Cancelled',
            default => 'Order Update',
        };
    }

    private function getNotificationBody(Order $order, OrderStatus $status): string
    {
        return match ($status) {
            OrderStatus::CONFIRMED => "Your order #{$order->order_number} has been confirmed.",
            OrderStatus::PREPARING => "We're preparing your delicious fries!",
            OrderStatus::READY => "Your order #{$order->order_number} is ready for delivery.",
            OrderStatus::OUT_FOR_DELIVERY => "Your order is on its way! Estimated arrival: " . $order->estimated_delivery_at?->format('H:i'),
            OrderStatus::DELIVERED => "Your order #{$order->order_number} has been delivered. Enjoy!",
            OrderStatus::CANCELLED => "Your order #{$order->order_number} has been cancelled.",
            default => "Your order #{$order->order_number} status has been updated.",
        };
    }
}
