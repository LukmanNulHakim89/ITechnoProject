<?php

namespace App\Http\Middleware;

use App\Models\InventoryLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInventoryLogOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /** @var InventoryLog $inventoryLog */
        $inventoryLog = $request->route('inventoryLog');

        if (!$inventoryLog instanceof InventoryLog) {
            abort(404);
        }

        if ($inventoryLog->product->business->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke inventory log ini.',
            ], 403);
        }

        return $next($request);
    }
}