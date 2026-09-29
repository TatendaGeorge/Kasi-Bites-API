import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformStoresApi } from '../api/client';
import { Store } from '../types';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformStoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ data: Store }>({
    queryKey: ['platform-store', slug],
    queryFn: () => platformStoresApi.getOne(slug!),
    enabled: !!slug,
  });

  const approveMutation = useMutation({
    mutationFn: () => platformStoresApi.approve(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-store', slug] });
      queryClient.invalidateQueries({ queryKey: ['platform-stores'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => platformStoresApi.suspend(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-store', slug] });
      queryClient.invalidateQueries({ queryKey: ['platform-stores'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load store. Please try again.
      </div>
    );
  }

  const store = data.data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/platform/stores')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to stores
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-500">/{store.slug}</p>
            {store.description && <p className="text-gray-600 mt-2">{store.description}</p>}
          </div>

          <div className="flex items-center gap-3">
            {store.is_active ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium text-sm">Approved</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="font-medium text-sm">Pending</span>
              </div>
            )}

            {store.is_active ? (
              <button
                onClick={() => suspendMutation.mutate()}
                disabled={suspendMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Suspend'}
              </button>
            ) : (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="h-5 w-5 text-gray-400" />
            {store.email || '-'}
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Phone className="h-5 w-5 text-gray-400" />
            {store.phone || '-'}
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="h-5 w-5 text-gray-400" />
            {store.address || '-'}
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="h-5 w-5 text-gray-400" />
            Created {format(new Date(store.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 text-gray-500 mb-1">
            <Package className="h-5 w-5" />
            Products
          </div>
          <p className="text-2xl font-bold text-gray-900">{store.products_count ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 text-gray-500 mb-1">
            <ShoppingBag className="h-5 w-5" />
            Orders
          </div>
          <p className="text-2xl font-bold text-gray-900">{store.orders_count ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500 mb-1">Delivery fee / radius</p>
          <p className="text-2xl font-bold text-gray-900">
            R{Number(store.delivery_fee).toFixed(2)} / {Number(store.delivery_radius_km)}km
          </p>
        </div>
      </div>

      {store.owner && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Owner</h2>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {store.owner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{store.owner.name}</p>
              <p className="text-sm text-gray-500">{store.owner.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
