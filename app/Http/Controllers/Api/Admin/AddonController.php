<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddonResource;
use App\Models\Addon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Addon::withCount('products');

        if ($request->has('available_only')) {
            $query->where('is_available', true);
        }

        $addons = $query->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'data' => AddonResource::collection($addons),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $addon = Addon::create($validated);

        return response()->json([
            'message' => 'Add-on created successfully',
            'data' => new AddonResource($addon),
        ], 201);
    }

    public function show(Addon $addon): JsonResponse
    {
        $addon->loadCount('products');

        return response()->json([
            'data' => new AddonResource($addon),
        ]);
    }

    public function update(Request $request, Addon $addon): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $addon->update($validated);

        return response()->json([
            'message' => 'Add-on updated successfully',
            'data' => new AddonResource($addon),
        ]);
    }

    public function destroy(Addon $addon): JsonResponse
    {
        $addon->delete();

        return response()->json([
            'message' => 'Add-on deleted successfully',
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'addons' => ['required', 'array'],
            'addons.*.id' => ['required', 'exists:addons,id'],
            'addons.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['addons'] as $item) {
            Addon::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Add-ons reordered successfully',
        ]);
    }
}
