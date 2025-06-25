<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\BarberController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::apiResource('shops', ShopController::class);
    Route::get('/shops/{shop}/services', [ServiceController::class, 'index']);
    Route::post('/shops/{shop}/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    Route::get('/shops/{shop}/barbers', [BarberController::class, 'index']);
    Route::post('/shops/{shop}/barbers', [BarberController::class, 'store']);
    Route::get('/barbers/{barber}', [BarberController::class, 'show']);
    Route::put('/barbers/{barber}', [BarberController::class, 'update']);
    Route::get('/barbers/{barber}/availability', [BarberController::class, 'availability']);

    Route::apiResource('bookings', BookingController::class);
    Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-bookings', [DashboardController::class, 'recentBookings']);
});

Route::get('/public/shops', [ShopController::class, 'publicIndex']);
Route::get('/public/shops/{shop}', [ShopController::class, 'publicShow']);
