import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import Header from './Header';
import NewOrderAlert, { OrderNotification } from './NewOrderAlert';
import { useRealTimeNotifications } from '../hooks/useRealTimeNotifications';
import { ordersApi } from '../api/client';

export default function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifications, dismissNotification, isConnected } = useRealTimeNotifications();

  // Get the first pending notification (queue system)
  const currentAlert = notifications[0];

  const acceptOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.updateStatus(orderId, 'confirmed'),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      dismissNotification(orderId);
    },
    onError: (_, orderId) => {
      // Still dismiss on error to prevent stuck state
      dismissNotification(orderId);
    },
  });

  const rejectOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.updateStatus(orderId, 'cancelled'),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      dismissNotification(orderId);
    },
    onError: (_, orderId) => {
      dismissNotification(orderId);
    },
  });

  const handleAcceptOrder = (notification: OrderNotification) => {
    acceptOrderMutation.mutate(notification.id);
  };

  const handleRejectOrder = (notification: OrderNotification) => {
    rejectOrderMutation.mutate(notification.id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Header isConnected={isConnected} pendingCount={notifications.length} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Full-screen New Order Alert */}
      {currentAlert && (
        <NewOrderAlert
          order={currentAlert}
          onAccept={() => handleAcceptOrder(currentAlert)}
          onReject={() => handleRejectOrder(currentAlert)}
          isAccepting={acceptOrderMutation.isPending}
          isRejecting={rejectOrderMutation.isPending}
        />
      )}
    </div>
  );
}
