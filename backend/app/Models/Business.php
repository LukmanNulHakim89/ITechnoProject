<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'owner_id',
        'name',
        'category',
        'address',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function insights()
    {
        return $this->hasMany(Insight::class);
    }
}
