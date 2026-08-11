<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Expense;
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

        /*
         * =========================
         * TRANSACTIONS
         * =========================
         */
        $transactions = $business->transactions()
            ->with('items')
            ->whereBetween('transaction_date', [$from, $to])
            ->get();

        $totalOmzet = $transactions->sum('total_amount');
        $totalTransaksi = $transactions->count();

        /*
         * =========================
         * TRANSACTION ITEMS
         * =========================
         *
         * Semua item transaksi dalam periode.
         */
        $allItems = $transactions->flatMap(
            fn ($transaction) => $transaction->items
        );

        /*
         * Ambil produk hanya untuk mendapatkan nama produk.
         *
         * cost_price TIDAK diambil dari Product untuk
         * perhitungan laba.
         *
         * Harga modal historis sudah tersimpan
         * di TransactionItem.
         */
        $productIds = $allItems->pluck('product_id')->unique();

        $products = $business->products()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        /*
         * =========================
         * LABA KOTOR
         * =========================
         *
         * (selling_price - cost_price) x quantity
         */
        $labaKotor = $allItems->sum(function ($item) {
            return (
                (float) $item->selling_price
                - (float) $item->cost_price
            ) * $item->quantity;
        });

        /*
         * =========================
         * EXPENSE / PENGELUARAN
         * =========================
         *
         * Hanya mengambil pengeluaran milik business ini
         * dan berada dalam periode dashboard.
         */
        $totalPengeluaran = Expense::where('business_id', $business->id)
            ->whereBetween('expense_date', [
                $from->toDateString(),
                $to->toDateString(),
            ])
            ->sum('amount');

        /*
         * =========================
         * LABA BERSIH
         * =========================
         *
         * Laba bersih = laba kotor - total pengeluaran
         */
        $labaBersih = (float) $labaKotor - (float) $totalPengeluaran;

        /*
         * =========================
         * STATISTIK PER PRODUK
         * =========================
         *
         * Dipakai untuk:
         * - Best Seller
         * - Most Profitable
         */
        $perProduct = $allItems
            ->groupBy('product_id')
            ->map(function ($items, $productId) use ($products) {
                $product = $products->get($productId);

                $qty = $items->sum('quantity');

                $profit = $items->sum(function ($item) {
                    return (
                        (float) $item->selling_price
                        - (float) $item->cost_price
                    ) * $item->quantity;
                });

                return [
                    'product_id' => $productId,
                    'product_name' => $product?->name,
                    'quantity_sold' => $qty,
                    'profit' => $profit,
                ];
            })
            ->values();

        /*
         * 5 produk dengan jumlah penjualan terbanyak.
         */
        $bestSeller = $perProduct
            ->sortByDesc('quantity_sold')
            ->take(5)
            ->values();

        /*
         * 5 produk dengan laba terbesar.
         */
        $mostProfitable = $perProduct
            ->sortByDesc('profit')
            ->take(5)
            ->values();

        /*
         * =========================
         * CRITICAL STOCK
         * =========================
         *
         * Menggunakan accessor stock_status dari Product.
         */
        $criticalStock = $business->products()
            ->get()
            ->filter(
                fn ($product) => $product->stock_status !== 'AMAN'
            )
            ->map(fn ($product) => [
                'product_id' => $product->id,
                'name' => $product->name,
                'stock' => $product->stock,
                'minimum_stock' => $product->minimum_stock,
                'stock_status' => $product->stock_status,
            ])
            ->values();

        /*
         * =========================
         * RESPONSE
         * =========================
         */
        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],

            'summary' => [
                'total_omzet' => (float) $totalOmzet,

                'laba_kotor' => (float) $labaKotor,

                'total_pengeluaran' => (float) $totalPengeluaran,

                'laba_bersih' => (float) $labaBersih,

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