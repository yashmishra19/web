import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '../api';
import { handleApiError } from '../api/apiUtils';
import { fakeSignup } from '@/mock/auth';
import { useBackend } from '../context/BackendContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface FieldErrors {
  name?:            string;
  email?:           string;
  password?:        string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useBackend();

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors,     setFieldErrors]     = useState<FieldErrors>({});
  const [serverError,     setServerError]     = useState('');
  const [submitting,      setSubmitting]      = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return <LoadingScreen />;

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }
    if (!email.trim()) {
      errors.email = 'Email is required.';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    setServerError('');
    if (!validate()) return;

    try {
      setSubmitting(true);
      let response
      if (isOnline) {
        response = await authApi.signup({
          name: name.trim(), email: email.trim(), password
        })
      } else {
        response = await fakeSignup({
          name: name.trim(), email: email.trim(), password
        })
      }
      login(response.token, response.user)
      navigate('/onboarding')
    } catch (err: any) {
      setFieldErrors({
        name: handleApiError(err)
      })
      setServerError(handleApiError(err))
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
              <line x1="8"  y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 dark:text-gray-100 mt-3">HealSync</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your account</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
            required
            autoComplete="name"
            error={fieldErrors.name}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={fieldErrors.email}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            helperText="At least 8 characters"
            error={fieldErrors.password}
          />

          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />

          {serverError && (
            <p className="text-sm text-red-500">{serverError}</p>
          )}

          <Button fullWidth loading={submitting} onClick={handleSubmit}>
            Create account
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-mint-600 hover:text-mint-700 font-medium transition-colors">
            Sign in
          </Link>
        </p>

        {/* Safety note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          By signing up you agree this app is for wellness support only
          and is not a substitute for medical care.
        </p>
      </div>
    </div>
  );
}
