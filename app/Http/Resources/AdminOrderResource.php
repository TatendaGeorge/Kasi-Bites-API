<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'delivery_address' => $this->delivery_address,
            'delivery_latitude' => $this->delivery_latitude,
            'delivery_longitude' => $this->delivery_longitude,
            'subtotal' => $this->subtotal,
            'delivery_fee' => $this->delivery_fee,
            'total' => $this->total,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'order_type' => $this->order_type,
            'order_type_label' => $this->order_type === 'collection' ? 'Collection' : 'Delivery',
            'payment_method' => $this->payment_method?->value,
            'notes' => $this->notes,
            'estimated_delivery_at' => $this->estimated_delivery_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ]),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'size' => $item->size,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'total_price' => $item->total_price,
            ])),
            'status_history' => $this->whenLoaded('statusHistories', fn () => $this->statusHistories->map(fn ($history) => [
                'id' => $history->id,
                'status' => $history->status->value,
                'status_label' => $history->status->label(),
                'notes' => $history->notes,
                'created_at' => $history->created_at->toIso8601String(),
            ])),
        ];
    }
}
