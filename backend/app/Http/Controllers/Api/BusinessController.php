<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    /**
     * GET /api/businesses
     * Daftar bisnis milik user yang sedang login.
     * Dipakai frontend untuk tahu business_id mana yang harus dipakai
     * di semua endpoint lain (products, transactions, dashboard, dst).
     */
    public function index(Request $request): JsonResponse
    {
        $businesses = Business::where('owner_id', $request->user()->id)->get();

        return response()->json([
            'data' => $businesses,
        ]);
    }

    /**
     * POST /api/businesses
     * Body: { "name": "Kedai Kopi Saya", "category": "Kuliner", "address": "..." }
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $business = Business::create([
            ...$validated,
            'owner_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Bisnis berhasil dibuat.',
            'data' => $business,
        ], 201);
    }
}
