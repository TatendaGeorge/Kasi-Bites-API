<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceTokenController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WebPushController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\ReportsController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\AddonController;
use App\Http\Controllers\Api\Admin\StoreSettingController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products (public)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Store settings (public - for checkout)
Route::get('/store/settings', [App\Http\Controllers\Api\StoreController::class, 'settings']);

// Orders - public endpoints
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

// Device tokens (can be used by guests too)
Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
Route::delete('/device-tokens', [DeviceTokenController::class, 'destroy']);

// Web Push subscriptions (can be used by guests too)
Route::post('/web-push/subscribe', [WebPushController::class, 'subscribe']);
Route::post('/web-push/unsubscribe', [WebPushController::class, 'unsubscribe']);
Route::get('/web-push/vapid-public-key', [WebPushController::class, 'vapidPublicKey']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Profile
    Route::put('/user/profile', [ProfileController::class, 'update']);

    // User's orders
    Route::get('/orders', [OrderController::class, 'index']);

    // Admin routes (update order status)
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
});

// Admin API routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/active', [AdminOrderController::class, 'active']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}', [AdminOrderController::class, 'update']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    // Products
    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{product}', [AdminProductController::class, 'show']);
    Route::patch('/products/{product}', [AdminProductController::class, 'update']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    Route::patch('/products/{product}/toggle-availability', [AdminProductController::class, 'toggleAvailability']);
    Route::patch('/products/{product}/toggle-featured', [AdminProductController::class, 'toggleFeatured']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::post('/categories/reorder', [CategoryController::class, 'reorder']);

    // Add-ons
    Route::get('/addons', [AddonController::class, 'index']);
    Route::post('/addons', [AddonController::class, 'store']);
    Route::get('/addons/{addon}', [AddonController::class, 'show']);
    Route::patch('/addons/{addon}', [AddonController::class, 'update']);
    Route::delete('/addons/{addon}', [AddonController::class, 'destroy']);
    Route::post('/addons/reorder', [AddonController::class, 'reorder']);

    // Store Settings
    Route::get('/settings', [StoreSettingController::class, 'index']);
    Route::patch('/settings', [StoreSettingController::class, 'update']);
    Route::get('/settings/{key}', [StoreSettingController::class, 'show']);

    // Reports & Financials
    Route::get('/reports/overview', [ReportsController::class, 'overview']);
    Route::get('/reports/revenue-chart', [ReportsController::class, 'revenueChart']);
    Route::get('/reports/top-products', [ReportsController::class, 'topProducts']);
    Route::get('/reports/hourly-distribution', [ReportsController::class, 'hourlyDistribution']);
    Route::get('/reports/daily-distribution', [ReportsController::class, 'dailyDistribution']);
    Route::get('/reports/export', [ReportsController::class, 'export']);
});
