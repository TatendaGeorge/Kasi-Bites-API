import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Logo, TextField, Button } from '../components/shisa';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, phone, password);
      navigate('/admin/onboarding', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not create your account. Please try again.');
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
            Create your store owner account
          </h1>
          <p className="text-center mb-8" style={{ color: 'var(--ink-muted)' }}>
            Next you'll set up your store's profile.
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
            <TextField label="Full name" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />

            <TextField
              label="Email address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <TextField
              label="Phone number"
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
            />

            <TextField
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />

            <Button type="submit" disabled={isLoading} block>
              {isLoading ? 'Creating account…' : 'Continue'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--ink-muted)' }}>
            Already have an account?{' '}
            <Link to="/admin/login" className="sh-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
