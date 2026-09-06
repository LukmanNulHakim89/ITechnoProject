<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountSeeder extends Seeder
{
    /**
     * Seeder ini membuat 1 akun demo yang KELIHATAN sudah lama dipakai ÔÇö
     * untuk keperluan presentasi/demo lomba, bukan akun kosong baru daftar.
     *
     * Login demo: demo@nexora.test / password123
     *
     * Jalankan dengan:
     *   php artisan db:seed --class=DemoAccountSeeder
     */
    public function run(): void
    {
        $user = User::create([
            'name' => 'Budi Santoso',
            'email' => 'demo@nexora.test',
            'password_hash' => Hash::make('password123'),
        ]);

        $business = Business::create([
            'owner_id' => $user->id,
            'name' => 'Kedai Kopi Nexora',
            'category' => 'Kuliner',
            'address' => 'Jl. Merdeka No. 12, Karawang',
        ]);

        // ---------------------------------------------------------------
        // PRODUCTS ÔÇö beragam status stok, biar dashboard/insight kelihatan
        // hidup (ada yang AMAN, ada yang KRITIS)
        // ---------------------------------------------------------------
        $productDefs = [
            ['name' => 'Es Kopi Susu', 'selling_price' => 18000, 'cost_price' => 8000, 'stock' => 45, 'minimum_stock' => 10],
            ['name' => 'Kopi Latte', 'selling_price' => 22000, 'cost_price' => 10000, 'stock' => 30, 'minimum_stock' => 8],
            ['name' => 'Americano', 'selling_price' => 15000, 'cost_price' => 6000, 'stock' => 25, 'minimum_stock' => 8],
            ['name' => 'Cappuccino', 'selling_price' => 20000, 'cost_price' => 9000, 'stock' => 20, 'minimum_stock' => 8],
            ['name' => 'Roti Bakar Coklat', 'selling_price' => 15000, 'cost_price' => 7000, 'stock' => 8, 'minimum_stock' => 10], // PERLU PERHATIAN
            ['name' => 'Susu UHT Full Cream', 'selling_price' => 12000, 'cost_price' => 8000, 'stock' => 2, 'minimum_stock' => 10], // KRITIS
        ];

        $products = collect($productDefs)->map(
            fn ($def) => Product::create(['business_id' => $business->id, ...$def])
        );

        // ---------------------------------------------------------------
        // CUSTOMERS
        // ---------------------------------------------------------------
        $customers = collect([
            ['name' => 'Andi Wijaya', 'phone' => '081234567801'],
            ['name' => 'Sari Dewi', 'phone' => '081234567802'],
            ['name' => 'Rudi Hartono', 'phone' => '081234567803'],
        ])->map(
            fn ($def) => Customer::create(['business_id' => $business->id, ...$def])
        );

        // ---------------------------------------------------------------
        // TRANSACTIONS ÔÇö 30 hari terakhir, beberapa transaksi per hari,
        // supaya Dashboard/Insight/Analytics semua ada isinya
        // ---------------------------------------------------------------
        $paymentMethods = ['Cash', 'QRIS', 'QRIS', 'Transfer'];

        for ($day = 29; $day >= 0; $day--) {
            $date = now()->subDays($day);
            $transactionsToday = rand(2, 6);

            for ($i = 0; $i < $transactionsToday; $i++) {
                $useCustomer = rand(0, 100) < 60; // 60% transaksi tercatat pelanggannya

                $transaction = Transaction::create([
                    'business_id' => $business->id,
                    'customer_id' => $useCustomer ? $customers->random()->id : null,
                    'transaction_date' => $date->copy()->setTime(rand(7, 20), rand(0, 59)),
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'total_amount' => 0,
                ]);

                // 1-3 item produk per transaksi
                $itemCount = rand(1, 3);
                $chosenProducts = $products->random(min($itemCount, $products->count()));

                foreach ($chosenProducts as $product) {
                    $qty = rand(1, 3);

                    // Skip kalau stok display sudah terlalu tipis, biar
                    // stok akhir tetap masuk akal (tidak minus jauh)
                    if ($product->stock < $qty) {
                        continue;
                    }

                    $transaction->items()->create([
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'selling_price' => $product->selling_price,
                        'cost_price' => $product->cost_price,
                    ]);

                    $product->decrement('stock', $qty);
                }

                $transaction->recalculateTotal();
            }
        }

        // ---------------------------------------------------------------
        // EXPENSES ÔÇö beberapa pengeluaran dalam 30 hari terakhir
        // ---------------------------------------------------------------
        $expenseDefs = [
            ['description' => 'Sewa tempat bulan ini', 'amount' => 1500000, 'days_ago' => 25],
            ['description' => 'Belanja bahan baku', 'amount' => 850000, 'days_ago' => 18],
            ['description' => 'Listrik & air', 'amount' => 400000, 'days_ago' => 10],
            ['description' => 'Gaji karyawan paruh waktu', 'amount' => 1200000, 'days_ago' => 5],
        ];

        foreach ($expenseDefs as $def) {
            Expense::create([
                'business_id' => $business->id,
                'description' => $def['description'],
                'amount' => $def['amount'],
                'expense_date' => now()->subDays($def['days_ago'])->toDateString(),
            ]);
        }

        $this->command->info('Demo account created: demo@nexora.test / password123');
    }
}
