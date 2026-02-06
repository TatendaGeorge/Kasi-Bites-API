<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'default_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'default_address_latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'default_address_longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user->fresh()),
        ]);
    }
}
