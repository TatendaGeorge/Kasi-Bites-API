import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../api/client';
import { Order, PaginatedResponse, OrderStatus } from '../types';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatusUpdateModal from '../components/StatusUpdateModal';
import Pagination from '../components/Pagination';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Initialize from URL params
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(() => searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);

  // Update URL when status changes
  useEffect(() => {
    if (status && status !== 'all') {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  }, [status, setSearchParams]);

  // Status update modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', { search, status, page }],
    queryFn: () =>
      ordersApi.getAll({
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        page,
        per_page: 15,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setStatusModalOpen(false);
      setSelectedOrder(null);
    },
  });

  const handleStatusTap = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status === 'delivered' || order.status === 'cancelled') return;
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = (newStatus: OrderStatus) => {
    if (selectedOrder) {
      updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus });
    }
  };

  const columns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">#{order.order_number}</p>
          <p className="text-gray-500 text-xs">
            {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customer_name}</p>
          <p className="text-gray-500 text-xs">{order.customer_phone}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-medium text-gray-900">R{order.total}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        <button
          onClick={(e) => handleStatusTap(order, e)}
          className={`
            inline-block transition-transform
            ${order.status !== 'delivered' && order.status !== 'cancelled'
              ? 'hover:scale-105 active:scale-95 cursor-pointer'
              : 'cursor-default'
            }
          `}
          title={order.status !== 'delivered' && order.status !== 'cancelled' ? 'Tap to update status' : undefined}
        >
          <StatusBadge status={order.status} label={order.status_label} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Tap on a status badge to quickly update it</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(order) => order.id}
        onRowClick={(order) => navigate(`/admin/orders/${order.id}`)}
        isLoading={isLoading}
        emptyMessage="No orders found"
      />

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          from={data.from}
          to={data.to}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <StatusUpdateModal
          isOpen={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false);
            setSelectedOrder(null);
          }}
          currentStatus={selectedOrder.status}
          orderNumber={selectedOrder.order_number}
          onConfirm={handleStatusConfirm}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}
