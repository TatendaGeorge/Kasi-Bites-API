import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Package, X, BarChart3, Store, ChevronDown, ChevronRight, Grid3X3, Utensils, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

const mainNavigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
];

const onlineStoreNavigation = [
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Grid3X3 },
  { name: 'Add-ons', href: '/admin/addons', icon: Utensils },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const bottomNavigation = [
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const location = useLocation();

  // Keep Online Store section open if we're on any of its pages
  useEffect(() => {
    const isOnStorePage = onlineStoreNavigation.some(item =>
      location.pathname.startsWith(item.href)
    );
    if (isOnStorePage) {
      setStoreOpen(true);
    }
  }, [location.pathname]);

  const isStoreActive = onlineStoreNavigation.some(item =>
    location.pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed bottom-4 right-4 z-50 lg:hidden bg-gray-900 text-white p-3 rounded-full shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Package className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">Kasi Bites</h1>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 flex flex-col h-[calc(100%-4rem)]">
          {/* Main navigation */}
          {mainNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.exact}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}

          {/* Online Store section */}
          <div className="mt-4">
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors ${
                isStoreActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5" />
                Online Store
              </div>
              {storeOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {storeOpen && (
              <div className="ml-4 border-l border-gray-700 pl-2">
                {onlineStoreNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 mb-0.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom navigation */}
          <div className="pb-6">
            {bottomNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
