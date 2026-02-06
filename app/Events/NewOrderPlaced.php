<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-order';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer_name,
            'customer_phone' => $this->order->customer_phone,
            'delivery_address' => $this->order->delivery_address,
            'delivery_latitude' => $this->order->delivery_latitude,
            'delivery_longitude' => $this->order->delivery_longitude,
            'subtotal' => $this->order->subtotal,
            'delivery_fee' => $this->order->delivery_fee,
            'total' => $this->order->total,
            'items_count' => $this->order->items->count(),
            'items' => $this->order->items->map(fn ($item) => [
                'product_name' => $item->product_name,
                'size' => $item->size,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
            ])->toArray(),
            'status' => $this->order->status->value,
            'status_label' => $this->order->status->label(),
            'order_type' => $this->order->order_type,
            'order_type_label' => $this->order->order_type === 'collection' ? 'Collection' : 'Delivery',
            'payment_method' => $this->order->payment_method?->value ?? 'cash',
            'notes' => $this->order->notes,
            'created_at' => $this->order->created_at->toIso8601String(),
        ];
    }
}
