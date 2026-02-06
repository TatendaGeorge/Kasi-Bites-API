import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/client';
import { User } from '../types';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldOff,
  Edit,
  ShoppingBag,
} from 'lucide-react';
import { format } from 'date-fns';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    is_admin: false,
  });

  const { data: user, isLoading, error } = useQuery<{ data: User }>({
    queryKey: ['user', id],
    queryFn: () => usersApi.getOne(Number(id)),
    enabled: !!id,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<User>) => usersApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditModalOpen(false);
    },
  });

  const openEditModal = () => {
    if (user) {
      setEditForm({
        name: user.data.name,
        email: user.data.email,
        phone: user.data.phone || '',
        is_admin: user.data.is_admin,
      });
      setEditModalOpen(true);
    }
  };

  const handleUpdate = () => {
    updateUserMutation.mutate({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone || undefined,
      is_admin: editForm.is_admin,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Failed to load user. Please try again.
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">
                {userData.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                {userData.is_admin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={openEditModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">User Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{userData.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="text-gray-900">
                  {format(new Date(userData.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {userData.is_admin ? (
                <Shield className="h-5 w-5 text-orange-500" />
              ) : (
                <ShieldOff className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-gray-900">{userData.is_admin ? 'Administrator' : 'User'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Statistics</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {userData.orders_count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          {userData.recent_orders && userData.recent_orders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {userData.recent_orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">R{order.total}</p>
                      <StatusBadge status={order.status} label={order.status_label} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">No orders yet</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User"
        footer={
          <>
            <button
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={updateUserMutation.isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_admin"
              checked={editForm.is_admin}
              onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
              Administrator privileges
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
