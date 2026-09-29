import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesApi } from '../api/client';
import { Store } from '../types';
import { Save, Clock, DollarSign, MapPin, Store as StoreIcon, Power } from 'lucide-react';

interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    is_open: boolean;
  };
}

interface SettingsFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  latitude: number | string;
  longitude: number | string;
  delivery_fee: number | string;
  minimum_order_amount: number | string;
  delivery_radius_km: number | string;
  is_open: boolean;
  operating_hours: OperatingHours;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '21:00', is_open: true },
  tuesday: { open: '09:00', close: '21:00', is_open: true },
  wednesday: { open: '09:00', close: '21:00', is_open: true },
  thursday: { open: '09:00', close: '21:00', is_open: true },
  friday: { open: '09:00', close: '22:00', is_open: true },
  saturday: { open: '10:00', close: '22:00', is_open: true },
  sunday: { open: '10:00', close: '20:00', is_open: true },
};

export default function StoreSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SettingsFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    delivery_fee: '',
    minimum_order_amount: '',
    delivery_radius_km: '',
    is_open: true,
    operating_hours: DEFAULT_OPERATING_HOURS,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const { data: store, isLoading } = useQuery<{ data: Store }>({
    queryKey: ['my-store'],
    queryFn: () => storesApi.getMine(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => storesApi.updateMine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      setHasChanges(false);
    },
  });

  // Initialize form data when the store loads
  useEffect(() => {
    if (store?.data) {
      const s = store.data;
      setFormData({
        name: s.name || '',
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        latitude: s.latitude ?? '',
        longitude: s.longitude ?? '',
        delivery_fee: s.delivery_fee ?? '',
        minimum_order_amount: s.minimum_order_amount ?? '',
        delivery_radius_km: s.delivery_radius_km ?? '',
        is_open: s.is_open,
        operating_hours: (s.operating_hours as OperatingHours) || DEFAULT_OPERATING_HOURS,
      });
    }
  }, [store]);

  const handleChange = (key: keyof SettingsFormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleOperatingHoursChange = (day: string, field: 'open' | 'close' | 'is_open', value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: Record<string, unknown> = {
      name: formData.name || undefined,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      latitude: formData.latitude === '' ? null : Number(formData.latitude),
      longitude: formData.longitude === '' ? null : Number(formData.longitude),
      delivery_fee: formData.delivery_fee === '' ? undefined : Number(formData.delivery_fee),
      minimum_order_amount: formData.minimum_order_amount === '' ? undefined : Number(formData.minimum_order_amount),
      delivery_radius_km: formData.delivery_radius_km === '' ? undefined : Number(formData.delivery_radius_km),
      is_open: formData.is_open,
      operating_hours: formData.operating_hours,
    };

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 mt-1">Configure your store's preferences</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {store?.data && !store.data.is_active && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg">
          Your store is pending approval from the Kasi Bites team. Customers won't see it until it's approved.
        </div>
      )}

      {updateMutation.isSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {updateMutation.isError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Failed to save settings. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Status */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Store Status</h2>
                <p className="text-sm text-gray-500">Control if your store is accepting orders</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Store Open</p>
                <p className="text-sm text-gray-500">Toggle to temporarily close your store</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_open}
                  onChange={(e) => handleChange('is_open', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                <span className={`ml-3 text-sm font-medium ${formData.is_open ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.is_open ? 'Open' : 'Closed'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <StoreIcon className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Store Information</h2>
                <p className="text-sm text-gray-500">Basic store details visible to customers</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Kasi Bites"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., 012 345 6789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g., hello@kasibites.co.za"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g., 123 Main Road, Soweto, Johannesburg"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Delivery Settings</h2>
                <p className="text-sm text-gray-500">Configure delivery fees, radius and store location</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Fees and radius */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Fee (R)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.delivery_fee}
                    onChange={(e) => handleChange('delivery_fee', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="30.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order (R)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_order_amount}
                    onChange={(e) => handleChange('minimum_order_amount', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="50.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Radius (km)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.delivery_radius_km}
                    onChange={(e) => handleChange('delivery_radius_km', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="5"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Store Coordinates */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Store Location Coordinates</h3>
              <p className="text-sm text-gray-500 mb-4">
                Used for calculating delivery distance and showing routes on the map.
                You can find coordinates by right-clicking on Google Maps.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="-33.011664"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="27.866664"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              {formData.latitude && formData.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline"
                >
                  <MapPin className="h-4 w-4" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Operating Hours</h2>
                <p className="text-sm text-gray-500">Set your store's opening and closing times</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {DAYS.map((day) => {
                const hours = formData.operating_hours[day] || { open: '09:00', close: '21:00', is_open: true };
                return (
                  <div
                    key={day}
                    className={`flex items-center gap-4 p-3 rounded-lg ${hours.is_open ? 'bg-green-50' : 'bg-gray-50'}`}
                  >
                    <div className="w-28">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hours.is_open}
                        onChange={(e) => handleOperatingHoursChange(day, 'is_open', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>

                    {hours.is_open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>

      {/* Mobile Save Button */}
      {hasChanges && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
