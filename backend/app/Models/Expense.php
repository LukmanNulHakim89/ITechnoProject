<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'description',
        'amount',
        'expense_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
