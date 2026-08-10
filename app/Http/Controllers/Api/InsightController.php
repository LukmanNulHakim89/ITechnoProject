<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Insight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InsightController extends Controller
{
    /**
     * GET /api/businesses/{business}/insights
     * List insight yang sudah pernah digenerate, terbaru dulu.
     */
    public function index(Business $business): JsonResponse
    {
        $insights = $business->insights()->orderByDesc('created_at')->get();

        return response()->json([
            'data' => $insights,
        ]);
    }

    /**
     * POST /api/businesses/{business}/insights/generate
     * Jalankan semua rule berdasarkan data 30 hari terakhir (vs 30 hari
     * sebelumnya untuk perbandingan tren), simpan hasilnya sebagai
     * record baru di tabel insights.
     */
    public function generate(Business $business): JsonResponse
    {
        $now = now();
        $currentFrom = $now->copy()->subDays(30)->startOfDay();
        $previousFrom = $now->copy()->subDays(60)->startOfDay();
        $previousTo = $currentFrom->copy()->subSecond();

        $currentTx = $business->transactions()
            ->with('items')
            ->whereBetween('transaction_date', [$currentFrom, $now])
            ->get();

        $previousTx = $business->transactions()
            ->whereBetween('transaction_date', [$previousFrom, $previousTo])
            ->get();

        $generated = [];

        $generated[] = $this->trendInsight($business, $currentTx, $previousTx);
        $generated[] = $this->bestSellerInsight($business, $currentTx);
        $generated[] = $this->mostProfitableInsight($business, $currentTx);
        $generated = array_merge($generated, $this->criticalStockInsights($business));
        $generated = array_merge($generated, $this->slowMovingInsights($business, $currentTx));

        // Buang yang null (rule tidak menghasilkan insight karena data kurang)
        $generated = array_values(array_filter($generated));

        $saved = collect($generated)->map(
            fn (array $insight) => $business->insights()->create($insight)
        );

        return response()->json([
            'message' => count($saved) > 0
                ? count($saved) . ' insight baru berhasil digenerate.'
                : 'Belum ada insight baru — data transaksi masih terlalu sedikit.',
            'data' => $saved,
        ], 201);
    }

    /**
     * Bandingkan omzet 30 hari ini vs 30 hari sebelumnya.
     */
    private function trendInsight(Business $business, $currentTx, $previousTx): ?array
    {
        $currentOmzet = $currentTx->sum('total_amount');
        $previousOmzet = $previousTx->sum('total_amount');

        if ($previousOmzet == 0) {
            return null; // belum ada baseline untuk dibandingkan
        }

        $change = (($currentOmzet - $previousOmzet) / $previousOmzet) * 100;
        $direction = $change >= 0 ? 'naik' : 'turun';

        return [
            'type' => 'trend',
            'title' => "Omzet {$direction} " . abs(round($change)) . '% dibanding 30 hari sebelumnya',
            'description' => sprintf(
                'Omzet 30 hari terakhir Rp%s, dibanding Rp%s pada periode sebelumnya (%s %s%%).',
                number_format($currentOmzet, 0, ',', '.'),
                number_format($previousOmzet, 0, ',', '.'),
                $direction,
                abs(round($change))
            ),
            'priority' => $change < -10 ? 'high' : ($change < 0 ? 'medium' : 'low'),
        ];
    }

    private function bestSellerInsight(Business $business, $currentTx): ?array
    {
        $items = $currentTx->flatMap(fn ($t) => $t->items);

        if ($items->isEmpty()) {
            return null;
        }

        $top = $items->groupBy('product_id')
            ->map(fn ($group) => $group->sum('quantity'))
            ->sortDesc()
            ->take(1);

        $productId = $top->keys()->first();
        $qty = $top->first();
        $product = $business->products()->find($productId);

        return [
            'type' => 'best_seller',
            'title' => "{$product?->name} adalah produk terlaris",
            'description' => "{$product?->name} terjual {$qty} unit dalam 30 hari terakhir — pertimbangkan untuk menjaga stok tetap aman.",
            'priority' => 'medium',
        ];
    }

    private function mostProfitableInsight(Business $business, $currentTx): ?array
    {
        $items = $currentTx->flatMap(fn ($t) => $t->items);

        if ($items->isEmpty()) {
            return null;
        }

        $productIds = $items->pluck('product_id')->unique();
        $products = $business->products()->whereIn('id', $productIds)->get()->keyBy('id');

        $profitByProduct = $items->groupBy('product_id')->map(function ($group, $productId) use ($products) {
            $product = $products->get($productId);
            $costPrice = $product ? (float) $product->cost_price : 0;

            return $group->sum(fn ($i) => ((float) $i->selling_price - $costPrice) * $i->quantity);
        })->sortDesc();

        $topProductId = $profitByProduct->keys()->first();
        $topProfit = $profitByProduct->first();
        $product = $products->get($topProductId);

        if (!$product || $topProfit <= 0) {
            return null;
        }

        return [
            'type' => 'most_profitable',
            'title' => "{$product->name} menyumbang laba terbesar",
            'description' => "{$product->name} menghasilkan laba kotor sekitar Rp" . number_format($topProfit, 0, ',', '.') . ' dalam 30 hari terakhir.',
            'priority' => 'low',
        ];
    }

    /**
     * Satu insight per produk yang stoknya KRITIS atau PERLU PERHATIAN.
     */
    private function criticalStockInsights(Business $business): array
    {
        return $business->products()
            ->get()
            ->filter(fn ($p) => $p->stock_status !== 'AMAN')
            ->map(function ($product) {
                $isCritical = $product->stock_status === 'KRITIS';

                return [
                    'type' => 'stock_alert',
                    'title' => "Stok {$product->name} {$product->stock_status}",
                    'description' => "Stok {$product->name} tersisa {$product->stock} unit (minimum {$product->minimum_stock}). Segera lakukan restock.",
                    'priority' => $isCritical ? 'high' : 'medium',
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Produk yang sudah lama tidak terjual sama sekali (0 transaksi
     * dalam 30 hari terakhir), padahal stoknya masih ada — indikasi
     * produk kurang diminati atau butuh promosi.
     */
    private function slowMovingInsights(Business $business, $currentTx): array
    {
        $soldProductIds = $currentTx->flatMap(fn ($t) => $t->items)->pluck('product_id')->unique();

        return $business->products()
            ->get()
            ->reject(fn ($p) => $soldProductIds->contains($p->id))
            ->filter(fn ($p) => $p->stock > 0)
            ->map(fn ($product) => [
                'type' => 'slow_moving',
                'title' => "{$product->name} belum terjual dalam 30 hari",
                'description' => "{$product->name} punya stok {$product->stock} unit tapi tidak ada penjualan dalam 30 hari terakhir. Pertimbangkan promosi atau evaluasi harga.",
                'priority' => 'low',
            ])
            ->values()
            ->all();
    }
}
