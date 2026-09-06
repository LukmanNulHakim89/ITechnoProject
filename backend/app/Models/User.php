<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Tabel ini tidak punya kolom updated_at.
     */
    public $timestamps = false;

    protected $fillable = [
        'name',
        'email',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    /**
     * Kolom password di tabel ini bernama "password_hash",
     * bukan "password" seperti default Laravel. Auth guard
     * memanggil method ini untuk mengambil hash password.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Satu user bisa memiliki beberapa bisnis.
     */
    public function businesses()
    {
        return $this->hasMany(Business::class, 'owner_id');
    }
}
