import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/client';
import StatsCard from '../components/StatsCard';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Truck,
  CreditCard,
  Banknote,
  Clock,
  Calendar,
  BarChart3,
  Download,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';

type PeriodOption = {
  value: string;
  label: string;
};

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

interface OverviewData {
  period: { from: string; to: string; label: string };
  metrics: {
    total_revenue: number;
    net_revenue: number;
    total_orders: number;
    avg_order_value: number;
    total_delivery_fees: number;
    revenue_growth: number;
    orders_growth: number;
  };
  orders_by_status: Record<string, number>;
  payment_breakdown: {
    cash: { count: number; total: number };
    card: { count: number; total: number };
  };
}

interface RevenueChartData {
  period: { from: string; to: string };
  group_by: string;
  data: Array<{ period: string; label: string; orders: number; revenue: number }>;
}

interface TopProductsData {
  period: { from: string; to: string };
  products: Array<{
    product_name: string;
    size: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
  }>;
}

interface HourlyData {
  period: { from: string; to: string };
  hours: Array<{ hour: number; label: string; orders: number; revenue: number }>;
  peak_hour: { hour: number; label: string; orders: number; revenue: number };
}

interface DailyData {
  period: { from: string; to: string };
  days: Array<{
    day_num: number;
    day_name: string;
    short_name: string;
    orders: number;
    revenue: number;
    avg_order: number;
  }>;
  peak_day: { day_name: string; orders: number; revenue: number };
}

