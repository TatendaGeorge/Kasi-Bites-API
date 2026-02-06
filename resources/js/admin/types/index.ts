export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_admin: boolean;
  orders_count?: number;
  created_at: string;
  updated_at: string;
  recent_orders?: OrderSummary[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  status_label: string;
  notes: string | null;
  created_at: string;
}

export type OrderType = 'delivery' | 'collection';

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  subtotal: string;
  delivery_fee: string;
  total: string;
  status: OrderStatus;
  status_label: string;
  order_type: OrderType;
  order_type_label: string;
  payment_method: string | null;
  notes: string | null;
  estimated_delivery_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export interface OrderSummary {
  id: number;
  order_number: string;
  total: string;
  status: OrderStatus;
  status_label: string;
  created_at: string;
}

export interface ProductSize {
  id: number;
  size: string;
  price: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  sort_order: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StoreSetting {
  id: number;
  key: string;
  value: string | null;
  type: 'string' | 'boolean' | 'integer' | 'decimal' | 'json';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sale_price: number | null;
  category_id: number | null;
  category?: Category;
  sizes: ProductSize[];
  addons?: Addon[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  todays_orders: number;
  todays_revenue: string;
  pending_orders: number;
  total_users: number;
  total_orders: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_orders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total: string;
    status: OrderStatus;
    status_label: string;
    items_count: number;
    created_at: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}
