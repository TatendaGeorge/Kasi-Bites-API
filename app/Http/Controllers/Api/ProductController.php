<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Store $store): JsonResponse
    {
        abort_unless($store->is_active, 404);

        $products = $store->products()
            ->with(['sizes', 'category', 'addons' => function ($query) {
                $query->where('is_available', true);
            }])
            ->available()
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function show(Store $store, Product $product): JsonResponse
    {
        abort_unless($store->is_active, 404);
        abort_unless($product->store_id === $store->id, 404);

        $product->load(['sizes', 'category', 'addons' => function ($query) {
            $query->where('is_available', true);
        }]);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }
}
