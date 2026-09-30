import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Logo, TextField, Button } from '../components/shisa';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full">
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 32 }}>
          <div className="flex justify-center mb-6">
            <Logo variant="mark" size={48} />
          </div>

          <h1 className="text-center mb-2" style={{ font: '600 24px/30px var(--font-display)', color: 'var(--ink)' }}>
            Admin dashboard
          </h1>
          <p className="text-center mb-8" style={{ color: 'var(--ink-muted)' }}>
            Sign in to manage your orders
          </p>

          {error && (
            <div
              className="mb-6 flex items-center gap-3"
              style={{ padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--brand-soft)', border: '1px solid var(--danger)' }}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />

            <TextField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />

            <Button type="submit" disabled={isLoading} block>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
