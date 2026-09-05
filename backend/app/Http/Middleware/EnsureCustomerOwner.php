<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /** @var Customer $customer */
        $customer = $request->route('customer');

        if (!$customer instanceof Customer) {
            abort(404);
        }

        if ($customer->business->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke customer ini.',
            ], 403);
        }

        return $next($request);
    }
}
