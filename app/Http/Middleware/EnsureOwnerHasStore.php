<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOwnerHasStore
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->store) {
            return response()->json([
                'message' => 'No store found for this account.',
            ], 403);
        }

        return $next($request);
    }
}
