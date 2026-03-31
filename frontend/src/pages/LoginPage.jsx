import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginRequest } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

const inputClass = 'w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-[--muted] transition focus:outline-none focus:border-white/40';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">DevTrackr</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border p-8 space-y-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm text-red-400 border border-red-900/50 bg-red-950/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
                style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
