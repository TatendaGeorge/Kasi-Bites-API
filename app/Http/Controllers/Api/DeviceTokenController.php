<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeviceTokenRequest;
use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(StoreDeviceTokenRequest $request): JsonResponse
    {
        $token = DeviceToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $request->user()?->id,
                'platform' => $request->platform ?? 'expo',
            ]
        );

        return response()->json([
            'message' => 'Device token registered',
            'token_id' => $token->id,
        ], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        DeviceToken::where('token', $request->token)->delete();

        return response()->json([
            'message' => 'Device token removed',
        ]);
    }
}
