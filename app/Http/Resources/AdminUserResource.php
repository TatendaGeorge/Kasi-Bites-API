<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_admin' => $this->is_admin,
            'orders_count' => $this->when(isset($this->orders_count), $this->orders_count),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'recent_orders' => $this->whenLoaded('orders', fn () => $this->orders->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'created_at' => $order->created_at->toIso8601String(),
            ])),
        ];
    }
}
