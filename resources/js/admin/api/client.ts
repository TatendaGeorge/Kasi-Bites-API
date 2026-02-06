import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
  getUser: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },
};

// Admin Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
};

// Admin Orders API
export const ordersApi = {
  getAll: async (params?: {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },
  getActive: async () => {
    // Get all orders that are not delivered or cancelled (for Kanban board)
    const response = await apiClient.get('/admin/orders/active');
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<{
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    notes: string;
  }>) => {
    const response = await apiClient.patch(`/admin/orders/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, status: string, notes?: string) => {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status, notes });
    return response.data;
  },
};

// Admin Users API
export const usersApi = {
  getAll: async (params?: {
    search?: string;
    is_admin?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  update: async (id: number, data: Partial<{
    name: string;
    email: string;
    phone: string;
    is_admin: boolean;
  }>) => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },
};

// Admin Products API
export const productsApi = {
  getAll: async (params?: {
    search?: string;
    is_available?: boolean;
    is_featured?: boolean;
    category_id?: number;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    image_url?: string;
    is_available?: boolean;
    is_featured?: boolean;
    sale_price?: number;
    category_id?: number;
    sizes: Array<{ size: string; price: number }>;
    addon_ids?: number[];
  }) => {
    const response = await apiClient.post('/admin/products', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    image_url: string;
    is_available: boolean;
    is_featured: boolean;
    sale_price: number | null;
    category_id: number | null;
    sizes: Array<{ size: string; price: number }>;
    addon_ids: number[];
  }>) => {
    const response = await apiClient.patch(`/admin/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },
  toggleAvailability: async (id: number) => {
    const response = await apiClient.patch(`/admin/products/${id}/toggle-availability`);
    return response.data;
  },
  toggleFeatured: async (id: number) => {
    const response = await apiClient.patch(`/admin/products/${id}/toggle-featured`);
    return response.data;
  },
};

// Admin Categories API
export const categoriesApi = {
  getAll: async (params?: {
    search?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/admin/categories', { params });
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await apiClient.get(`/admin/categories/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.post('/admin/categories', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    is_active: boolean;
  }>) => {
    const response = await apiClient.patch(`/admin/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },
  reorder: async (order: number[]) => {
    const response = await apiClient.post('/admin/categories/reorder', { order });
    return response.data;
  },
};

// Admin Addons API
export const addonsApi = {
  getAll: async (params?: {
    search?: string;
    is_available?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/admin/addons', { params });
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await apiClient.get(`/admin/addons/${id}`);
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    price: number;
    is_available?: boolean;
  }) => {
    const response = await apiClient.post('/admin/addons', data);
    return response.data;
  },
  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    price: number;
    is_available: boolean;
  }>) => {
    const response = await apiClient.patch(`/admin/addons/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await apiClient.delete(`/admin/addons/${id}`);
    return response.data;
  },
  reorder: async (order: number[]) => {
    const response = await apiClient.post('/admin/addons/reorder', { order });
    return response.data;
  },
};

// Admin Store Settings API
export const settingsApi = {
  getAll: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },
  getOne: async (key: string) => {
    const response = await apiClient.get(`/admin/settings/${key}`);
    return response.data;
  },
  update: async (settings: Record<string, string | number | boolean | null>) => {
    const response = await apiClient.patch('/admin/settings', { settings });
    return response.data;
  },
};

// Admin Reports API
export const reportsApi = {
  getOverview: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await apiClient.get('/admin/reports/overview', { params });
    return response.data;
  },
  getRevenueChart: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
    group_by?: string;
  }) => {
    const response = await apiClient.get('/admin/reports/revenue-chart', { params });
    return response.data;
  },
  getTopProducts: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get('/admin/reports/top-products', { params });
    return response.data;
  },
  getHourlyDistribution: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await apiClient.get('/admin/reports/hourly-distribution', { params });
    return response.data;
  },
  getDailyDistribution: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await apiClient.get('/admin/reports/daily-distribution', { params });
    return response.data;
  },
  exportData: async (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
    type?: string;
  }) => {
    const response = await apiClient.get('/admin/reports/export', { params });
    return response.data;
  },
};
