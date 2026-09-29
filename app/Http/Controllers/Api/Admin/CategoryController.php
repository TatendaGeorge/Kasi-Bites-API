<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ResolvesCurrentStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    use ResolvesCurrentStore;

    public function index(Request $request): JsonResponse
    {
        $query = $this->currentStore($request)->categories()->withCount('products');

        if ($request->has('active_only')) {
            $query->where('is_active', true);
        }

        $categories = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $store = $this->currentStore($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->where('store_id', $store->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = $store->categories()->create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        $this->assertOwnedByCurrentStore($request, $category);
        $category->loadCount('products');

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $this->assertOwnedByCurrentStore($request, $category);
        $store = $this->currentStore($request);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'slug')->where('store_id', $store->id)->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => new CategoryResource($category),
        ]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->assertOwnedByCurrentStore($request, $category);

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with existing products. Please reassign or delete the products first.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $store = $this->currentStore($request);

        $validated = $request->validate([
            'categories' => ['required', 'array'],
            'categories.*.id' => ['required', 'exists:categories,id,store_id,' . $store->id],
            'categories.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['categories'] as $item) {
            $store->categories()->where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Categories reordered successfully',
        ]);
    }
}
