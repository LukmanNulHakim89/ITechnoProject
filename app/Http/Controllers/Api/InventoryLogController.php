<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\InventoryLog;
use Illuminate\Http\JsonResponse;

class InventoryLogController extends Controller
{
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