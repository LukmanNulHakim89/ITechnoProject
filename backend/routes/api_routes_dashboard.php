<?php

use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
| Tambahkan import DashboardController di paling atas routes/api.php,
| lalu tambahkan baris ini.
*/

Route::get('/businesses/{business}/dashboard', [DashboardController::class, 'index']);
