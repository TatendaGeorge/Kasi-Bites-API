<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['sizes', 'category', 'addons']);

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN));
        }

        $products = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'sale_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'sizes' => 'required|array|min:1',
            'sizes.*.size' => 'required|string|in:small,medium,large',
            'sizes.*.price' => 'required|numeric|min:0',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:addons,id',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
            'sale_price' => $validated['sale_price'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
        ]);

        foreach ($validated['sizes'] as $sizeData) {
            $product->sizes()->create([
                'size' => $sizeData['size'],
                'price' => $sizeData['price'],
            ]);
        }

        if (!empty($validated['addon_ids'])) {
            $product->addons()->sync($validated['addon_ids']);
        }

        return response()->json([
            'message' => 'Product created successfully',
            'data' => new ProductResource($product->load(['sizes', 'category', 'addons'])),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => new ProductResource($product->load(['sizes', 'category', 'addons'])),
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'sale_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'sizes' => 'sometimes|array|min:1',
            'sizes.*.size' => 'required_with:sizes|string|in:small,medium,large',
            'sizes.*.price' => 'required_with:sizes|numeric|min:0',
            'addon_ids' => 'nullable|array',
            'addon_ids.*' => 'exists:addons,id',
        ]);

        $productData = collect($validated)->except(['sizes', 'addon_ids'])->toArray();
        $product->update($productData);

        if (isset($validated['sizes'])) {
            $product->sizes()->delete();
            foreach ($validated['sizes'] as $sizeData) {
                $product->sizes()->create([
                    'size' => $sizeData['size'],
                    'price' => $sizeData['price'],
                ]);
            }
        }

        if (array_key_exists('addon_ids', $validated)) {
            $product->addons()->sync($validated['addon_ids'] ?? []);
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product->fresh(['sizes', 'category', 'addons'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->addons()->detach();
        $product->sizes()->delete();
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    public function toggleAvailability(Product $product): JsonResponse
    {
        $product->update([
            'is_available' => !$product->is_available,
        ]);

        return response()->json([
            'message' => 'Product availability updated',
            'data' => new ProductResource($product->fresh(['sizes', 'category', 'addons'])),
        ]);
    }

    public function toggleFeatured(Product $product): JsonResponse
    {
        $product->update([
            'is_featured' => !$product->is_featured,
        ]);

        return response()->json([
            'message' => 'Product featured status updated',
            'data' => new ProductResource($product->fresh(['sizes', 'category', 'addons'])),
        ]);
    }
}
