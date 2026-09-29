<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DeviceTokenController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WebPushController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\ReportsController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\AddonController;
use App\Http\Controllers\Api\Admin\PlatformStoreController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Store discovery (public)
Route::get('/stores', [StoreController::class, 'index']);
Route::get('/stores/{store:slug}', [StoreController::class, 'show']);
Route::get('/stores/{store:slug}/products', [ProductController::class, 'index']);
Route::get('/stores/{store:slug}/products/{product}', [ProductController::class, 'show']);

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
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Store owner onboarding — creates the caller's one store
    Route::post('/stores', [StoreController::class, 'store']);
});

// Owner-facing admin API routes — implicitly scoped to $request->user()->store
Route::middleware(['auth:sanctum', 'store.owner'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/active', [AdminOrderController::class, 'active']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{order}', [AdminOrderController::class, 'update']);
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

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

    // My store profile
    Route::get('/store', [StoreController::class, 'showMine']);
    Route::patch('/store', [StoreController::class, 'updateMine']);

    // Reports & Financials
    Route::get('/reports/overview', [ReportsController::class, 'overview']);
    Route::get('/reports/revenue-chart', [ReportsController::class, 'revenueChart']);
    Route::get('/reports/top-products', [ReportsController::class, 'topProducts']);
    Route::get('/reports/hourly-distribution', [ReportsController::class, 'hourlyDistribution']);
    Route::get('/reports/daily-distribution', [ReportsController::class, 'dailyDistribution']);
    Route::get('/reports/export', [ReportsController::class, 'export']);
});

// Platform-superadmin oversight routes — cross-store, gated on is_admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/platform')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::patch('/users/{user}', [AdminUserController::class, 'update']);

    Route::get('/stores', [PlatformStoreController::class, 'index']);
    Route::get('/stores/{store}', [PlatformStoreController::class, 'show']);
    Route::patch('/stores/{store}/approve', [PlatformStoreController::class, 'approve']);
    Route::patch('/stores/{store}/suspend', [PlatformStoreController::class, 'suspend']);
});
