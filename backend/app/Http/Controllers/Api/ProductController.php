<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * GET /api/businesses/{business}/products
     * Daftar produk milik satu bisnis. Bisa difilter status stok:
     * /api/businesses/{business}/products?status=kritis
     */
    public function index(Request $request, Business $business): JsonResponse
    {
        $products = $business->products()->get();

        if ($status = $request->query('status')) {
            $products = $products->filter(
                fn (Product $product) => strtolower($product->stock_status) === strtolower($status)
            )->values();
        }

        return response()->json([
            'data' => $products->map(fn (Product $p) => $this->transform($p)),
        ]);
    }

    /**
     * POST /api/businesses/{business}/products
     */
    public function store(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $product = $business->products()->create($validated);

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $this->transform($product),
        ], 201);
    }

    /**
     * GET /api/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $this->transform($product),
        ]);
    }

    /**
     * PUT/PATCH /api/products/{product}
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'selling_price' => ['sometimes', 'numeric', 'min:0'],
            'cost_price' => ['sometimes', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'minimum_stock' => ['sometimes', 'integer', 'min:0'],
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $this->transform($product),
        ]);
    }

    /**
     * DELETE /api/products/{product}
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * Bentuk response konsisten, termasuk field turunan (margin, stock_status)
     * yang sudah dihitung otomatis lewat accessor di model Product.
     */
    private function transform(Product $product): array
    {
        return [
            'id' => $product->id,
            'business_id' => $product->business_id,
            'name' => $product->name,
            'category' => $product->category,
            'selling_price' => (float) $product->selling_price,
            'cost_price' => (float) $product->cost_price,
            'margin' => $product->margin,
            'stock' => $product->stock,
            'minimum_stock' => $product->minimum_stock,
            'stock_status' => $product->stock_status,
            'created_at' => $product->created_at,
        ];
    }
}
