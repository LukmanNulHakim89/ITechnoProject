<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * GET /api/businesses/{business}/expenses
     */
    public function index(Business $business): JsonResponse
    {
        $expenses = $business->expenses()
            ->orderByDesc('expense_date')
            ->get();

        return response()->json([
            'data' => $expenses,
        ]);
    }

    /**
     * POST /api/businesses/{business}/expenses
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
        ]);

        $expense = $business->expenses()->create($validated);

        return response()->json([
            'message' => 'Pengeluaran berhasil ditambahkan.',
            'data' => $expense,
        ], 201);
    }

    /**
     * GET /api/expenses/{expense}
     */
    public function show(Expense $expense): JsonResponse
    {
        return response()->json([
            'data' => $expense,
        ]);
    }

    /**
     * PUT/PATCH /api/expenses/{expense}
     */
    public function update(
        Request $request,
        Expense $expense
    ): JsonResponse {
        $validated = $request->validate([
            'description' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'expense_date' => ['sometimes', 'date'],
        ]);

        $expense->update($validated);

        return response()->json([
            'message' => 'Pengeluaran berhasil diperbarui.',
            'data' => $expense->fresh(),
        ]);
    }

    /**
     * DELETE /api/expenses/{expense}
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json([
            'message' => 'Pengeluaran berhasil dihapus.',
        ]);
    }
}