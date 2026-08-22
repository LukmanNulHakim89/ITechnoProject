<?php

namespace App\Http\Middleware;

use App\Models\Transaction;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTransactionOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /** @var Transaction $transaction */
        $transaction = $request->route('transaction');

        if (!$transaction instanceof Transaction) {
            abort(404);
        }

        if ($transaction->business->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke transaksi ini.',
            ], 403);
        }

        return $next($request);
    }
}
