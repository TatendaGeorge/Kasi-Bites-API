import { useState } from 'react';
import { OrderStatus } from '../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: OrderStatus;
  orderNumber: string;
  onConfirm: (status: OrderStatus) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: {
  value: OrderStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { value: 'preparing', label: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  { value: 'ready', label: 'Ready', color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-300' },
  { value: 'delivered', label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
];

export default function StatusUpdateModal({
  isOpen,
  onClose,
  currentStatus,
  orderNumber,
  onConfirm,
  isLoading = false,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleStatusTap = (status: OrderStatus) => {
    if (status === currentStatus) return;
    setSelectedStatus(status);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedStatus(null);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  const selectedConfig = STATUS_CONFIG.find((s) => s.value === selectedStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {step === 'select' ? 'Update Status' : 'Confirm Update'}
              </h3>
              <p className="text-sm text-gray-500">Order #{orderNumber}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'select' ? (
              <div className="grid grid-cols-2 gap-3">
                {STATUS_CONFIG.map((status) => {
                  const isCurrent = status.value === currentStatus;
                  const isDisabled = currentStatus === 'delivered' || currentStatus === 'cancelled';

                  return (
                    <button
                      key={status.value}
                      onClick={() => handleStatusTap(status.value)}
                      disabled={isCurrent || isDisabled}
                      className={`
                        relative p-4 rounded-xl border-2 text-left transition-all
                        ${isCurrent
                          ? `${status.bgColor} ${status.borderColor} ${status.color}`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                        ${(isCurrent || isDisabled) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                      `}
                    >
                      <span className={`font-medium ${isCurrent ? status.color : 'text-gray-900'}`}>
                        {status.label}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-2 right-2">
                          <Check className={`h-4 w-4 ${status.color}`} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${selectedConfig?.bgColor} mb-4`}>
                  <AlertCircle className={`h-8 w-8 ${selectedConfig?.color}`} />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Change status to "{selectedConfig?.label}"?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This will update order #{orderNumber} and notify the customer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-3 rounded-xl text-white font-medium active:scale-95 transition-all disabled:opacity-50 ${
                      selectedStatus === 'cancelled'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? 'Updating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
