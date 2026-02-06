<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    /**
     * Get financial overview with revenue metrics
     */
    public function overview(Request $request): JsonResponse
    {
        $period = $request->input('period', 'today'); // today, week, month, year, custom
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        // Revenue metrics (excluding cancelled orders)
        $revenueQuery = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED);

        $totalRevenue = (clone $revenueQuery)->sum('total');
        $totalOrders = (clone $revenueQuery)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;
        $totalDeliveryFees = (clone $revenueQuery)->sum('delivery_fee');
        $netRevenue = $totalRevenue - $totalDeliveryFees;

        // Order counts by status
        $ordersByStatus = Order::whereBetween('created_at', [$from, $to])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Payment method breakdown
        $paymentBreakdown = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total) as total'))
            ->groupBy('payment_method')
            ->get()
            ->keyBy('payment_method');

        // Compare with previous period
        $periodDiff = $from->diffInDays($to) + 1;
        $prevFrom = (clone $from)->subDays($periodDiff);
        $prevTo = (clone $to)->subDays($periodDiff);

        $prevRevenue = Order::whereBetween('created_at', [$prevFrom, $prevTo])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->sum('total');

        $revenueGrowth = $prevRevenue > 0
            ? (($totalRevenue - $prevRevenue) / $prevRevenue) * 100
            : ($totalRevenue > 0 ? 100 : 0);

        $prevOrders = Order::whereBetween('created_at', [$prevFrom, $prevTo])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->count();

        $ordersGrowth = $prevOrders > 0
            ? (($totalOrders - $prevOrders) / $prevOrders) * 100
            : ($totalOrders > 0 ? 100 : 0);

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'label' => $this->getPeriodLabel($period, $from, $to),
            ],
            'metrics' => [
                'total_revenue' => round($totalRevenue, 2),
                'net_revenue' => round($netRevenue, 2),
                'total_orders' => $totalOrders,
                'avg_order_value' => round($avgOrderValue, 2),
                'total_delivery_fees' => round($totalDeliveryFees, 2),
                'revenue_growth' => round($revenueGrowth, 1),
                'orders_growth' => round($ordersGrowth, 1),
            ],
            'orders_by_status' => $ordersByStatus,
            'payment_breakdown' => [
                'cash' => [
                    'count' => $paymentBreakdown['cash']->count ?? 0,
                    'total' => round($paymentBreakdown['cash']->total ?? 0, 2),
                ],
                'card' => [
                    'count' => $paymentBreakdown['card']->count ?? 0,
                    'total' => round($paymentBreakdown['card']->total ?? 0, 2),
                ],
            ],
        ]);
    }

    /**
     * Get revenue chart data (time series)
     */
    public function revenueChart(Request $request): JsonResponse
    {
        $period = $request->input('period', 'week');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $groupBy = $request->input('group_by', 'auto'); // hour, day, week, month, auto

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        // Auto-determine grouping based on date range
        if ($groupBy === 'auto') {
            $days = $from->diffInDays($to);
            if ($days <= 1) {
                $groupBy = 'hour';
            } elseif ($days <= 31) {
                $groupBy = 'day';
            } elseif ($days <= 90) {
                $groupBy = 'week';
            } else {
                $groupBy = 'month';
            }
        }

        $data = $this->getGroupedRevenue($from, $to, $groupBy);

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'group_by' => $groupBy,
            'data' => $data,
        ]);
    }

    /**
     * Get top selling products
     */
    public function topProducts(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $limit = min($request->input('limit', 10), 50);

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$from, $to])
            ->whereNot('orders.status', OrderStatus::CANCELLED)
            ->select(
                'order_items.product_name',
                'order_items.size',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('order_items.product_name', 'order_items.size')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'products' => $topProducts->map(fn($p) => [
                'product_name' => $p->product_name,
                'size' => $p->size,
                'total_quantity' => (int) $p->total_quantity,
                'total_revenue' => round($p->total_revenue, 2),
                'order_count' => (int) $p->order_count,
            ]),
        ]);
    }

    /**
     * Get hourly sales distribution (busiest hours)
     */
    public function hourlyDistribution(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        $hourlyData = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Fill in missing hours with zeros
        $hours = collect(range(0, 23))->map(function ($hour) use ($hourlyData) {
            $data = $hourlyData->firstWhere('hour', $hour);
            return [
                'hour' => $hour,
                'label' => sprintf('%02d:00', $hour),
                'orders' => (int) ($data->orders ?? 0),
                'revenue' => round($data->revenue ?? 0, 2),
            ];
        });

        // Find peak hours
        $peakHour = $hours->sortByDesc('orders')->first();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'hours' => $hours->values(),
            'peak_hour' => $peakHour,
        ]);
    }

    /**
     * Get daily distribution (busiest days of week)
     */
    public function dailyDistribution(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        $dailyData = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->select(
                DB::raw('DAYOFWEEK(created_at) as day_num'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('AVG(total) as avg_order')
            )
            ->groupBy('day_num')
            ->get()
            ->keyBy('day_num');

        $days = collect(range(1, 7))->map(function ($dayNum) use ($dailyData, $dayNames) {
            $data = $dailyData->get($dayNum);
            return [
                'day_num' => $dayNum,
                'day_name' => $dayNames[$dayNum - 1],
                'short_name' => substr($dayNames[$dayNum - 1], 0, 3),
                'orders' => (int) ($data->orders ?? 0),
                'revenue' => round($data->revenue ?? 0, 2),
                'avg_order' => round($data->avg_order ?? 0, 2),
            ];
        });

        $peakDay = $days->sortByDesc('orders')->first();

        return response()->json([
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'days' => $days->values(),
            'peak_day' => $peakDay,
        ]);
    }

    /**
     * Export report data as CSV
     */
    public function export(Request $request): JsonResponse
    {
        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $type = $request->input('type', 'orders'); // orders, products, summary

        [$from, $to] = $this->getDateRange($period, $startDate, $endDate);

        $data = match ($type) {
            'orders' => $this->getOrdersExportData($from, $to),
            'products' => $this->getProductsExportData($from, $to),
            'summary' => $this->getSummaryExportData($from, $to),
            default => [],
        };

        return response()->json([
            'type' => $type,
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'data' => $data,
        ]);
    }

    /**
     * Helper: Get date range based on period
     */
    private function getDateRange(string $period, ?string $startDate, ?string $endDate): array
    {
        if ($period === 'custom' && $startDate && $endDate) {
            return [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ];
        }

        $now = Carbon::now();

        return match ($period) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'yesterday' => [$now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()],
            'week' => [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()],
            'last_week' => [$now->copy()->subWeek()->startOfWeek(), $now->copy()->subWeek()->endOfWeek()],
            'month' => [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()],
            'last_month' => [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()],
            'quarter' => [$now->copy()->startOfQuarter(), $now->copy()->endOfQuarter()],
            'year' => [$now->copy()->startOfYear(), $now->copy()->endOfYear()],
            'last_year' => [$now->copy()->subYear()->startOfYear(), $now->copy()->subYear()->endOfYear()],
            'last_7_days' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            'last_30_days' => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            'last_90_days' => [$now->copy()->subDays(89)->startOfDay(), $now->copy()->endOfDay()],
            default => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
        };
    }

    /**
     * Helper: Get period label
     */
    private function getPeriodLabel(string $period, Carbon $from, Carbon $to): string
    {
        return match ($period) {
            'today' => 'Today',
            'yesterday' => 'Yesterday',
            'week' => 'This Week',
            'last_week' => 'Last Week',
            'month' => 'This Month',
            'last_month' => 'Last Month',
            'quarter' => 'This Quarter',
            'year' => 'This Year',
            'last_year' => 'Last Year',
            'last_7_days' => 'Last 7 Days',
            'last_30_days' => 'Last 30 Days',
            'last_90_days' => 'Last 90 Days',
            'custom' => $from->format('M d') . ' - ' . $to->format('M d, Y'),
            default => $from->format('M d') . ' - ' . $to->format('M d, Y'),
        };
    }

    /**
     * Helper: Get grouped revenue data for charts
     */
    private function getGroupedRevenue(Carbon $from, Carbon $to, string $groupBy): array
    {
        $format = match ($groupBy) {
            'hour' => '%Y-%m-%d %H:00',
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u', // ISO week
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $data = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total) as revenue')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->keyBy('period');

        // Generate all periods in range and fill gaps with zeros
        $result = [];
        $current = $from->copy();

        while ($current <= $to) {
            $key = match ($groupBy) {
                'hour' => $current->format('Y-m-d H:00'),
                'day' => $current->format('Y-m-d'),
                'week' => $current->format('Y-W'),
                'month' => $current->format('Y-m'),
                default => $current->format('Y-m-d'),
            };

            $label = match ($groupBy) {
                'hour' => $current->format('H:i'),
                'day' => $current->format('M d'),
                'week' => 'Week ' . $current->weekOfYear,
                'month' => $current->format('M Y'),
                default => $current->format('M d'),
            };

            $periodData = $data->get($key);

            $result[] = [
                'period' => $key,
                'label' => $label,
                'orders' => (int) ($periodData->orders ?? 0),
                'revenue' => round($periodData->revenue ?? 0, 2),
            ];

            $current = match ($groupBy) {
                'hour' => $current->addHour(),
                'day' => $current->addDay(),
                'week' => $current->addWeek(),
                'month' => $current->addMonth(),
                default => $current->addDay(),
            };
        }

        return $result;
    }

    /**
     * Helper: Get orders export data
     */
    private function getOrdersExportData(Carbon $from, Carbon $to): array
    {
        return Order::with('items')
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($order) => [
                'order_number' => $order->order_number,
                'date' => $order->created_at->format('Y-m-d H:i:s'),
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'items' => $order->items->map(fn($i) => "{$i->quantity}x {$i->product_name} ({$i->size})")->join(', '),
                'subtotal' => $order->subtotal,
                'delivery_fee' => $order->delivery_fee,
                'total' => $order->total,
                'payment_method' => $order->payment_method->value,
                'status' => $order->status->value,
            ])
            ->toArray();
    }

    /**
     * Helper: Get products export data
     */
    private function getProductsExportData(Carbon $from, Carbon $to): array
    {
        return OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$from, $to])
            ->whereNot('orders.status', OrderStatus::CANCELLED)
            ->select(
                'order_items.product_name',
                'order_items.size',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.total_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('order_items.product_name', 'order_items.size')
            ->orderByDesc('total_revenue')
            ->get()
            ->toArray();
    }

    /**
     * Helper: Get summary export data
     */
    private function getSummaryExportData(Carbon $from, Carbon $to): array
    {
        $revenueQuery = Order::whereBetween('created_at', [$from, $to])
            ->whereNot('status', OrderStatus::CANCELLED);

        return [
            'period' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'total_revenue' => round((clone $revenueQuery)->sum('total'), 2),
            'total_orders' => (clone $revenueQuery)->count(),
            'avg_order_value' => round((clone $revenueQuery)->avg('total') ?? 0, 2),
            'total_delivery_fees' => round((clone $revenueQuery)->sum('delivery_fee'), 2),
            'cancelled_orders' => Order::whereBetween('created_at', [$from, $to])
                ->where('status', OrderStatus::CANCELLED)
                ->count(),
        ];
    }
}
