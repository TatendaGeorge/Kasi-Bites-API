import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/client';
import { Order, OrderStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import StatusUpdateModal from '../components/StatusUpdateModal';
import { DeliveryMap } from '../components/DeliveryMap';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Clock,
  Package,
  CreditCard,
  MessageSquare,
  Truck,
  Store,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery<{ data: Order }>({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(Number(id)),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => ordersApi.updateStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setStatusModalOpen(false);
    },
  });

  const handleStatusConfirm = (newStatus: OrderStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load order. Please try again.
      </div>
    );
  }

  const orderData = order.data;
  const canUpdateStatus = orderData.status !== 'delivered' && orderData.status !== 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{orderData.order_number}
            </h1>
            <p className="text-gray-500">
              Placed on {format(new Date(orderData.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Order Type Badge */}
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            ${orderData.order_type === 'collection'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
            }
          `}>
            {orderData.order_type === 'collection' ? (
              <Store className="h-4 w-4" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            {orderData.order_type_label}
          </div>

          {/* Tappable Status Badge */}
          <button
            onClick={() => canUpdateStatus && setStatusModalOpen(true)}
            className={`
              p-2 -m-2 rounded-lg transition-all
              ${canUpdateStatus
                ? 'hover:bg-gray-100 active:scale-95 cursor-pointer'
                : 'cursor-default'
              }
            `}
            title={canUpdateStatus ? 'Tap to update status' : undefined}
          >
            <StatusBadge status={orderData.status} label={orderData.status_label} />
          </button>
        </div>
      </div>

      {/* Quick Status Update Bar - Tablet Friendly */}
      {canUpdateStatus && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-3">Quick Status Update</p>
          <div className="flex flex-wrap gap-2">
            {(['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'] as OrderStatus[]).map((status) => {
              const isCurrent = status === orderData.status;
              const statusLabels: Record<string, string> = {
                confirmed: 'Confirm',
                preparing: 'Preparing',
                ready: 'Ready',
                out_for_delivery: 'Out for Delivery',
                delivered: 'Delivered',
              };

              return (
                <button
                  key={status}
                  onClick={() => {
                    if (!isCurrent) {
                      setStatusModalOpen(true);
                    }
                  }}
                  disabled={isCurrent}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95
                    ${isCurrent
                      ? 'bg-orange-500 text-white cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {statusLabels[status]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orderData.items?.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.size} - Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R{item.total_price}</p>
                    <p className="text-sm text-gray-500">R{item.unit_price} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">R{orderData.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">
                  {orderData.order_type === 'collection' ? 'Collection' : 'Delivery Fee'}
                </span>
                <span className="text-gray-900">
                  {orderData.order_type === 'collection' ? 'Free' : `R${orderData.delivery_fee}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">R{orderData.total}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {orderData.status_history && orderData.status_history.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Status History</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {orderData.status_history.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        {index < orderData.status_history!.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <StatusBadge
                            status={history.status}
                            label={history.status_label}
                          />
                          <span className="text-sm text-gray-500">
                            {format(new Date(history.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{orderData.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <a
                  href={`tel:${orderData.customer_phone}`}
                  className="text-gray-900 hover:text-orange-600"
                >
                  {orderData.customer_phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900">{orderData.delivery_address}</span>
              </div>
              {orderData.payment_method && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 capitalize">{orderData.payment_method}</span>
                </div>
              )}
              {orderData.estimated_delivery_at && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">
                    Est. {format(new Date(orderData.estimated_delivery_at), 'h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location Map */}
          {orderData.delivery_latitude && orderData.delivery_longitude && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {orderData.order_type === 'collection' ? 'Customer Location' : 'Delivery Route'}
                </h2>
              </div>
              <div className="p-6">
                <DeliveryMap
                  latitude={orderData.delivery_latitude}
                  longitude={orderData.delivery_longitude}
                  height="280px"
                  label={orderData.order_type === 'collection' ? 'Customer' : 'Delivery'}
                  showRoute={orderData.order_type !== 'collection'}
                  storeLabel="Kasi Bites"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {orderData.notes && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">{orderData.notes}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={orderData.status}
        orderNumber={orderData.order_number}
        onConfirm={handleStatusConfirm}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
