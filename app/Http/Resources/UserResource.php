<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'default_address' => $this->default_address,
            'default_address_latitude' => $this->default_address_latitude,
            'default_address_longitude' => $this->default_address_longitude,
            'is_admin' => $this->is_admin,
            'created_at' => $this->created_at,
        ];
    }
}
