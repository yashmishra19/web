import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import LoginPage      from '@/pages/LoginPage';
import SignupPage     from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage  from '@/pages/DashboardPage';
import CheckInPage    from '@/pages/CheckInPage';
import JournalPage    from '@/pages/JournalPage';
import BreathingPage  from '@/pages/BreathingPage';
import AnalyticsPage  from '@/pages/AnalyticsPage';
import SettingsPage   from '@/pages/SettingsPage';
import NotFoundPage   from '@/pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard"  element={<DashboardPage />} />
              <Route path="/checkin"    element={<CheckInPage />} />
              <Route path="/journal"    element={<JournalPage />} />
              <Route path="/breathing"  element={<BreathingPage />} />
              <Route path="/analytics"  element={<AnalyticsPage />} />
              <Route path="/settings"   element={<SettingsPage />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
