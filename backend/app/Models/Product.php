<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'name',
        'category',
        'selling_price',
        'cost_price',
        'stock',
        'minimum_stock',
    ];

    protected $casts = [
        'selling_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock' => 'integer',
        'minimum_stock' => 'integer',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    /**
     * Margin per unit = selling_price - cost_price.
     * Dipakai untuk perhitungan Best Profit di Insight Engine.
     */
    public function getMarginAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->cost_price;
    }

    /**
     * Status stok: AMAN, PERLU PERHATIAN, atau KRITIS.
     * Sesuai kategori di README (7.3 Product & Stock Management).
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= $this->minimum_stock) {
            return 'KRITIS';
        }

        if ($this->stock <= $this->minimum_stock * 2) {
            return 'PERLU PERHATIAN';
        }

        return 'AMAN';
    }
}
