<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * businesses.owner_id sebelumnya ON DELETE CASCADE — kalau user (owner)
     * dihapus, seluruh bisnis, produk, transaksi, dan data terkait ikut
     * terhapus tanpa peringatan. Diganti jadi RESTRICT: user tidak bisa
     * dihapus selama masih punya bisnis, jadi harus dipindah-tangankan atau
     * bisnisnya dihapus dulu secara eksplisit.
     *
     * Catatan: nama constraint aslinya "businesses_owner_id_fkey" (konvensi
     * penamaan default PostgreSQL/pg_dump), bukan "businesses_owner_id_foreign"
     * (konvensi Laravel) — karena tabel dibuat manual lewat SQL, bukan lewat
     * migration Laravel.
     */
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign('businesses_owner_id_fkey');
            $table->foreign('owner_id')
                ->references('id')->on('users')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->foreign('owner_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });
    }
};
