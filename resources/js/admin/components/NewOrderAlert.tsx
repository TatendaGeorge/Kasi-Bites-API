import { useEffect, useRef } from 'react';
import { ShoppingBag, Check, X, MapPin, Phone, User, Package, CreditCard, MessageSquare, Truck, Store } from 'lucide-react';
import { DeliveryMap } from './DeliveryMap';

export interface OrderItem {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface OrderNotification {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  subtotal?: string;
  delivery_fee?: string;
  total: string;
  items_count: number;
  items?: OrderItem[];
  status: string;
  status_label: string;
  order_type?: 'delivery' | 'collection';
  order_type_label?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
}

interface NewOrderAlertProps {
  order: OrderNotification;
  onAccept: () => void;
  onReject: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export default function NewOrderAlert({
  order,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: NewOrderAlertProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  const hasCoordinates = order.delivery_latitude && order.delivery_longitude;

  useEffect(() => {
    startAlertSound();

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    return () => {
      stopAlertSound();
    };
  }, []);

  const startAlertSound = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      playAlertTone();
      intervalRef.current = window.setInterval(playAlertTone, 3000);
    } catch {
      // Audio not supported
    }
  };

  const stopAlertSound = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playAlertTone = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const frequencies = [880, 1100, 880];
    const duration = 0.15;

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + i * (duration + 0.05);
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  };

  const handleAccept = () => {
    stopAlertSound();
    onAccept();
  };

  const handleReject = () => {
    stopAlertSound();
    onReject();
  };

  const isLoading = isAccepting || isRejecting;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto py-4">
      {/* Animated pulsing background */}
      <div className="fixed inset-0 bg-black/80" />

      {/* Pulsing ring effect */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border-4 border-orange-500/50 animate-ping" />
      </div>

      {/* Alert Card - Wider with two columns when map is available */}
      <div className={`relative bg-white rounded-3xl shadow-2xl mx-4 overflow-hidden ${hasCoordinates ? 'w-full max-w-5xl' : 'w-full max-w-lg'}`}>
        {/* Header */}
        <div className={`px-6 py-5 text-center relative overflow-hidden ${
          order.order_type === 'collection'
            ? 'bg-gradient-to-r from-purple-500 to-purple-600'
            : 'bg-gradient-to-r from-orange-500 to-orange-600'
        }`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-150" />
          </div>

          <div className="relative flex items-center justify-center gap-4">
            <div className={`inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg animate-bounce`}>
              {order.order_type === 'collection' ? (
                <Store className="h-7 w-7 text-purple-500" />
              ) : (
                <Truck className="h-7 w-7 text-orange-500" />
              )}
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">
                NEW {order.order_type === 'collection' ? 'COLLECTION' : 'DELIVERY'}!
              </h1>
              <p className={`text-lg font-medium ${order.order_type === 'collection' ? 'text-purple-100' : 'text-orange-100'}`}>
                #{order.order_number}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Two column layout when map available */}
        <div className={`${hasCoordinates ? 'flex' : ''}`}>
          {/* Left Column - Order Details */}
          <div className={`px-5 py-5 space-y-4 ${hasCoordinates ? 'w-1/2 border-r border-gray-100 max-h-[65vh] overflow-y-auto' : 'max-h-[60vh] overflow-y-auto'}`}>
            {/* Customer Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            {order.delivery_address && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                order.order_type === 'collection' ? 'bg-purple-50' : 'bg-blue-50'
              }`}>
                <MapPin className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  order.order_type === 'collection' ? 'text-purple-600' : 'text-blue-600'
                }`} />
                <div>
                  <p className={`text-xs font-medium mb-0.5 ${
                    order.order_type === 'collection' ? 'text-purple-500' : 'text-blue-500'
                  }`}>
                    {order.order_type === 'collection' ? 'Customer Address' : 'Delivery Address'}
                  </p>
                  <p className="text-gray-700 text-sm">{order.delivery_address}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Order Items</p>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-100 p-1.5 rounded">
                          <Package className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                          <p className="text-xs text-gray-500">{item.size} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">R{item.total_price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment & Notes */}
            <div className="flex flex-wrap gap-2">
              {order.payment_method && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg text-sm">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 capitalize">{order.payment_method}</span>
                </div>
              )}
              {order.notes && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg text-sm flex-1 min-w-0">
                  <MessageSquare className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-yellow-700 truncate">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="text-gray-600 text-sm">Order Total</p>
                <p className="text-3xl font-bold text-gray-900">R{order.total}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Items</p>
                <p className="text-3xl font-bold text-orange-500">{order.items_count}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-red-100 text-red-700 rounded-2xl font-semibold text-lg hover:bg-red-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-6 w-6" />
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-4 px-6 bg-green-500 text-white rounded-2xl font-semibold text-lg hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
              >
                <Check className="h-6 w-6" />
                {isAccepting ? 'Accepting...' : 'Accept'}
              </button>
            </div>
          </div>

          {/* Right Column - Map */}
          {hasCoordinates && (
            <div className="w-1/2 p-5 bg-gray-50 flex flex-col">
              <p className="text-xs font-medium text-gray-500 uppercase mb-3">
                {order.order_type === 'collection' ? 'Customer Location' : 'Delivery Route'}
              </p>
              <div className="flex-1">
                <DeliveryMap
                  latitude={order.delivery_latitude!}
                  longitude={order.delivery_longitude!}
                  height="480px"
                  label={order.order_type === 'collection' ? 'Customer' : 'Delivery'}
                  showLink={true}
                  showRoute={order.order_type !== 'collection'}
                  storeLabel="Kasi Bites"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
