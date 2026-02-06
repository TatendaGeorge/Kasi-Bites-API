<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with(['sizes', 'category', 'addons' => function ($query) {
            $query->where('is_available', true);
        }])
            ->available()
            ->get();

        return response()->json([
            'products' => ProductResource::collection($products),
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['sizes', 'category', 'addons' => function ($query) {
            $query->where('is_available', true);
        }]);

        return response()->json([
            'product' => new ProductResource($product),
        ]);
    }
}
