import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-gray-900 p-2 rounded-lg">
            <Package className="h-5 w-5 text-orange-500" />
          </div>
          <span className="font-bold text-gray-900">Kasi Bites</span>
        </div>
        <Link
          to="/admin/login"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Log in
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto text-center px-6 py-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Sell food online with your own store on Kasi Bites
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
            Set up your menu, take orders, and manage deliveries — all in one dashboard.
            Customers discover your store alongside every other store on Kasi Bites.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/admin/register"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Create your store
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
