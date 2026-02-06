<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Enums\OrderStatus;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();

        $todaysOrders = Order::whereDate('created_at', $today)->count();
        $todaysRevenue = Order::whereDate('created_at', $today)
            ->whereNot('status', OrderStatus::CANCELLED)
            ->sum('total');
        $pendingOrders = Order::where('status', OrderStatus::PENDING)->count();
        $totalUsers = User::count();
        $totalOrders = Order::count();

        $recentOrders = Order::with(['user', 'items'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'total' => $order->total,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'items_count' => $order->items->count(),
                'created_at' => $order->created_at->toIso8601String(),
            ]);

        return response()->json([
            'stats' => [
                'todays_orders' => $todaysOrders,
                'todays_revenue' => number_format($todaysRevenue, 2),
                'pending_orders' => $pendingOrders,
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
