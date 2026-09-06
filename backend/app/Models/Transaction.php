<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'customer_id',
        'transaction_date',
        'payment_method',
        'total_amount',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Nullable — tidak semua transaksi tercatat pelanggannya.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Hitung ulang total_amount dari SUM(subtotal) transaction_items.
     * Panggil ini setelah items ditambah/diubah/dihapus, supaya
     * total_amount tidak pernah tidak-sinkron dengan detail item-nya.
     */
    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('subtotal');
        $this->save();
    }
}
