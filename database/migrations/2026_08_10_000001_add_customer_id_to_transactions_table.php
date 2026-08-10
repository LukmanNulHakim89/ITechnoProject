<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menambahkan kolom customer_id ke tabel transactions.
     * Nullable karena tidak semua transaksi UMKM tercatat pelanggannya
     * (misal transaksi tunai tanpa identitas pembeli).
     * Diperlukan untuk fitur Customer Insight (7.9) di README.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('customer_id')
                ->nullable()
                ->after('business_id')
                ->constrained('customers')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_id');
        });
    }
};
