<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdvisorController extends Controller
{
    /**
     * POST /api/businesses/{business}/advisor
     *
     * Body:
     * {
     *     "question": "Bagaimana cara meningkatkan omzet bulan ini?"
     * }
     */
    public function ask(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
        ]);

        $apiKey = config('services.gemini.api_key');

        if (empty($apiKey)) {
            return response()->json([
                'message' => 'GEMINI_API_KEY belum diatur di server.',
            ], 500);
        }

        $context = $this->buildBusinessContext($business);

        $prompt = <<<PROMPT
Kamu adalah AI Business Advisor untuk aplikasi UMKM Insight.

Tugasmu memberi saran bisnis yang PRAKTIS dan SPESIFIK berdasarkan data
nyata yang diberikan, bukan saran generik.

Jawab dalam Bahasa Indonesia, singkat, maksimal 4-5 kalimat atau beberapa
poin, dan langsung actionable.

Data bisnis "{$business->name}" (kategori: {$business->category}):

{$context}

Pertanyaan dari pemilik bisnis:
"{$validated['question']}"

Jawab berdasarkan data di atas.

Kalau data tidak cukup untuk menjawab spesifik, katakan dengan jelas
data apa yang masih kurang.
PROMPT;

        $response = Http::timeout(30)->post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey,
            [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
            ]
        );

        if ($response->failed()) {
            return response()->json([
                'message' => 'Gagal menghubungi AI Advisor.',
                'error' => $response->json('error.message') ?? $response->body(),
            ], 502);
        }

        $answer = $response->json('candidates.0.content.parts.0.text');

        return response()->json([
            'question' => $validated['question'],
            'answer' => trim(
                $answer ?? 'Maaf, AI tidak memberikan jawaban. Coba pertanyaan lain.'
            ),
        ]);
    }

    /**
     * Mengambil ringkasan data bisnis 30 hari terakhir
     * untuk dijadikan context AI.
     */
    private function buildBusinessContext(Business $business): string
    {
        $from = now()->subDays(30);

        $transactions = $business->transactions()
            ->with('items')
            ->where('transaction_date', '>=', $from)
            ->get();

        $totalOmzet = $transactions->sum('total_amount');
        $totalTransaksi = $transactions->count();

        $items = $transactions->flatMap(
            fn ($transaction) => $transaction->items
        );

        $productIds = $items
            ->pluck('product_id')
            ->unique();

        $products = $business->products()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $bestSeller = $items
            ->groupBy('product_id')
            ->map(fn ($group, $id) => [
                'name' => $products->get($id)?->name ?? 'Produk #' . $id,
                'qty' => $group->sum('quantity'),
            ])
            ->sortByDesc('qty')
            ->take(3)
            ->values();

        $criticalStock = $business->products()
            ->get()
            ->filter(
                fn ($product) => $product->stock_status !== 'AMAN'
            )
            ->map(
                fn ($product) =>
                    "{$product->name} (sisa {$product->stock}, status {$product->stock_status})"
            )
            ->values();

        $lines = [];

        $lines[] = '- Total omzet 30 hari terakhir: Rp'
            . number_format($totalOmzet, 0, ',', '.');

        $lines[] = "- Jumlah transaksi: {$totalTransaksi}";

        $lines[] = '- Produk terlaris: ' . (
            $bestSeller->isEmpty()
                ? 'belum ada data penjualan'
                : $bestSeller
                    ->map(
                        fn ($product) =>
                            "{$product['name']} ({$product['qty']} unit)"
                    )
                    ->join(', ')
        );

        $lines[] = '- Stok yang perlu perhatian: ' . (
            $criticalStock->isEmpty()
                ? 'tidak ada, semua stok aman'
                : $criticalStock->join(', ')
        );

        return implode("\n", $lines);
    }
}