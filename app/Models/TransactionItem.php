<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'quantity',
        'selling_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selling_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        // Subtotal selalu quantity * selling_price, dihitung otomatis
        // supaya tidak bisa tidak-sinkron kalau ada input manual yang salah.
        static::saving(function (TransactionItem $item) {
            $item->subtotal = $item->quantity * $item->selling_price;
        });

        // Setiap kali item berubah, sinkronkan ulang total_amount
        // di transaksi induknya.
        static::saved(function (TransactionItem $item) {
            $item->transaction?->recalculateTotal();
        });

        static::deleted(function (TransactionItem $item) {
            $item->transaction?->recalculateTotal();
        });
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
