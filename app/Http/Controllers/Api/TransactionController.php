<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Customer;
use App\Models\InventoryLog;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    /**
     * GET /api/businesses/{business}/transactions
     */
    public function index(Business $business): JsonResponse
    {
        $transactions = $business->transactions()
            ->with('items.product', 'customer')
            ->orderByDesc('transaction_date')
            ->get();

        return response()->json([
            'data' => $transactions->map(fn (Transaction $t) => $this->transform($t)),
        ]);
    }

    /**
     * GET /api/transactions/{transaction}
     */
    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load('items.product', 'customer');

        return response()->json([
            'data' => $this->transform($transaction),
        ]);
    }

    /**
     * POST /api/businesses/{business}/transactions
     *
     * Body:
     * {
     *   "customer_id": 3,              // opsional
     *   "items": [
     *     { "product_id": 1, "quantity": 2 },
     *     { "product_id": 4, "quantity": 1 }
     *   ]
     * }
     *
     * selling_price diambil otomatis dari harga produk saat ini
     * (bukan input manual), supaya tidak bisa dimanipulasi dari luar.
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'transaction_date' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        // Pastikan customer (kalau diisi) memang milik business ini.
        if (!empty($validated['customer_id'])) {
            $belongsToBusiness = Customer::where('id', $validated['customer_id'])
                ->where('business_id', $business->id)
                ->exists();

            if (!$belongsToBusiness) {
                throw ValidationException::withMessages([
                    'customer_id' => 'Customer tidak ditemukan pada bisnis ini.',
                ]);
            }
        }

        try {
            $transaction = DB::transaction(function () use ($validated, $business) {
                // Lock baris produk yang terlibat supaya aman dari race condition
                // kalau ada 2 transaksi bersamaan untuk produk yang sama.
                $productIds = collect($validated['items'])->pluck('product_id')->unique();

                $products = Product::where('business_id', $business->id)
                    ->whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                // Validasi semua produk ada di business ini dan stok cukup,
                // SEBELUM ada perubahan apapun ke database.
                foreach ($validated['items'] as $item) {
                    $product = $products->get($item['product_id']);

                    if (!$product) {
                        throw ValidationException::withMessages([
                            'items' => "Produk ID {$item['product_id']} tidak ditemukan pada bisnis ini.",
                        ]);
                    }

                    if ($product->stock < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => "Stok {$product->name} tidak cukup (tersisa {$product->stock}, diminta {$item['quantity']}).",
                        ]);
                    }
                }

                $transaction = $business->transactions()->create([
                    'customer_id' => $validated['customer_id'] ?? null,
                    'transaction_date' => $validated['transaction_date'] ?? now(),
                    'total_amount' => 0, // dihitung ulang otomatis setelah item dibuat
                ]);

                foreach ($validated['items'] as $item) {
                    $product = $products->get($item['product_id']);

                    $transaction->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'selling_price' => $product->selling_price,
                        // subtotal dihitung otomatis lewat model event TransactionItem
                    ]);

                    $product->decrement('stock', $item['quantity']);

                    InventoryLog::create([
                        'product_id' => $product->id,
                        'change_type' => 'out',
                        'quantity' => $item['quantity'],
                        'note' => "Terjual pada transaksi #{$transaction->id}",
                    ]);
                }

                return $transaction->refresh();
            });
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Transaksi gagal diproses.',
                'errors' => $e->errors(),
            ], 422);
        }

        $transaction->load('items.product', 'customer');

        return response()->json([
            'message' => 'Transaksi berhasil dicatat.',
            'data' => $this->transform($transaction),
        ], 201);
    }

    /**
     * DELETE /api/transactions/{transaction}
     * Membatalkan transaksi: kembalikan stok produk, lalu hapus transaksinya.
     */
    public function destroy(Transaction $transaction): JsonResponse
    {
        DB::transaction(function () use ($transaction) {
            foreach ($transaction->items as $item) {
                $item->product?->increment('stock', $item->quantity);

                InventoryLog::create([
                    'product_id' => $item->product_id,
                    'change_type' => 'in',
                    'quantity' => $item->quantity,
                    'note' => "Pembatalan transaksi #{$transaction->id}",
                ]);
            }

            // transaction_items ikut terhapus otomatis (ON DELETE CASCADE)
            $transaction->delete();
        });

        return response()->json([
            'message' => 'Transaksi berhasil dibatalkan, stok dikembalikan.',
        ]);
    }

    private function transform(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'business_id' => $transaction->business_id,
            'customer' => $transaction->customer ? [
                'id' => $transaction->customer->id,
                'name' => $transaction->customer->name,
            ] : null,
            'transaction_date' => $transaction->transaction_date,
            'total_amount' => (float) $transaction->total_amount,
            'items' => $transaction->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name,
                'quantity' => $item->quantity,
                'selling_price' => (float) $item->selling_price,
                'subtotal' => (float) $item->subtotal,
            ]),
        ];
    }
}
