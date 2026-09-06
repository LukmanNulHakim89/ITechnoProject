<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InventoryLogController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\InsightController;
use App\Http\Controllers\Api\AdvisorController;
use App\Http\Controllers\Api\BusinessController;


/*
|--------------------------------------------------------------------------
| Authentication - Public
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Businesses
    |--------------------------------------------------------------------------
    */

    Route::get('/businesses', [BusinessController::class, 'index']);
    Route::post('/businesses', [BusinessController::class, 'store']);


    /*
    |--------------------------------------------------------------------------
    | Business Owner Routes
    |--------------------------------------------------------------------------
     */

    Route::middleware('business.owner')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/products',
            [ProductController::class, 'index']
        );

        Route::post(
            '/businesses/{business}/products',
            [ProductController::class, 'store']
        );


        /*
        |--------------------------------------------------------------------------
        | Transactions
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/transactions',
            [TransactionController::class, 'index']
        );

        Route::post(
            '/businesses/{business}/transactions',
            [TransactionController::class, 'store']
        );


        /*
        |--------------------------------------------------------------------------
        | Customers
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/customers',
            [CustomerController::class, 'index']
        );

        Route::post(
            '/businesses/{business}/customers',
            [CustomerController::class, 'store']
        );


        /*
        |--------------------------------------------------------------------------
        | Expenses
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/expenses',
            [ExpenseController::class, 'index']
        );

        Route::post(
            '/businesses/{business}/expenses',
            [ExpenseController::class, 'store']
        );


        /*
        |--------------------------------------------------------------------------
        | Inventory Logs
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/inventory-logs',
            [InventoryLogController::class, 'index']
        );


        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/dashboard',
            [DashboardController::class, 'index']
        );


        /*
        |--------------------------------------------------------------------------
        | Insights
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/businesses/{business}/insights',
            [InsightController::class, 'index']
        );

        Route::post(
            '/businesses/{business}/insights/generate',
            [InsightController::class, 'generate']
        );


        /*
        |--------------------------------------------------------------------------
        | AI Advisor
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/businesses/{business}/advisor',
            [AdvisorController::class, 'ask']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Product Resources
    |--------------------------------------------------------------------------
    */

    Route::middleware('product.owner')->group(function () {

        Route::get(
            '/products/{product}',
            [ProductController::class, 'show']
        );

        Route::put(
            '/products/{product}',
            [ProductController::class, 'update']
        );

        Route::patch(
            '/products/{product}',
            [ProductController::class, 'update']
        );

        Route::delete(
            '/products/{product}',
            [ProductController::class, 'destroy']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Transaction Resources
    |--------------------------------------------------------------------------
    */

    Route::middleware('transaction.owner')->group(function () {
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
    });



    /*
    |--------------------------------------------------------------------------
    | Customer Resources
    |--------------------------------------------------------------------------
    */

    Route::middleware('customer.owner')->group(function () {
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
        Route::put('/customers/{customer}', [CustomerController::class, 'update']);
        Route::patch('/customers/{customer}', [CustomerController::class, 'update']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Expense Resources
    |--------------------------------------------------------------------------
    */

    Route::middleware('expense.owner')->group(function () {

        Route::get(
            '/expenses/{expense}',
            [ExpenseController::class, 'show']
        );

        Route::put(
            '/expenses/{expense}',
            [ExpenseController::class, 'update']
        );

        Route::patch(
            '/expenses/{expense}',
            [ExpenseController::class, 'update']
        );

        Route::delete(
            '/expenses/{expense}',
            [ExpenseController::class, 'destroy']
        );
    });


    /*
    |--------------------------------------------------------------------------
    | Inventory Log Resources
    |--------------------------------------------------------------------------
    */

    Route::middleware('inventorylog.owner')->group(function () {

        Route::get(
            '/inventory-logs/{inventoryLog}',
            [InventoryLogController::class, 'show']
        );
    });
});