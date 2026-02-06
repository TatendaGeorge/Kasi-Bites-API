import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '../api/client';
import { Product, Category } from '../types';
import Pagination from '../components/Pagination';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Package, Star, Filter } from 'lucide-react';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | ''>('');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', { search, page, categoryFilter, availabilityFilter, featuredFilter }],
    queryFn: () =>
      productsApi.getAll({
        search: search || undefined,
        category_id: categoryFilter || undefined,
        is_available: availabilityFilter !== '' ? availabilityFilter : undefined,
        is_featured: featuredFilter !== '' ? featuredFilter : undefined,
        page,
        per_page: 15,
      }),
  });

  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (id: number) => productsApi.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: number) => productsApi.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteConfirm(null);
    },
  });

  const handleToggleAvailability = (product: Product) => {
    toggleAvailabilityMutation.mutate(product.id);
  };

  const handleToggleFeatured = (product: Product) => {
    toggleFeaturedMutation.mutate(product.id);
  };

  const handleDeleteProduct = (id: number) => {
    deleteProductMutation.mutate(id);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setAvailabilityFilter('');
    setFeaturedFilter('');
    setPage(1);
  };

  const hasActiveFilters = categoryFilter !== '' || availabilityFilter !== '' || featuredFilter !== '';
  const categories = categoriesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your menu items and availability</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {[categoryFilter, availabilityFilter, featuredFilter].filter(f => f !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value ? Number(e.target.value) : '');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={availabilityFilter === '' ? '' : availabilityFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAvailabilityFilter(val === '' ? '' : val === 'true');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <select
                  value={featuredFilter === '' ? '' : featuredFilter.toString()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFeaturedFilter(val === '' ? '' : val === 'true');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {data?.data.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                !product.is_available ? 'opacity-60' : ''
              }`}
            >
              {/* Product Image */}
              <div className="h-40 bg-gray-100 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-300" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {product.is_featured && (
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </div>
                  )}
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Category Badge */}
                {product.category && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white rounded text-xs">
                    {product.category.name}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Sizes & Prices */}
                {/* <div className="flex flex-wrap gap-2 mb-3">
                  {product.sale_price ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      Sale: R{product.sale_price.toFixed(2)}
                    </span>
                  ) : (
                    product.sizes?.map((size) => (
                      <span
                        key={size.id}
                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        {size.size}: R{size.price}
                      </span>
                    ))
                  )}
                </div> */}

                {/* Add-ons count */}
                {product.addons && product.addons.length > 0 && (
                  <p className="text-xs text-gray-400 mb-3">
                    {product.addons.length} add-on{product.addons.length !== 1 ? 's' : ''} available
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    disabled={toggleAvailabilityMutation.isPending}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      product.is_available
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {product.is_available ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    disabled={toggleFeaturedMutation.isPending}
                    className={`p-2 rounded-lg transition-colors ${
                      product.is_featured
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-600'
                    }`}
                    title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className={`h-4 w-4 ${product.is_featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === product.id && (
                <div className="p-4 bg-red-50 border-t border-red-100">
                  <p className="text-sm text-red-700 mb-3">
                    Delete "{product.name}"? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deleteProductMutation.isPending}
                      className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          lastPage={data.meta.last_page}
          from={(data.meta.current_page - 1) * data.meta.per_page + 1}
          to={Math.min(data.meta.current_page * data.meta.per_page, data.meta.total)}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
