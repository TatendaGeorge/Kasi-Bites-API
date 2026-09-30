import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { platformStoresApi } from '../api/client';
import { Store } from '../types';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { Search, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function PlatformStores() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Store>>({
    queryKey: ['platform-stores', { search, statusFilter, page }],
    queryFn: () =>
      platformStoresApi.getAll({
        search: search || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        per_page: 15,
      }),
  });

  const columns = [
    {
      key: 'name',
      header: 'Store',
      render: (store: Store) => (
        <div>
          <p className="font-medium text-gray-900">{store.name}</p>
          <p className="text-sm text-gray-500">{store.owner?.name}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'Owner contact',
      render: (store: Store) => (
        <div className="text-sm">
          <p className="text-gray-900">{store.owner?.email}</p>
          <p className="text-gray-500">{store.owner?.phone || '-'}</p>
        </div>
      ),
    },
    {
      key: 'products_count',
      header: 'Products',
      render: (store: Store) => (
        <span className="text-gray-900 font-medium">{store.products_count ?? 0}</span>
      ),
    },
    {
      key: 'orders_count',
      header: 'Orders',
      render: (store: Store) => (
        <span className="text-gray-900 font-medium">{store.orders_count ?? 0}</span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (store: Store) =>
        store.is_active ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">Approved</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Pending</span>
          </div>
        ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (store: Store) => (
        <span className="text-gray-500">{format(new Date(store.created_at), 'MMM d, yyyy')}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <p className="text-gray-500 mt-1">Approve and oversee every store on Shisa</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by store name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All stores</option>
          <option value="pending">Pending approval</option>
          <option value="active">Approved</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(store) => store.id}
        onRowClick={(store) => navigate(`/admin/platform/stores/${store.slug}`)}
        isLoading={isLoading}
        emptyMessage="No stores found"
      />

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
