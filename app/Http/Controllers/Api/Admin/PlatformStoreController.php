<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformStoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::with('owner')->withCount(['products', 'orders']);

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $stores = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => StoreResource::collection($stores),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page' => $stores->lastPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
            ],
        ]);
    }

    public function show(Store $store): JsonResponse
    {
        $store->load('owner')->loadCount(['products', 'orders']);

        return response()->json([
            'data' => new StoreResource($store),
        ]);
    }

    public function approve(Store $store): JsonResponse
    {
        $store->update(['is_active' => true]);

        return response()->json([
            'message' => 'Store approved',
            'data' => new StoreResource($store->fresh()),
        ]);
    }

    public function suspend(Store $store): JsonResponse
    {
        $store->update(['is_active' => false]);

        return response()->json([
            'message' => 'Store suspended',
            'data' => new StoreResource($store->fresh()),
        ]);
    }
}
