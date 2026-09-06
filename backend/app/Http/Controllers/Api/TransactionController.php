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
            ->orderByDesc('id')
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
     * Mendukung penambahan transaksi baik via product_id maupun nama produk (product_name).
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'transaction_date' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'total_amount' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['nullable', 'integer'],
            'items.*.product_name' => ['nullable', 'string', 'max:150'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.selling_price' => ['nullable', 'numeric', 'min:0'],
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
                $transaction = $business->transactions()->create([
                    'customer_id' => $validated['customer_id'] ?? null,
                    'transaction_date' => $validated['transaction_date'] ?? now(),
                    'payment_method' => $validated['payment_method'] ?? 'Cash',
                    'total_amount' => 0,
                ]);

                foreach ($validated['items'] as $item) {
                    $product = null;

                    if (!empty($item['product_id'])) {
                        $product = Product::where('business_id', $business->id)
                            ->where('id', $item['product_id'])
                            ->lockForUpdate()
                            ->first();
                    } elseif (!empty($item['product_name'])) {
                        $trimmedName = trim($item['product_name']);
                        $product = Product::where('business_id', $business->id)
                            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
                            ->lockForUpdate()
                            ->first();

                        if (!$product) {
                            $itemSellingPrice = $item['selling_price'] ?? (
                                (!empty($validated['total_amount']) && $item['quantity'] > 0)
                                    ? round($validated['total_amount'] / $item['quantity'], 2)
                                    : 10000
                            );
                            $product = $business->products()->create([
                                'name' => $trimmedName,
                                'selling_price' => $itemSellingPrice,
                                'cost_price' => round($itemSellingPrice * 0.7, 2),
                                'stock' => max(20, $item['quantity'] + 10),
                                'minimum_stock' => 5,
                            ]);
                        }
                    }

                    if (!$product) {
                        throw ValidationException::withMessages([
                            'items' => 'Produk tidak ditemukan pada bisnis ini. Pastikan memilih produk yang ada atau isi nama produk.',
                        ]);
                    }

                    if ($product->stock < $item['quantity']) {
                        throw ValidationException::withMessages([
                            'items' => "Stok {$product->name} tidak mencukupi (tersisa {$product->stock}, diminta {$item['quantity']}).",
                        ]);
                    }

                    $sellingPrice = $item['selling_price'] ?? $product->selling_price;
                    $costPrice = $product->cost_price ?? 0;

                    $transaction->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'selling_price' => $sellingPrice,
                        'cost_price' => $costPrice,
                    ]);

                    $product->decrement('stock', $item['quantity']);

                    InventoryLog::create([
                        'product_id' => $product->id,
                        'change_type' => 'out',
                        'quantity' => $item['quantity'],
                        'note' => "Terjual pada transaksi #{$transaction->id}",
                    ]);
                }

                $transaction->recalculateTotal();

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
            'customer_name' => $transaction->customer?->name ?? 'Walk-in Customer',
            'payment_method' => $transaction->payment_method ?? 'Cash',

            'transaction_date' => $transaction->transaction_date,
            'total_amount' => (float) $transaction->total_amount,

            'items' => $transaction->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name ?? ('Produk #' . $item->product_id),
                'quantity' => $item->quantity,
                'selling_price' => (float) $item->selling_price,
                'cost_price' => (float) $item->cost_price,
                'subtotal' => (float) $item->subtotal,
            ]),
        ];
    }
}