<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreSettingController extends Controller
{
    public function index(): JsonResponse
    {
        // Return full setting objects for the admin UI
        $settings = StoreSetting::all();

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        // Handle both direct data and wrapped in 'settings' key
        $data = $request->has('settings') ? $request->input('settings') : $request->all();

        $rules = [
            'store_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'store_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'store_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'store_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'store_latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'store_longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'delivery_fee' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'minimum_order_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'delivery_radius_km' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'operating_hours' => ['sometimes', 'array'],
            'operating_hours.*.open' => ['required_with:operating_hours', 'string'],
            'operating_hours.*.close' => ['required_with:operating_hours', 'string'],
            'operating_hours.*.is_open' => ['required_with:operating_hours', 'boolean'],
            'is_store_open' => ['sometimes', 'boolean'],
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        foreach ($validated as $key => $value) {
            // Skip null values to avoid overwriting with empty
            if ($value === null && !in_array($key, ['store_latitude', 'store_longitude'])) {
                continue;
            }

            $type = match ($key) {
                'delivery_fee', 'minimum_order_amount', 'delivery_radius_km', 'store_latitude', 'store_longitude' => 'number',
                'is_store_open' => 'boolean',
                'operating_hours' => 'json',
                default => 'string',
            };

            StoreSetting::set($key, $value, $type);
        }

        return response()->json([
            'message' => 'Store settings updated successfully',
            'data' => StoreSetting::getAll(),
        ]);
    }

    public function show(string $key): JsonResponse
    {
        $value = StoreSetting::get($key);

        if ($value === null) {
            return response()->json([
                'message' => 'Setting not found',
            ], 404);
        }

        return response()->json([
            'data' => [
                'key' => $key,
                'value' => $value,
            ],
        ]);
    }
}
