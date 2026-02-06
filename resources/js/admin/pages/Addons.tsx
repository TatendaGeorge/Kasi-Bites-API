import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addonsApi } from '../api/client';
import { Addon } from '../types';
import { Search, Plus, Edit, Trash2, GripVertical, Utensils, Eye, EyeOff } from 'lucide-react';
import Modal from '../components/Modal';

interface AddonFormData {
  name: string;
  description: string;
  price: string;
  is_available: boolean;
}

export default function Addons() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState<AddonFormData>({
    name: '',
    description: '',
    price: '',
    is_available: true,
  });
  const [formError, setFormError] = useState('');

  const { data: addons, isLoading } = useQuery<{ data: Addon[] }>({
    queryKey: ['addons', { search }],
    queryFn: () => addonsApi.getAll({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; is_available: boolean }) =>
      addonsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to create add-on');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; description: string; price: number; is_available: boolean }> }) =>
      addonsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to update add-on');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
      setDeleteConfirm(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (order: number[]) => addonsApi.reorder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addons'] });
    },
  });

  const openAddModal = () => {
    setEditingAddon(null);
    setFormData({ name: '', description: '', price: '', is_available: true });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (addon: Addon) => {
    setEditingAddon(addon);
    setFormData({
      name: addon.name,
      description: addon.description || '',
      price: addon.price.toString(),
      is_available: addon.is_available,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAddon(null);
    setFormData({ name: '', description: '', price: '', is_available: true });
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Add-on name is required');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setFormError('Please enter a valid price');
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description || undefined,
      price,
      is_available: formData.is_available,
    };

    if (editingAddon) {
      updateMutation.mutate({ id: editingAddon.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleToggleAvailability = (addon: Addon) => {
    updateMutation.mutate({ id: addon.id, data: { is_available: !addon.is_available } });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0 || !addons?.data) return;
    const newOrder = addons.data.map(a => a.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderMutation.mutate(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (!addons?.data || index === addons.data.length - 1) return;
    const newOrder = addons.data.map(a => a.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMutation.mutate(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add-ons</h1>
          <p className="text-gray-500 mt-1">Manage sauces, toppings, and extras</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Add-on
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search add-ons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Addons List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : addons?.data.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No add-ons found</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Add your first add-on
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Products
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {addons?.data.map((addon, index) => (
                <tr key={addon.id} className={!addon.is_available ? 'bg-gray-50 opacity-60' : ''}>
                  <td className="px-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || reorderMutation.isPending}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === addons.data.length - 1 || reorderMutation.isPending}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{addon.name}</div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {addon.description || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-900">R{addon.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {addon.products_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleAvailability(addon)}
                      disabled={updateMutation.isPending}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        addon.is_available
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {addon.is_available ? (
                        <>
                          <Eye className="h-3 w-3" />
                          Available
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(addon)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(addon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Add-on</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this add-on? It will be removed from all products.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editingAddon ? 'Edit Add-on' : 'Add Add-on'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Cheese Sauce, Extra Bacon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (R) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">
              Available (visible to customers)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingAddon
                ? 'Update Add-on'
                : 'Create Add-on'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
