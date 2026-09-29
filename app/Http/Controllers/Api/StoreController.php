<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Traits\ResolvesCurrentStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    use ResolvesCurrentStore;

    /**
     * Public: list published stores (store discovery, like a marketplace grid).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::published();

        if (!$request->boolean('include_closed')) {
            $query->where('is_open', true);
        }

        $stores = $query->orderBy('name')->get();

        return response()->json([
            'data' => StoreResource::collection($stores),
        ]);
    }

    /**
     * Public: a single published store's profile.
     */
    public function show(Store $store): JsonResponse
    {
        abort_unless($store->is_active, 404);

        return response()->json([
            'data' => new StoreResource($store),
        ]);
    }

    /**
     * Owner onboarding: create the current user's one store.
     */
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->store) {
            return response()->json([
                'message' => 'You already have a store.',
            ], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'delivery_radius_km' => ['nullable', 'numeric', 'min:0'],
            'minimum_order_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $store = $request->user()->store()->create($validated)->fresh();

        return response()->json([
            'message' => 'Store created successfully. It will be visible once approved.',
            'data' => new StoreResource($store),
        ], 201);
    }

    /**
     * Owner: view my own store (any state, including pending approval).
     */
    public function showMine(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new StoreResource($this->currentStore($request)),
        ]);
    }

    /**
     * Owner: update my own store's profile.
     */
    public function updateMine(Request $request): JsonResponse
    {
        $store = $this->currentStore($request);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'cover_image_url' => ['nullable', 'string', 'max:500'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_fee' => ['sometimes', 'numeric', 'min:0'],
            'delivery_radius_km' => ['sometimes', 'numeric', 'min:0'],
            'minimum_order_amount' => ['sometimes', 'numeric', 'min:0'],
            'operating_hours' => ['nullable', 'array'],
            'operating_hours.*.open' => ['required_with:operating_hours', 'string'],
            'operating_hours.*.close' => ['required_with:operating_hours', 'string'],
            'operating_hours.*.is_open' => ['required_with:operating_hours', 'boolean'],
            'is_open' => ['sometimes', 'boolean'],
        ]);

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'data' => new StoreResource($store->fresh()),
        ]);
    }
}
