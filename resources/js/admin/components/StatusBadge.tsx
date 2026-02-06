import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  label?: string;
}

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ready: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  out_for_delivery: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {displayLabel}
    </span>
  );
}
