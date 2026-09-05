<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * GET /api/businesses/{business}/customers
     */
    public function index(Business $business): JsonResponse
    {
        $customers = $business->customers()
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    /**
     * POST /api/businesses/{business}/customers
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
        ]);

        $customer = $business->customers()->create($validated);

        return response()->json([
            'message' => 'Customer berhasil ditambahkan.',
            'data' => $customer,
        ], 201);
    }

    /**
     * GET /api/customers/{customer}
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'data' => $customer,
        ]);
    }

    /**
     * PUT/PATCH /api/customers/{customer}
     */
    public function update(
        Request $request,
        Customer $customer
    ): JsonResponse {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
        ]);

        $customer->update($validated);

        return response()->json([
            'message' => 'Customer berhasil diperbarui.',
            'data' => $customer->fresh(),
        ]);
    }

    /**
     * DELETE /api/customers/{customer}
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer berhasil dihapus.',
        ]);
    }
}