export default function Reports() {
  const [period, setPeriod] = useState('last_30_days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const queryParams = {
    period,
    ...(period === 'custom' && startDate && endDate
      ? { start_date: startDate, end_date: endDate }
      : {}),
  };

  // Fetch all report data
  const { data: overview, isLoading: overviewLoading } = useQuery<OverviewData>({
    queryKey: ['reports-overview', queryParams],
    queryFn: () => reportsApi.getOverview(queryParams),
  });

  const { data: revenueChart, isLoading: chartLoading } = useQuery<RevenueChartData>({
    queryKey: ['reports-revenue-chart', queryParams],
    queryFn: () => reportsApi.getRevenueChart(queryParams),
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery<TopProductsData>({
    queryKey: ['reports-top-products', queryParams],
    queryFn: () => reportsApi.getTopProducts({ ...queryParams, limit: 10 }),
  });

  const { data: hourlyData, isLoading: hourlyLoading } = useQuery<HourlyData>({
    queryKey: ['reports-hourly', queryParams],
    queryFn: () => reportsApi.getHourlyDistribution(queryParams),
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyData>({
    queryKey: ['reports-daily', queryParams],
    queryFn: () => reportsApi.getDailyDistribution(queryParams),
  });

  const handleExport = async (type: string) => {
    try {
      const data = await reportsApi.exportData({ ...queryParams, type });
      // Convert to CSV and download
      const csvContent = convertToCSV(data.data, type);
      downloadCSV(csvContent, `${type}-report-${period}.csv`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertToCSV = (data: any[], type: string): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const selectedPeriodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || period;

  // Calculate max revenue for chart scaling
  const maxRevenue = revenueChart?.data
    ? Math.max(...revenueChart.data.map(d => d.revenue), 1)
    : 1;

  const maxOrders = hourlyData?.hours
    ? Math.max(...hourlyData.hours.map(h => h.orders), 1)
    : 1;

  const maxDailyOrders = dailyData?.days
    ? Math.max(...dailyData.days.map(d => d.orders), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-500 mt-1">
            Track revenue, orders, and business performance
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-w-[180px] justify-between"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                {selectedPeriodLabel}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showPeriodDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowPeriodDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-80 overflow-y-auto">
                  {PERIOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPeriod(option.value);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        period === option.value ? 'bg-orange-50 text-orange-600' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => handleExport('orders')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg"
              >
                Orders CSV
              </button>
              <button
                onClick={() => handleExport('products')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Products CSV
              </button>
              <button
                onClick={() => handleExport('summary')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg"
              >
                Summary CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Range */}
      {period === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* Period Label */}
      {overview && (
        <div className="text-sm text-gray-500">
          Showing data for: <span className="font-medium">{overview.period.label}</span>
          {' '}({format(new Date(overview.period.from), 'MMM d, yyyy')} - {format(new Date(overview.period.to), 'MMM d, yyyy')})
        </div>
      )}

      {/* Main Stats Grid */}
      {overviewLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Revenue"
            value={`R${overview.metrics.total_revenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            trend={
              overview.metrics.revenue_growth !== 0 ? (
                <span className={`flex items-center text-sm ${overview.metrics.revenue_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.metrics.revenue_growth > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(overview.metrics.revenue_growth).toFixed(1)}%
                </span>
              ) : undefined
            }
          />
          <StatsCard
            title="Total Orders"
            value={overview.metrics.total_orders}
            icon={ShoppingBag}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            trend={
              overview.metrics.orders_growth !== 0 ? (
                <span className={`flex items-center text-sm ${overview.metrics.orders_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {overview.metrics.orders_growth > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(overview.metrics.orders_growth).toFixed(1)}%
                </span>
              ) : undefined
            }
          />
          <StatsCard
            title="Avg Order Value"
            value={`R${overview.metrics.avg_order_value.toFixed(2)}`}
            icon={BarChart3}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatsCard
            title="Delivery Fees"
            value={`R${overview.metrics.total_delivery_fees.toFixed(2)}`}
            icon={Truck}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>
      ) : null}

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
          {revenueChart && (
            <span className="text-sm text-gray-500">
              Grouped by {revenueChart.group_by}
            </span>
          )}
        </div>

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : revenueChart && revenueChart.data.length > 0 ? (
          <div className="h-64 relative">
            {/* Simple bar chart */}
            <div className="absolute inset-0 flex items-end gap-1 pb-8">
              {revenueChart.data.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-orange-500 rounded-t hover:bg-orange-600 transition-colors cursor-pointer"
                      style={{
                        height: `${Math.max((item.revenue / maxRevenue) * 200, 4)}px`,
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      R{item.revenue.toFixed(2)} • {item.orders} orders
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available for this period
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
          {overviewLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ) : overview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">{overview.payment_breakdown.cash.count} orders</p>
                  </div>
                </div>
                <p className="text-lg font-semibold">
                  R{overview.payment_breakdown.cash.total.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Card Payment</p>
                    <p className="text-sm text-gray-500">{overview.payment_breakdown.card.count} orders</p>
                  </div>
                </div>
                <p className="text-lg font-semibold">
                  R{overview.payment_breakdown.card.total.toFixed(2)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
          {overviewLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : overview ? (
            <div className="space-y-3">
              {Object.entries(overview.orders_by_status).map(([status, count]) => {
                const totalOrders = Object.values(overview.orders_by_status).reduce((a, b) => a + b, 0);
                const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-blue-500',
                  preparing: 'bg-purple-500',
                  ready: 'bg-indigo-500',
                  out_for_delivery: 'bg-cyan-500',
                  delivered: 'bg-green-500',
                  cancelled: 'bg-red-500',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusColors[status] || 'bg-gray-500'} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Hourly & Daily Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Busiest Hours</h2>
            {hourlyData?.peak_hour && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Peak: {hourlyData.peak_hour.label}
              </span>
            )}
          </div>

          {hourlyLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : hourlyData ? (
            <div className="h-40 flex items-end gap-0.5">
              {hourlyData.hours.map((hour) => (
                <div
                  key={hour.hour}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div
                    className={`w-full rounded-t transition-colors cursor-pointer ${
                      hour.hour === hourlyData.peak_hour?.hour
                        ? 'bg-orange-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    style={{
                      height: `${Math.max((hour.orders / maxOrders) * 120, 2)}px`,
                    }}
                    title={`${hour.label}: ${hour.orders} orders`}
                  />
                  {hour.hour % 4 === 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {hour.hour.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Daily Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Busiest Days</h2>
            {dailyData?.peak_day && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Peak: {dailyData.peak_day.day_name}
              </span>
            )}
          </div>

          {dailyLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : dailyData ? (
            <div className="h-40 flex items-end gap-2">
              {dailyData.days.map((day) => (
                <div
                  key={day.day_num}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative w-full">
                    <div
                      className={`w-full rounded-t transition-colors cursor-pointer ${
                        day.day_name === dailyData.peak_day?.day_name
                          ? 'bg-orange-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      style={{
                        height: `${Math.max((day.orders / maxDailyOrders) * 100, 4)}px`,
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {day.orders} orders • R{day.revenue.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 font-medium">
                    {day.short_name}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>

        {productsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : topProducts && topProducts.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium text-right">Qty Sold</th>
                  <th className="pb-3 font-medium text-right">Orders</th>
                  <th className="pb-3 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.products.map((product, index) => (
                  <tr key={`${product.product_name}-${product.size}`} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{product.product_name}</p>
                      <p className="text-sm text-gray-500 capitalize">{product.size}</p>
                    </td>
                    <td className="py-3 text-right text-gray-900">{product.total_quantity}</td>
                    <td className="py-3 text-right text-gray-500">{product.order_count}</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      R{product.total_revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No product data available for this period
          </div>
        )}
      </div>
    </div>
  );
}
