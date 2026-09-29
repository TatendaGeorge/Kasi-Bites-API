import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useStore } from './hooks/useStore';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StoreOnboarding from './pages/StoreOnboarding';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Products from './pages/Products';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import Categories from './pages/Categories';
import Addons from './pages/Addons';
import StoreSettings from './pages/StoreSettings';
import Reports from './pages/Reports';
import PlatformStores from './pages/PlatformStores';
import PlatformStoreDetail from './pages/PlatformStoreDetail';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

/** Wraps any route that needs a logged-in user, regardless of store/platform role. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullScreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}

/** Store management routes: requires a store, otherwise sends the user to
 *  onboarding (or to the platform view if they're platform staff with no store). */
function RequireStore({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { hasStore, isLoading } = useStore();

  if (isLoading) return <FullScreenSpinner />;
  if (!hasStore) {
    return <Navigate to={user?.is_admin ? '/admin/platform/stores' : '/admin/onboarding'} replace />;
  }

  return <>{children}</>;
}

/** Onboarding: only for authenticated users who don't already own a store. */
function RequireNoStore({ children }: { children: React.ReactNode }) {
  const { hasStore, isLoading } = useStore();

  if (isLoading) return <FullScreenSpinner />;
  if (hasStore) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

/** Platform oversight routes: Kasi Bites staff only. */
function RequirePlatformAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullScreenSpinner />;
  if (!user?.is_admin) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullScreenSpinner />;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

/** Catch-all: routes the visitor to wherever makes sense for their auth/store state. */
function RootRedirect() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { hasStore, isLoading: storeLoading } = useStore();

  if (authLoading || storeLoading) return <FullScreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (hasStore) return <Navigate to="/admin" replace />;
  if (user?.is_admin) return <Navigate to="/admin/platform/stores" replace />;
  return <Navigate to="/admin/onboarding" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/admin/onboarding"
          element={
            <RequireAuth>
              <RequireNoStore>
                <StoreOnboarding />
              </RequireNoStore>
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireStore>
                <Layout />
              </RequireStore>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductCreate />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="categories" element={<Categories />} />
          <Route path="addons" element={<Addons />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route
          path="/admin/platform"
          element={
            <RequireAuth>
              <RequirePlatformAdmin>
                <Layout />
              </RequirePlatformAdmin>
            </RequireAuth>
          }
        >
          <Route path="stores" element={<PlatformStores />} />
          <Route path="stores/:slug" element={<PlatformStoreDetail />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
