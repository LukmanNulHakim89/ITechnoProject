<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBusinessOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $business = $request->route('business');
        $user = $request->user();

        if (!$business || !$user || $business->owner_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke bisnis ini.',
            ], 403);
        }

        return $next($request);
    }
}