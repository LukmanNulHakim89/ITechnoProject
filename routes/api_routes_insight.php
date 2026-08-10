<?php

use App\Http\Controllers\Api\InsightController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Insight Routes
|--------------------------------------------------------------------------
| Tambahkan import InsightController di paling atas routes/api.php,
| lalu tambahkan 2 baris ini.
*/

Route::get('/businesses/{business}/insights', [InsightController::class, 'index']);
Route::post('/businesses/{business}/insights/generate', [InsightController::class, 'generate']);
