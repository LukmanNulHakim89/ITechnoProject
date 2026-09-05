<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PostgreSQL otomatis index PRIMARY KEY, tapi tidak untuk foreign key.
     * Tabel ini banyak dipakai untuk query agregasi (omzet per produk,
     * per hari, dst.), jadi kolom FK perlu index eksplisit.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('business_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('business_id');
            $table->index('transaction_date');
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->index('transaction_id');
            $table->index('product_id');
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->index('product_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index('business_id');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->index('business_id');
            $table->index('expense_date');
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->index('business_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['business_id']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['business_id']);
            $table->dropIndex(['transaction_date']);
        });

        Schema::table('transaction_items', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['business_id']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['business_id']);
            $table->dropIndex(['expense_date']);
        });

        Schema::table('insights', function (Blueprint $table) {
            $table->dropIndex(['business_id']);
        });
    }
};
