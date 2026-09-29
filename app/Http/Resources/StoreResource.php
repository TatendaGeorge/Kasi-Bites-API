<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'cover_image_url' => $this->cover_image_url,
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'delivery_fee' => (float) $this->delivery_fee,
            'delivery_radius_km' => (float) $this->delivery_radius_km,
            'minimum_order_amount' => (float) $this->minimum_order_amount,
            'operating_hours' => $this->operating_hours,
            'is_open' => $this->is_open,
            'is_active' => $this->is_active,
            'products_count' => $this->whenCounted('products'),
            'orders_count' => $this->whenCounted('orders'),
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
                'email' => $this->owner->email,
                'phone' => $this->owner->phone,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
