import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi, addonsApi } from '../api/client';
import { Category, Addon } from '../types';
import { ArrowLeft, Plus, Trash2, Package, Star, Tag } from 'lucide-react';

interface SizeInput {
  size: string;
  price: string;
}

const AVAILABLE_SIZES = ['small', 'medium', 'large'];

export default function ProductCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [sizes, setSizes] = useState<SizeInput[]>([{ size: 'medium', price: '' }]);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [error, setError] = useState('');

  // Fetch categories and addons
  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: addonsData } = useQuery<{ data: Addon[] }>({
    queryKey: ['addons'],
    queryFn: () => addonsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      image_url?: string;
      is_available: boolean;
      is_featured: boolean;
      sale_price?: number;
      category_id?: number;
      sizes: Array<{ size: string; price: number }>;
      addon_ids?: number[];
    }) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create product');
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

  const handleAddonToggle = (addonId: number) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
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
      is_featured: isFeatured,
      sale_price: salePrice ? parseFloat(salePrice) : undefined,
      category_id: categoryId || undefined,
      sizes: validSizes.map((s) => ({
        size: s.size,
        price: parseFloat(s.price),
      })),
      addon_ids: selectedAddons.length > 0 ? selectedAddons : undefined,
    };

    createMutation.mutate(data);
  };

  const categories = categoriesData?.data?.filter((c) => c.is_active) || [];
  const addons = addonsData?.data?.filter((a) => a.is_available) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-gray-500 mt-1">Create a new menu item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Classic Chips"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe your product..."
                />
              </div>

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
                {imageUrl && (
                  <div className="mt-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sizes & Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sizes & Pricing</h2>

            <div className="space-y-3">
              {sizes.map((sizeInput, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={sizeInput.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={sizeInput.price}
                      onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                  {sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {sizes.length < AVAILABLE_SIZES.length && (
              <button
                type="button"
                onClick={handleAddSize}
                className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Another Size
              </button>
            )}

            {/* Sale Price */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Sale Price (Optional)</label>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Set a fixed sale price that overrides size-based pricing
              </p>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Add-ons</h2>
              <p className="text-sm text-gray-500 mb-4">
                Select the add-ons that can be added to this product
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddons.includes(addon.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => handleAddonToggle(addon.id)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{addon.name}</div>
                      <div className="text-sm text-gray-500">R{addon.price.toFixed(2)}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">Available</div>
                  <div className="text-sm text-gray-500">Visible in mobile app</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900">Featured</div>
                    <div className="text-sm text-gray-500">Show in featured section</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Package className="h-12 w-12 text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <div className="font-medium text-gray-900">
                  {name || 'Product Name'}
                </div>
                {description && (
                  <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {description}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {sizes
                    .filter((s) => s.price)
                    .map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        {s.size}: R{s.price}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full mt-3 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
