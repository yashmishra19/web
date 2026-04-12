import { Navigate, Outlet, useLocation }
  from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { user, token, isLoading } = useAuth()
  const location = useLocation()

  // Show spinner while localStorage loads
  if (isLoading) {
    return (
      <div className="min-h-screen flex
        items-center justify-center
        bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col
          items-center gap-3">
          <div className="w-10 h-10 rounded-2xl
            bg-mint-500 flex items-center
            justify-center">
            <svg width="20" height="20"
              viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4C14 4 6 9 6 16a8 8 0
                   0016 0c0-7-8-12-8-12z"
                fill="white"
              />
            </svg>
          </div>
          <div className="w-5 h-5 border-2
            border-mint-500
            border-t-transparent rounded-full
            animate-spin" />
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Needs onboarding
  if (
    !user.hasCompletedOnboarding &&
    location.pathname !== '/onboarding'
  ) {
    return (
      <Navigate to="/onboarding" replace />
    )
  }

  return <Outlet />
}
