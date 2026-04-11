import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { PublicUser, OnboardingPayload, UserProfile } from '@shared/types';
import { authApi } from '../api';
import api from '../api/client';

const TOKEN_KEY   = 'healsync_token';
const USER_KEY    = 'healsync_user';
const PROFILE_KEY = 'healsync_profile';

interface AuthContextValue {
  user:               PublicUser | null;
  token:              string | null;
  isLoading:          boolean;
  login:              (token: string, user: PublicUser) => void;
  logout:             () => void;
  updateUser:         (user: PublicUser) => void;
  completeOnboarding: (profile: OnboardingPayload) => void;
  refreshUser:        () => Promise<void>;
  profile:            UserProfile | null;
  setProfileData:     (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<PublicUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile,   setProfile]   = useState<UserProfile | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken   = localStorage.getItem(TOKEN_KEY);
      const storedUser    = localStorage.getItem(USER_KEY);
      const storedProfile = localStorage.getItem(PROFILE_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as PublicUser);
      }
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as UserProfile);
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync user data + profile from backend when token is present
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      refreshUser().catch(() => {});
      fetchAndStoreProfile().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch profile whenever token changes (login / re-auth)
  useEffect(() => {
    if (token && user) {
      fetchAndStoreProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Helpers ──────────────────────────────────────────────

  const fetchAndStoreProfile = async () => {
    try {
      const res = await api.get('/profile/me');
      const fetchedProfile = res.data?.data ?? res.data;
      if (fetchedProfile) {
        setProfile(fetchedProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(fetchedProfile));
      }
    } catch {
      // Silent — profile just stays as cached value
    }
  };

  function login(newToken: string, newUser: PublicUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  function updateUser(updatedUser: PublicUser) {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  function completeOnboarding(payload: OnboardingPayload) {
    // Build a local UserProfile from the payload so UI shows data immediately
    const profileData: UserProfile = {
      ...payload,
      id:        'local',
      userId:    user?.id || 'mock-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProfile(profileData);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));

    // Mark onboarding complete on user object
    if (user) {
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }

    // Also try to fetch the canonical profile from backend in background
    fetchAndStoreProfile().catch(() => {});
  }

  const setProfileData = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  };

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
      profile,
      setProfileData,
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
