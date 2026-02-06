<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'subtotal' => (float) $this->subtotal,
            'delivery_fee' => (float) $this->delivery_fee,
            'total' => (float) $this->total,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'order_type' => $this->order_type,
            'order_type_label' => $this->order_type === 'collection' ? 'Collection' : 'Delivery',
            'payment_method' => $this->payment_method->value,
            'payment_method_label' => $this->payment_method->label(),
            'notes' => $this->notes,
            'estimated_delivery_at' => $this->estimated_delivery_at,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status_history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
        ];
    }
}
