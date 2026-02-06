import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import echo from '../lib/echo';
import { OrderNotification } from '../components/NewOrderAlert';

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time notifications...');

    // Subscribe to admin notifications channel
    const channel = echo.channel('admin-notifications');

    channel.subscribed(() => {
      setIsConnected(true);
      console.log('✅ Connected to admin-notifications channel');
    });

    channel.error((error: unknown) => {
      console.error('❌ Channel error:', error);
    });

    // Listen for new orders - note the dot prefix for custom event names
    channel.listen('.new-order', (data: OrderNotification) => {
      console.log('🔔 New order received:', data);

      // Add to notifications queue
      setNotifications((prev) => [data, ...prev]);

      // Invalidate dashboard and orders queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      console.log('Leaving admin-notifications channel');
      echo.leave('admin-notifications');
      setIsConnected(false);
    };
  }, [queryClient]);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    dismissNotification,
    clearAllNotifications,
  };
}
