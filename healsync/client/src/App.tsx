import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui';
import { AppLayout } from '@/components/layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BackendProvider } from './context/BackendContext';

import LoginPage      from '@/pages/LoginPage';
import SignupPage     from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage  from '@/pages/DashboardPage';
import CheckInPage    from '@/pages/CheckInPage';
import JournalPage    from '@/pages/JournalPage';
import BreathingPage  from '@/pages/BreathingPage';
import AnalyticsPage  from '@/pages/AnalyticsPage';
import SettingsPage   from '@/pages/SettingsPage';
import ChatbotPage    from '@/pages/ChatbotPage';
import NotFoundPage   from '@/pages/NotFoundPage';
import MoodHistoryPage from '@/pages/MoodHistoryPage';
import SelfCarePage   from '@/pages/SelfCarePage';
import LandingPage    from '@/pages/LandingPage';
import VitalsPage       from '@/pages/VitalsPage';
import NearbyFacilitiesPage from '@/pages/NearbyFacilitiesPage';

export default function App() {
  return (
    <ThemeProvider>
      <BackendProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes — wrapped in AppLayout shell */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/dashboard"  element={<DashboardPage />} />
                  <Route path="/checkin"    element={<CheckInPage />} />
                  <Route path="/journal"    element={<JournalPage />} />
                  <Route path="/breathing"  element={<BreathingPage />} />
                  <Route path="/analytics"  element={<AnalyticsPage />} />
                  <Route path="/chat"       element={<ChatbotPage />} />
                  <Route path="/settings"   element={<SettingsPage />} />
                  <Route path="/mood-history" element={<MoodHistoryPage />} />
                  <Route path="/self-care"    element={<SelfCarePage />} />
                  <Route path="/vitals"       element={<VitalsPage />} />
                  <Route path="/nearby"       element={<NearbyFacilitiesPage />} />
                </Route>
              </Route>

              {/* Redirects */}
              <Route path="/" element={<LandingPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
      </BackendProvider>
    </ThemeProvider>
  );
}
