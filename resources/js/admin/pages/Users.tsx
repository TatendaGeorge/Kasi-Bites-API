import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../api/client';
import { User, PaginatedResponse } from '../types';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import { Search, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';

export default function Users() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { search, page }],
    queryFn: () =>
      usersApi.getAll({
        search: search || undefined,
        page,
        per_page: 15,
      }),
  });

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user: User) => (
        <span className="text-gray-600">{user.phone || '-'}</span>
      ),
    },
    {
      key: 'orders_count',
      header: 'Orders',
      render: (user: User) => (
        <span className="text-gray-900 font-medium">{user.orders_count || 0}</span>
      ),
    },
    {
      key: 'is_admin',
      header: 'Role',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {user.is_admin ? (
            <>
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-orange-600 font-medium">Admin</span>
            </>
          ) : (
            <>
              <ShieldOff className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">User</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: User) => (
        <span className="text-gray-500">
          {format(new Date(user.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage your user accounts</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        keyExtractor={(user) => user.id}
        onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          from={data.from}
          to={data.to}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
