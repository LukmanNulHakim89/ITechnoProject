<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryLogController;
use App\Http\Controllers\Api\DashboardController;

// Product
Route::get('/businesses/{business}/products', [ProductController::class, 'index']);
Route::post('/businesses/{business}/products', [ProductController::class, 'store']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::put('/products/{product}', [ProductController::class, 'update']);
Route::patch('/products/{product}', [ProductController::class, 'update']);
Route::delete('/products/{product}', [ProductController::class, 'destroy']);

// Transaction
Route::get('/businesses/{business}/transactions', [TransactionController::class, 'index']);
Route::post('/businesses/{business}/transactions', [TransactionController::class, 'store']);
Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

// Customer
Route::get('/businesses/{business}/customers', [CustomerController::class, 'index']);
Route::post('/businesses/{business}/customers', [CustomerController::class, 'store']);
Route::get('/customers/{customer}', [CustomerController::class, 'show']);
Route::put('/customers/{customer}', [CustomerController::class, 'update']);
Route::patch('/customers/{customer}', [CustomerController::class, 'update']);
Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

// Expense
Route::get('/businesses/{business}/expenses', [ExpenseController::class, 'index']);
Route::post('/businesses/{business}/expenses', [ExpenseController::class, 'store']);
Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
Route::patch('/expenses/{expense}', [ExpenseController::class, 'update']);
Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);

// Inventory Logs
Route::get(
    '/businesses/{business}/inventory-logs',
    [InventoryLogController::class, 'index']
);

Route::get(
    '/inventory-logs/{inventoryLog}',
    [InventoryLogController::class, 'show']
);

// Dashboard
Route::get('/businesses/{business}/dashboard', [DashboardController::class, 'index']);