import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { storesApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Store as StoreIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  delivery_fee: string;
  delivery_radius_km: string;
  minimum_order_amount: string;
}

const initialForm: FormData = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  delivery_fee: '30',
  delivery_radius_km: '5',
  minimum_order_amount: '0',
};

export default function StoreOnboarding() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      storesApi.create({
        name: form.name,
        description: form.description || undefined,
        address: form.address || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        delivery_fee: form.delivery_fee ? Number(form.delivery_fee) : undefined,
        delivery_radius_km: form.delivery_radius_km ? Number(form.delivery_radius_km) : undefined,
        minimum_order_amount: form.minimum_order_amount ? Number(form.minimum_order_amount) : undefined,
      }),
    onSuccess: async () => {
      await refreshUser();
      setCreated(true);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not create your store. Please try again.';
      setError(message);
    },
  });

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate();
  };

  if (created) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Store created</h1>
          <p className="text-gray-500 mb-6">
            Your store has been created and is pending approval. You can start setting up your
            menu now — customers will see your store once it's approved.
          </p>
          <button
            onClick={() => navigate('/admin', { replace: true })}
            className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-900 p-3 rounded-lg">
              <StoreIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Set up your store
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Tell us about your store. You can change all of this later in Settings.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="e.g., Jane's Kitchen"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={2}
                placeholder="What do you sell?"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Road, Soweto"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="012 345 6789"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="hello@store.co.za"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery fee (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.delivery_fee}
                  onChange={(e) => handleChange('delivery_fee', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.delivery_radius_km}
                  onChange={(e) => handleChange('delivery_radius_km', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. order (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minimum_order_amount}
                  onChange={(e) => handleChange('minimum_order_amount', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? 'Creating store...' : 'Create store'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
