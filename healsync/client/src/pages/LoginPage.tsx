import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '../api';
import { handleApiError } from '../api/apiUtils';
import { fakeLogin } from '@/mock/auth';
import { useBackend } from '../context/BackendContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useBackend();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return <LoadingScreen />;

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    try {
      setSubmitting(true)
      setError('')
      let response
      if (isOnline) {
        response = await authApi.login({ email, password })
      } else {
        response = await fakeLogin({ email, password })
      }
      login(response.token, response.user)
      navigate(
        response.user.hasCompletedOnboarding
          ? '/dashboard'
          : '/onboarding'
      )
    } catch (err: any) {
      setError(handleApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-calm-50
                    dark:from-gray-950 dark:to-gray-900
                    flex items-center justify-center p-4">
      <div className="card max-w-sm w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-mint-500 flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.75 8.66A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100 mt-3">HealSync</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Welcome back</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            Sign in
          </Button>

          {/* Demo hint */}
          <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl p-3">
            <p className="text-xs text-mint-700 dark:text-mint-400">

            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 text-center mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-mint-600 hover:text-mint-700 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
