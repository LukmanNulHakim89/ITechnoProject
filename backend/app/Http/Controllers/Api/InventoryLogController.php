<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryLogController extends Controller
{
    /**
     * POST /api/businesses/{business}/stock-movements
     * POST /api/businesses/{business}/inventory-logs
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'type' => ['required', 'string', 'in:IN,OUT,in,out'],
            'quantity' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $product = Product::where('business_id', $business->id)
            ->findOrFail($validated['product_id']);

        $type = strtolower($validated['type']);
        if ($type === 'in') {
            $product->increment('stock', $validated['quantity']);
        } else {
            if ($product->stock < $validated['quantity']) {
                return response()->json([
                    'message' => "Stok produk tidak mencukupi (tersisa {$product->stock} unit)."
                ], 422);
            }
            $product->decrement('stock', $validated['quantity']);
        }

        $log = InventoryLog::create([
            'product_id' => $product->id,
            'change_type' => $type,
            'quantity' => $validated['quantity'],
            'note' => $validated['note'] ?? ($type === 'in' ? 'Stok masuk manual' : 'Stok keluar manual'),
        ]);

        return response()->json([
            'message' => 'Pergerakan stok berhasil dicatat.',
            'data' => [
                'id' => $log->id,
                'product_id' => $log->product_id,
                'product_name' => $product->name,
                'change_type' => $log->change_type,
                'quantity' => $log->quantity,
                'note' => $log->note,
            ],
        ], 201);
    }
    /**
     * GET /api/businesses/{business}/inventory-logs
     */
    public function index(Business $business): JsonResponse
    {
        $logs = InventoryLog::query()
            ->whereHas('product', function ($query) use ($business) {
                $query->where('business_id', $business->id);
            })
            ->with('product')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $logs->map(fn (InventoryLog $log) => [
                'id' => $log->id,
                'product_id' => $log->product_id,
                'product_name' => $log->product?->name,
                'change_type' => $log->change_type,
                'quantity' => $log->quantity,
                'note' => $log->note,
            ]),
        ]);
    }

    /**
     * GET /api/inventory-logs/{inventoryLog}
     */
    public function show(InventoryLog $inventoryLog): JsonResponse
    {
        $inventoryLog->load('product');

        return response()->json([
            'data' => [
                'id' => $inventoryLog->id,
                'product_id' => $inventoryLog->product_id,
                'product_name' => $inventoryLog->product?->name,
                'change_type' => $inventoryLog->change_type,
                'quantity' => $inventoryLog->quantity,
                'note' => $inventoryLog->note,
            ],
        ]);
    }
}