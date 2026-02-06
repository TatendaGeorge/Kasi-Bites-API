<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'is_available' => $this->is_available,
            'is_featured' => $this->is_featured,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'sizes' => ProductSizeResource::collection($this->whenLoaded('sizes')),
            'addons' => AddonResource::collection($this->whenLoaded('addons')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
