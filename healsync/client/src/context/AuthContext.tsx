import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import type {
  PublicUser,
  OnboardingPayload,
  UserProfile,
} from '../../../shared/types'

const TOKEN_KEY   = 'healsync_token'
const USER_KEY    = 'healsync_user'
const PROFILE_KEY = 'healsync_profile'
const REFRESH_KEY = 'healsync_refresh_token'

interface AuthContextValue {
  user:                 PublicUser | null
  token:                string | null
  profile:              UserProfile | null
  isLoading:            boolean
  login:                (
    token: string,
    user: PublicUser,
    refreshToken?: string
  ) => void
  logout:               () => void
  updateUser:           (user: PublicUser) => void
  completeOnboarding:   (
    payload: OnboardingPayload
  ) => void
  setProfileData:       (
    profile: UserProfile
  ) => void
  refreshUser:          () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(null)

export function AuthProvider(
  { children }: { children: ReactNode }
) {
  const [user, setUser] =
    useState<PublicUser | null>(null)
  const [token, setToken] =
    useState<string | null>(null)
  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  // CRITICAL: starts true, set false after
  // localStorage read. This prevents flicker.
  const [isLoading, setIsLoading] =
    useState(true)

  // Read from localStorage ONCE on mount
  // Empty deps [] = runs exactly once
  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY)
      const u = localStorage.getItem(USER_KEY)
      const p = localStorage.getItem(PROFILE_KEY)
      if (t && u) {
        setToken(t)
        setUser(JSON.parse(u))
      }
      if (p) {
        setProfile(JSON.parse(p))
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(PROFILE_KEY)
    } finally {
      // Always set false so app can render
      setIsLoading(false)
    }
  }, []) // ← EMPTY ARRAY. DO NOT ADD DEPS HERE.

  const login = (
    newToken: string,
    newUser: PublicUser,
    refreshToken?: string
  ) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(
      USER_KEY, JSON.stringify(newUser)
    )
    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setProfile(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  const updateUser = (updated: PublicUser) => {
    setUser(updated)
    localStorage.setItem(
      USER_KEY, JSON.stringify(updated)
    )
  }

  const setProfileData = (
    newProfile: UserProfile
  ) => {
    setProfile(newProfile)
    localStorage.setItem(
      PROFILE_KEY, JSON.stringify(newProfile)
    )
  }

  const completeOnboarding = (
    payload: OnboardingPayload
  ) => {
    const profileData = {
      ...payload,
      id:        'local',
      userId:    user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as UserProfile

    setProfile(profileData)
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profileData)
    )

    if (user) {
      const updated = {
        ...user,
        hasCompletedOnboarding: true,
      }
      setUser(updated)
      localStorage.setItem(
        USER_KEY, JSON.stringify(updated)
      )
    }
  }

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          updateUser(data.data)
        }
      }
    } catch {
      // silent
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      isLoading,
      login,
      logout,
      updateUser,
      completeOnboarding,
      setProfileData,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error(
    'useAuth must be used inside AuthProvider'
  )
  return ctx
}
