import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, ordersApi } from '../api/client';
import { DashboardData, OrderStatus } from '../types';
import StatsCard from '../components/StatsCard';
import OrderKanban from '../components/OrderKanban';
import { ShoppingBag, AlertCircle, LayoutGrid, List } from 'lucide-react';

interface KanbanOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: string;
  status: OrderStatus;
  status_label: string;
  items_count: number;
  created_at: string;
  delivery_address?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Dashboard stats
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
  });

  // Active orders for Kanban
  const { data: activeOrdersData, isLoading: isLoadingOrders } = useQuery<{ orders: KanbanOrder[] }>({
    queryKey: ['activeOrders'],
    queryFn: ordersApi.getActive,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const stats = data?.stats;
  const activeOrders = activeOrdersData?.orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Today's Orders"
          value={stats?.todays_orders || 0}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          subtitle="Total orders placed today"
        />
        <StatsCard
          title="Needs Attention"
          value={stats?.pending_orders || 0}
          icon={AlertCircle}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          subtitle="Pending orders awaiting confirmation"
          onClick={() => navigate('/admin/orders?status=pending')}
        />
      </div>

      {/* Order Kanban Board */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Orders</h2>
            <span className="text-sm text-gray-500">
              ({activeOrders.length} in progress)
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <List className="h-4 w-4" />
            View all orders
          </button>
        </div>

        <div className="p-4">
          {isLoadingOrders ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <OrderKanban
              orders={activeOrders}
              onStatusChange={handleStatusChange}
              isUpdating={updateStatusMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
