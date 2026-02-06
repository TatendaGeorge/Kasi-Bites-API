import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/client';
import { Product } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

interface SizeInput {
  size: string;
  price: string;
}

const AVAILABLE_SIZES = ['small', 'medium', 'large'];

export default function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [sizes, setSizes] = useState<SizeInput[]>([{ size: 'medium', price: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setImageUrl(product.image_url || '');
      setIsAvailable(product.is_available);
      setSizes(
        product.sizes.map((s) => ({
          size: s.size,
          price: s.price.toString(),
        }))
      );
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setIsAvailable(true);
      setSizes([{ size: 'medium', price: '' }]);
    }
    setError('');
  }, [product, isOpen]);

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      image_url?: string;
      is_available: boolean;
      sizes: Array<{ size: string; price: number }>;
    }) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      image_url?: string;
      is_available: boolean;
      sizes: Array<{ size: string; price: number }>;
    }) => productsApi.update(product!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to update product');
    },
  });

  const handleAddSize = () => {
    const usedSizes = sizes.map((s) => s.size);
    const availableSize = AVAILABLE_SIZES.find((s) => !usedSizes.includes(s));
    if (availableSize) {
      setSizes([...sizes, { size: availableSize, price: '' }]);
    }
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    }
  };

  const handleSizeChange = (index: number, field: 'size' | 'price', value: string) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const validSizes = sizes.filter((s) => s.size && s.price);
    if (validSizes.length === 0) {
      setError('At least one size with price is required');
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      is_available: isAvailable,
      sizes: validSizes.map((s) => ({
        size: s.size,
        price: parseFloat(s.price),
      })),
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Classic Chips"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Optional description"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Sizes & Prices */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes & Prices *
              </label>
              <div className="space-y-2">
                {sizes.map((sizeInput, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={sizeInput.size}
                      onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {AVAILABLE_SIZES.map((size) => (
                        <option
                          key={size}
                          value={size}
                          disabled={sizes.some((s, i) => i !== index && s.size === size)}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        R
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sizeInput.price}
                        onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {sizes.length < AVAILABLE_SIZES.length && (
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="mt-2 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Size
                </button>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="is_available"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="text-sm text-gray-700">
                Available for purchase (visible in mobile app)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
