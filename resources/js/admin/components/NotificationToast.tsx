import { useEffect, useState } from 'react';
import { X, ShoppingBag, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface OrderNotification {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: string;
  items_count: number;
  status: string;
  status_label: string;
  created_at: string;
}

interface NotificationToastProps {
  notification: OrderNotification;
  onDismiss: () => void;
  onAccept: () => void;
  onView: () => void;
}

export function NotificationToast({ notification, onDismiss, onAccept, onView }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Play notification sound
    playNotificationSound();

    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[100] w-full max-w-sm
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="font-semibold">New Order!</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">
                Order #{notification.order_number}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {notification.customer_name}
              </p>
              <p className="text-sm text-gray-500">
                {notification.items_count} item{notification.items_count !== 1 ? 's' : ''} • R{notification.total}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                onAccept();
                handleDismiss();
              }}
              className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-green-700 active:scale-95 transition-all"
            >
              Accept
            </button>
            <button
              onClick={() => {
                onView();
                handleDismiss();
              }}
              className="flex-1 bg-gray-900 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-gray-800 active:scale-95 transition-all"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification container that manages multiple notifications
interface NotificationContainerProps {
  notifications: OrderNotification[];
  onDismiss: (id: number) => void;
  onAccept: (notification: OrderNotification) => void;
  onView: (notification: OrderNotification) => void;
}

export function NotificationContainer({
  notifications,
  onDismiss,
  onAccept,
  onView,
}: NotificationContainerProps) {
  // Only show the most recent notification
  const latestNotification = notifications[0];

  if (!latestNotification) return null;

  return (
    <NotificationToast
      key={latestNotification.id}
      notification={latestNotification}
      onDismiss={() => onDismiss(latestNotification.id)}
      onAccept={() => onAccept(latestNotification)}
      onView={() => onView(latestNotification)}
    />
  );
}

// Simple notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();

      osc2.connect(gain2);
      gain2.connect(audioContext.destination);

      osc2.frequency.value = 1000;
      osc2.type = 'sine';

      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.3);
    }, 150);
  } catch {
    // Audio not supported or blocked
  }
}
