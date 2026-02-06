<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Get public store settings (for PWA checkout, etc.)
     */
    public function settings(): JsonResponse
    {
        return response()->json([
            'data' => [
                'store_name' => StoreSetting::get('store_name', 'Kasi Bites'),
                'store_address' => StoreSetting::get('store_address'),
                'store_phone' => StoreSetting::get('store_phone'),
                'store_latitude' => StoreSetting::get('store_latitude'),
                'store_longitude' => StoreSetting::get('store_longitude'),
                'delivery_fee' => StoreSetting::get('delivery_fee', 30),
                'delivery_radius_km' => StoreSetting::get('delivery_radius_km', 0.5),
                'minimum_order_amount' => StoreSetting::get('minimum_order_amount', 0),
                'is_store_open' => StoreSetting::get('is_store_open', true),
                'operating_hours' => StoreSetting::get('operating_hours'),
            ],
        ]);
    }
}
