<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product_name,
            'size' => $this->size,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'total_price' => (float) $this->total_price,
            'addons' => $this->whenLoaded('addons', fn() => $this->addons->map(fn($addon) => [
                'id' => $addon->id,
                'name' => $addon->addon_name,
                'price' => (float) $addon->addon_price,
            ])),
        ];
    }
}
