<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Enums\OrderStatus;
use App\Traits\ResolvesCurrentStore;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ResolvesCurrentStore;

    public function index(Request $request): JsonResponse
    {
        $store = $this->currentStore($request);
        $today = Carbon::today();

        $todaysOrders = $store->orders()->whereDate('created_at', $today)->count();
        $todaysRevenue = $store->orders()->whereDate('created_at', $today)
            ->whereNot('status', OrderStatus::CANCELLED)
            ->sum('total');
        $pendingOrders = $store->orders()->where('status', OrderStatus::PENDING)->count();
        $totalCustomers = $store->orders()->whereNotNull('user_id')->distinct('user_id')->count('user_id');
        $totalOrders = $store->orders()->count();

        $recentOrders = $store->orders()->with(['user', 'items'])
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
                'total_users' => $totalCustomers,
                'total_orders' => $totalOrders,
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
