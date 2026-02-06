<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::withCount('orders');

        // Search by name, email, or phone
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by admin status
        if ($request->has('is_admin')) {
            $query->where('is_admin', filter_var($request->is_admin, FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->latest()->paginate($request->per_page ?? 15);

        return AdminUserResource::collection($users);
    }

    public function show(User $user): AdminUserResource
    {
        $user->loadCount('orders');
        $user->load(['orders' => function ($query) {
            $query->latest()->take(10);
        }]);

        return new AdminUserResource($user);
    }

    public function update(Request $request, User $user): AdminUserResource
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'sometimes|nullable|string|max:20',
            'is_admin' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        return new AdminUserResource($user->fresh()->loadCount('orders'));
    }
}
