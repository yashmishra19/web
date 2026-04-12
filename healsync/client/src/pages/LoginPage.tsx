import { useState, useEffect, useRef }
  from 'react'
import { Link, useNavigate }
  from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBackend }
  from '../context/BackendContext'
import { authApi } from '../api'
import { handleApiError }
  from '../api/apiUtils'
import { fakeLogin } from '../mock/auth'
import {
  Eye, EyeOff, Mail, Lock,
  AlertCircle, Leaf
} from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const {
    login,
    user,
    isLoading: authLoading,
  } = useAuth()
  const { isOnline, isChecking } = useBackend()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]     = useState('')
  const [busy, setBusy]       = useState(false)

  const didRedirect = useRef(false)

  // Redirect if already logged in
  // Runs only when authLoading or user changes
  useEffect(() => {
    if (authLoading) return
    if (!user)       return
    if (didRedirect.current) return
    didRedirect.current = true
    navigate('/dashboard', { replace: true })
  }, [authLoading, user])

  // Show loading spinner while auth initialises
  if (authLoading) {
    return (
      <div className="min-h-screen flex
        items-center justify-center
        bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2
          border-mint-500 border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  // If logged in wait for redirect
  if (user) {
    return (
      <div className="min-h-screen flex
        items-center justify-center
        bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2
          border-mint-500 border-t-transparent
          rounded-full animate-spin" />
      </div>
    )
  }

  const submit = async (
    em: string, pw: string
  ) => {
    if (!em.trim()) {
      setError('Enter your email')
      return
    }
    if (!pw) {
      setError('Enter your password')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = isOnline
        ? await authApi.login({
            email:    em.trim().toLowerCase(),
            password: pw,
          })
        : await fakeLogin({
            email:    em.trim().toLowerCase(),
            password: pw,
          })

      login(
        (res as any).accessToken || res.token,
        res.user,
        (res as any).refreshToken
      )
      // navigate happens via useEffect above
    } catch (e: any) {
      setError(handleApiError(e))
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex
      bg-gray-50 dark:bg-gray-950">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2
        bg-gradient-to-br from-mint-500
        to-mint-700 flex-col items-center
        justify-center p-12 relative
        overflow-hidden">
        <div className="absolute top-0 right-0
          w-64 h-64 bg-white/10 rounded-full
          -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0
          w-96 h-96 bg-white/5 rounded-full
          translate-y-48 -translate-x-48" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20
            rounded-3xl flex items-center
            justify-center mx-auto mb-6">
            <Leaf size={40}
              className="text-white" />
          </div>
          <h1 className="text-4xl font-medium
            text-white mb-4">
            HealSync
          </h1>
          <p className="text-white/80 text-lg
            max-w-sm leading-relaxed">
            Your personal health and mental
            wellbeing companion
          </p>
          <div className="mt-8 space-y-3
            text-left">
            {[
              'Daily check-ins and mood tracking',
              'Personalised AI recommendations',
              'Vitals monitoring and trends',
              'Guided breathing and journaling',
            ].map(f => (
              <div key={f}
                className="flex items-center
                  gap-3 text-white/90">
                <div className="w-5 h-5
                  rounded-full bg-white/20
                  flex items-center
                  justify-center shrink-0">
                  <svg width="10" height="10"
                    viewBox="0 0 10 10">
                    <path d="M2 5l2 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center
        justify-center p-6">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex
            items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl
              bg-mint-500 flex items-center
              justify-center">
              <Leaf size={20}
                className="text-white" />
            </div>
            <span className="text-xl font-medium
              text-gray-900 dark:text-white">
              HealSync
            </span>
          </div>

          <h2 className="text-2xl font-medium
            text-gray-900 dark:text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500
            dark:text-gray-400 mb-6">
            Sign in to continue
          </p>

          {!isChecking && (
            <div className={`flex items-center
              gap-2 text-xs mb-5 px-3 py-2
              rounded-lg
              ${isOnline
                ? 'bg-mint-50 text-mint-700 dark:bg-mint-900/20 dark:text-mint-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              }`}>
              <div className={`w-1.5 h-1.5
                rounded-full
                ${isOnline
                  ? 'bg-mint-500'
                  : 'bg-amber-400'
                }`} />
              {isOnline
                ? 'Server connected'
                : 'Offline — demo account available'}
            </div>
          )}

          {error && (
            <div className="flex gap-2
              bg-red-50 dark:bg-red-900/20
              border border-red-200
              dark:border-red-800
              rounded-xl p-3 mb-4">
              <AlertCircle size={16}
                className="text-red-500
                  shrink-0 mt-0.5" />
              <p className="text-sm text-red-700
                dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">

            <div>
              <label className="text-sm
                font-medium text-gray-700
                dark:text-gray-300 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15}
                  className="absolute left-3
                    top-1/2 -translate-y-1/2
                    text-gray-400
                    pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    submit(email, password)}
                  placeholder="you@example.com"
                  className="input pl-10 w-full"
                  autoComplete="email"
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between
                mb-1.5">
                <label className="text-sm
                  font-medium text-gray-700
                  dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs text-mint-600
                    dark:text-mint-400
                    hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15}
                  className="absolute left-3
                    top-1/2 -translate-y-1/2
                    text-gray-400
                    pointer-events-none" />
                <input
                  type={
                    showPass ? 'text' : 'password'
                  }
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)}
                  onKeyDown={e =>
                    e.key === 'Enter' &&
                    submit(email, password)}
                  placeholder="Your password"
                  className="input pl-10 pr-10
                    w-full"
                  autoComplete="current-password"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPass(p => !p)}
                  className="absolute right-3
                    top-1/2 -translate-y-1/2
                    text-gray-400
                    hover:text-gray-600
                    dark:hover:text-gray-300">
                  {showPass
                    ? <EyeOff size={15} />
                    : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              onClick={() =>
                submit(email, password)}
              disabled={busy}
              className="btn-primary w-full h-11
                text-sm font-medium
                flex items-center
                justify-center gap-2">
              {busy ? (
                <>
                  <svg className="animate-spin
                    w-4 h-4" viewBox="0 0 24 24"
                    fill="none">
                    <circle cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeOpacity="0.3" />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>

            <div className="flex items-center
              gap-3">
              <div className="flex-1 h-px
                bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs
                text-gray-400">or</span>
              <div className="flex-1 h-px
                bg-gray-200 dark:bg-gray-700" />
            </div>

            <button
              onClick={() => submit(
                'demo@healsync.app', 'demo1234'
              )}
              disabled={busy}
              className="w-full h-11 rounded-xl
                border border-gray-200
                dark:border-gray-700
                bg-white dark:bg-gray-800
                text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-gray-50
                dark:hover:bg-gray-700
                transition-colors
                flex items-center
                justify-center gap-2
                disabled:opacity-50">
              <Leaf size={15}
                className="text-mint-500" />
              Try demo account
            </button>

          </div>

          <p className="text-center text-sm
            text-gray-500 dark:text-gray-400
            mt-6">
            No account?{' '}
            <Link to="/signup"
              className="text-mint-600
                dark:text-mint-400 font-medium
                hover:underline">
              Sign up free
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
