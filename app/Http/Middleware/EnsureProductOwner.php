<?php

namespace App\Http\Middleware;

use App\Models\Product;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProductOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /** @var Product $product */
        $product = $request->route('product');

        if (!$product instanceof Product) {
            abort(404);
        }

        if ($product->business->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke produk ini.',
            ], 403);
        }

        return $next($request);
    }
}