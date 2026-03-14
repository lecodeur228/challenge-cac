<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Products
    Route::get('/products',      [ProductController::class, 'index']);
    Route::post('/products',     [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Suppliers
    Route::get('/suppliers',      [SupplierController::class, 'index']);
    Route::post('/suppliers',     [SupplierController::class, 'store']);
    Route::get('/suppliers/{id}', [SupplierController::class, 'show']);
    Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

    // Purchases
    Route::get('/purchases',      [PurchaseController::class, 'index']);
    Route::post('/purchases',     [PurchaseController::class, 'store']);
    Route::get('/purchases/{id}', [PurchaseController::class, 'show']);

    // Sales
    Route::get('/sales',      [SaleController::class, 'index']);
    Route::post('/sales',     [SaleController::class, 'store']);
    Route::get('/sales/{id}', [SaleController::class, 'show']);
});
