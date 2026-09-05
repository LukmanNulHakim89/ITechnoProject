<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Insight extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'business_id',
        'type',
        'title',
        'description',
        'priority',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
