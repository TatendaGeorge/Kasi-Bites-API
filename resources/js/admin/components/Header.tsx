import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, ChevronDown, Wifi, WifiOff, Bell } from 'lucide-react';

interface HeaderProps {
  isConnected?: boolean;
  pendingCount?: number;
}

export default function Header({ isConnected = true, pendingCount = 0 }: HeaderProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="lg:hidden">
          {/* Placeholder for mobile menu button in sidebar */}
        </div>

        {/* Connection Status & Pending Alerts */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <Wifi className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <WifiOff className="h-4 w-4" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Pending notifications indicator */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium animate-pulse">
              <Bell className="h-4 w-4" />
              <span>{pendingCount} pending</span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
