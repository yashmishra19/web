import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { PublicUser, OnboardingPayload } from '@shared/types';
import { authApi } from '../api';

const TOKEN_KEY = 'healsync_token';
const USER_KEY  = 'healsync_user';

interface AuthContextValue {
  user:                PublicUser | null;
  token:               string | null;
  isLoading:           boolean;
  login:               (token: string, user: PublicUser) => void;
  logout:              () => void;
  updateUser:          (user: PublicUser) => void;
  completeOnboarding:  (profile: OnboardingPayload) => void;
  refreshUser:         () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<PublicUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as PublicUser);
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync user data from backend on mount when token exists
  // (updates streakCount, hasCompletedOnboarding, etc.)
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      refreshUser().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(newToken: string, newUser: PublicUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function updateUser(updatedUser: PublicUser) {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  function completeOnboarding(_profile: OnboardingPayload) {
    // Mark user as having completed onboarding in local state
    if (user) {
      const updated = { ...user, hasCompletedOnboarding: true };
      updateUser(updated);
    }
  }

  async function refreshUser() {
    try {
      const updatedUser = await authApi.getMe();
      if (updatedUser) updateUser(updatedUser);
    } catch {
      // If token is invalid, log out silently
      // (401 handler in api/client.ts also redirects)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      updateUser,
      completeOnboarding,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
