<?php

use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Transaction Routes
|--------------------------------------------------------------------------
| Tambahkan blok ini ke routes/api.php yang sudah ada (jangan timpa,
| cukup tambahkan import TransactionController di paling atas + baris ini).
*/

Route::get('/businesses/{business}/transactions', [TransactionController::class, 'index']);
Route::post('/businesses/{business}/transactions', [TransactionController::class, 'store']);
Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
