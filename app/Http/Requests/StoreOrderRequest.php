<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\ProductSize;
use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['required', 'integer', 'exists:stores,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'regex:/^(\+27|0)[6-8][0-9]{8}$/'],
            'order_type' => ['required', Rule::in(['delivery', 'collection'])],
            'delivery_address' => ['required', 'string', 'max:500'],
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_size_id' => ['required', 'exists:product_sizes,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'items.*.addon_ids' => ['nullable', 'array'],
            'items.*.addon_ids.*' => ['exists:addons,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (!$this->store_id || $validator->errors()->has('store_id')) {
                return;
            }

            $store = Store::find($this->store_id);

            if (!$store) {
                return;
            }

            // Every item's product must belong to the store the order is for —
            // closes a gap where a stale/mixed cart could span two stores.
            foreach ($this->input('items', []) as $index => $item) {
                if (empty($item['product_size_id'])) {
                    continue;
                }

                $productSize = ProductSize::with('product')->find($item['product_size_id']);

                if ($productSize && $productSize->product->store_id !== $store->id) {
                    $validator->errors()->add(
                        "items.{$index}.product_size_id",
                        'This item does not belong to the selected store.'
                    );
                }
            }

            // Only validate distance for delivery orders with coordinates
            if ($this->order_type === 'delivery' &&
                $this->delivery_latitude &&
                $this->delivery_longitude &&
                $store->latitude &&
                $store->longitude) {

                $maxRadius = (float) $store->delivery_radius_km;

                $distance = $this->calculateDistance(
                    $store->latitude,
                    $store->longitude,
                    $this->delivery_latitude,
                    $this->delivery_longitude
                );

                if ($distance > $maxRadius) {
                    $validator->errors()->add(
                        'delivery_address',
                        "Sorry, this store only delivers within {$maxRadius}km. Your location is " . round($distance, 2) . "km away. Please choose collection instead."
                    );
                }
            }
        });
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function messages(): array
    {
        return [
            'customer_phone.regex' => 'Please enter a valid South African phone number.',
            'order_type.required' => 'Please select delivery or collection.',
            'order_type.in' => 'Order type must be either delivery or collection.',
            'items.required' => 'Please add at least one item to your order.',
            'items.*.quantity.max' => 'Maximum quantity per item is 10.',
        ];
    }
}
