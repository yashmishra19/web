import { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import { AuthProvider } from
  './context/AuthContext'
import { ThemeProvider } from
  './context/ThemeContext'
import { BackendProvider } from
  './context/BackendContext'
import { ToastProvider } from
  './components/ui/Toast'
import ProtectedRoute from
  './components/ProtectedRoute'
import AppLayout from
  './components/layout/AppLayout'

// Eagerly load auth pages (small + critical)
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import LandingPage  from './pages/LandingPage'

// Lazily load everything else
const OnboardingPage  = lazy(() =>
  import('./pages/OnboardingPage'))
const DashboardPage   = lazy(() =>
  import('./pages/DashboardPage'))
const CheckInPage     = lazy(() =>
  import('./pages/CheckInPage'))
const JournalPage     = lazy(() =>
  import('./pages/JournalPage'))
const BreathingPage   = lazy(() =>
  import('./pages/BreathingPage'))
const AnalyticsPage   = lazy(() =>
  import('./pages/AnalyticsPage'))
const SettingsPage    = lazy(() =>
  import('./pages/SettingsPage'))
const VitalsPage      = lazy(() =>
  import('./pages/VitalsPage'))
const SelfCarePage    = lazy(() =>
  import('./pages/SelfCarePage'))
const ChatbotPage     = lazy(() =>
  import('./pages/ChatbotPage'))
// Removed non-existent auth pages
const NotFoundPage    = lazy(() =>
  import('./pages/NotFoundPage'))

// Simple full-screen spinner for lazy loads
function PageSpinner() {
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

export default function App() {
  return (
    <ThemeProvider>
      <BackendProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageSpinner />}>
                <Routes>

                  {/* Public routes */}
                  <Route path="/"
                    element={<LandingPage />} />
                  <Route path="/login"
                    element={<LoginPage />} />
                  <Route path="/signup"
                    element={<SignupPage />} />
                  {/* Removed non-existent auth routes */}

                  {/* Protected routes */}
                  <Route element={
                    <ProtectedRoute />}>

                    {/* Onboarding — no layout */}
                    <Route path="/onboarding"
                      element={
                        <OnboardingPage />} />

                    {/* App with layout */}
                    <Route element={
                      <AppLayout />}>
                      <Route path="/dashboard"
                        element={
                          <DashboardPage />} />
                      <Route path="/checkin"
                        element={
                          <CheckInPage />} />
                      <Route path="/journal"
                        element={
                          <JournalPage />} />
                      <Route path="/breathing"
                        element={
                          <BreathingPage />} />
                      <Route path="/analytics"
                        element={
                          <AnalyticsPage />} />
                      <Route path="/settings"
                        element={
                          <SettingsPage />} />
                      <Route path="/vitals"
                        element={
                          <VitalsPage />} />
                      <Route path="/self-care"
                        element={
                          <SelfCarePage />} />
                      <Route path="/chat"
                        element={
                          <ChatbotPage />} />
                    </Route>
                  </Route>

                  {/* 404 */}
                  <Route path="*"
                    element={<NotFoundPage />} />

                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </BackendProvider>
    </ThemeProvider>
  )
}
