<?php

namespace App\Http\Middleware;

use App\Models\Expense;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureExpenseOwner
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /** @var Expense $expense */
        $expense = $request->route('expense');

        if (!$expense instanceof Expense) {
            abort(404);
        }

        if ($expense->business->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke pengeluaran ini.',
            ], 403);
        }

        return $next($request);
    }
}