import { Link } from 'react-router-dom';
import { Logo, Button } from '../components/shisa';

export default function Landing() {
  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: 'var(--night)', color: 'var(--on-night)' }}>
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Logo variant="lockup" size={28} reversed />
        <Link to="/admin/login" className="text-sm font-bold" style={{ color: 'var(--on-night)', opacity: 0.8 }}>
          Log in
        </Link>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto text-center px-6 py-16">
          <h1
            className="mb-4"
            style={{ font: '700 48px/52px var(--font-display)', letterSpacing: '-0.02em', color: 'var(--on-night)' }}
          >
            Sell food online with your own store on Shisa
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--on-night)', opacity: 0.8 }}>
            Set up your menu, take orders, and manage deliveries — all in one dashboard. Customers discover your store
            alongside every other spot on Shisa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/admin/register">
              <Button variant="light" iconEnd="arrow-right">
                Create your store
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="secondary">Log in</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
