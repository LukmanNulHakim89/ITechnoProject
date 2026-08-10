<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/businesses/{business}/dashboard?from=2026-08-01&to=2026-08-10
     *
     * Kalau from/to tidak dikirim, default ke 30 hari terakhir.
     */
    public function index(Request $request, Business $business): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $to = $request->filled('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $from = $request->filled('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : $to->copy()->subDays(30)->startOfDay();

        $transactions = $business->transactions()
            ->with('items')
            ->whereBetween('transaction_date', [$from, $to])
            ->get();

        $totalOmzet = $transactions->sum('total_amount');
        $totalTransaksi = $transactions->count();

        // Laba kotor = SUM((selling_price - cost_price) * quantity) dari semua item
        // yang terjual di rentang tanggal ini. cost_price diambil dari produk
        // SEKARANG (bukan histori harga saat itu, karena tabel tidak menyimpannya).
        $allItems = $transactions->flatMap(fn ($t) => $t->items);
        $productIds = $allItems->pluck('product_id')->unique();
        $products = $business->products()->whereIn('id', $productIds)->get()->keyBy('id');

        $labaKotor = $allItems->sum(function ($item) use ($products) {
            $product = $products->get($item->product_id);
            $costPrice = $product ? (float) $product->cost_price : 0;

            return ((float) $item->selling_price - $costPrice) * $item->quantity;
        });

        // Produk terlaris (by quantity) & paling untung (by margin x quantity)
        $perProduct = $allItems->groupBy('product_id')->map(function ($items, $productId) use ($products) {
            $product = $products->get($productId);
            $qty = $items->sum('quantity');
            $costPrice = $product ? (float) $product->cost_price : 0;
            $profit = $items->sum(fn ($i) => ((float) $i->selling_price - $costPrice) * $i->quantity);

            return [
                'product_id' => $productId,
                'product_name' => $product?->name,
                'quantity_sold' => $qty,
                'profit' => $profit,
            ];
        })->values();

        $bestSeller = $perProduct->sortByDesc('quantity_sold')->take(5)->values();
        $mostProfitable = $perProduct->sortByDesc('profit')->take(5)->values();

        // Produk stok kritis — pakai accessor stock_status yang sudah ada di model
        $criticalStock = $business->products()
            ->get()
            ->filter(fn ($p) => $p->stock_status !== 'AMAN')
            ->map(fn ($p) => [
                'product_id' => $p->id,
                'name' => $p->name,
                'stock' => $p->stock,
                'minimum_stock' => $p->minimum_stock,
                'stock_status' => $p->stock_status,
            ])
            ->values();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'summary' => [
                'total_omzet' => (float) $totalOmzet,
                'laba_kotor' => $labaKotor,
                'total_transaksi' => $totalTransaksi,
                'rata_rata_transaksi' => $totalTransaksi > 0
                    ? round($totalOmzet / $totalTransaksi, 2)
                    : 0,
            ],
            'best_seller' => $bestSeller,
            'most_profitable' => $mostProfitable,
            'critical_stock' => $criticalStock,
        ]);
    }
}
