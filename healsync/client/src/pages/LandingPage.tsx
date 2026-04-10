import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, BarChart2, Wind, BookOpen, MessageCircle,
  Shield, ChevronRight, Sparkles, CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleStartFree = () => navigate('/signup');
  const handleScrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mint-500 rounded-xl flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-medium text-gray-900 dark:text-white">HealSync</span>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/login" className="btn-ghost text-sm px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-sm px-4 py-1.5 rounded-lg bg-mint-500 text-white hover:bg-mint-600 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-mint-50 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400 text-xs font-medium px-4 py-1.5 rounded-full border border-mint-200 dark:border-mint-700 mb-6">
          <Sparkles size={12} />
          Personalised health + mental wellbeing
        </div>
        <h1 className="text-4xl md:text-5xl font-medium text-gray-900 dark:text-white leading-tight mb-4">
          Your health,<br />
          <span className="text-mint-500">personalised.</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          HealSync combines daily health tracking with mental wellbeing support — giving you one place to understand and improve how you feel.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center flex-wrap">
          <button
            onClick={handleStartFree}
            className="btn-primary px-8 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors text-lg flex items-center gap-2"
          >
            Start for free <ChevronRight size={20} />
          </button>
          <button
            onClick={handleScrollToFeatures}
            className="btn-secondary px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg"
          >
            See how it works
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-400 flex items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-mint-500" /> No account required to explore</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-mint-500" /> No ads</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1"><CheckCircle size={12} className="text-mint-500" /> Your data stays on your device</span>
        </div>
      </header>

      {/* FEATURE CARDS */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100">
            Everything you need <span className="text-mint-500">in one calm space</span>
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Built around your wellbeing — not engagement metrics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-3">
              <BarChart2 size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Daily check-ins</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Log your mood, sleep, water, stress and activity in under 2 minutes. See patterns over days and weeks.
            </p>
          </div>
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center mb-3">
              <Heart size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Personalised recommendations</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Get health suggestions based on your actual data — not generic advice designed for everyone.
            </p>
          </div>
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-3">
              <Wind size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Guided breathing</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Evidence-based breathing techniques to reduce stress, improve sleep, and boost focus. No experience needed.
            </p>
          </div>
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Private journal</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              A safe space to write freely. Reflect on your day, track emotional patterns, and process your thoughts.
            </p>
          </div>
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-3">
              <BarChart2 size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Wellness analytics</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Beautiful charts showing your mood, sleep, stress, and wellness trends over time. Know exactly how you are doing.
            </p>
          </div>
          <div className="card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-card-hover transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-3">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">AI wellness assistant</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Ask questions, get tips, and receive support from your personal AI companion. Available whenever you need it.
            </p>
            <div className="absolute bottom-5 left-5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Coming soon
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-10">How HealSync works</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 text-center">
              <div className="w-10 h-10 rounded-full bg-mint-500 text-white font-medium text-sm flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Complete a quick assessment</h3>
              <p className="text-xs text-gray-400">Tell us about your age, lifestyle, sleep habits and goals. Takes 3 minutes.</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-10 h-10 rounded-full bg-mint-500 text-white font-medium text-sm flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Log your daily check-in</h3>
              <p className="text-xs text-gray-400">Each day, rate your mood, stress, sleep and activity. Your wellness score updates instantly.</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-10 h-10 rounded-full bg-mint-500 text-white font-medium text-sm flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Get personalised guidance</h3>
              <p className="text-xs text-gray-400">Receive recommendations, track your progress, and access tools built for your wellbeing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-mint-500 to-calm-500 rounded-3xl p-10 text-white shadow-lg">
          <h2 className="text-2xl font-medium mb-2">Start your wellness journey today</h2>
          <p className="text-sm opacity-80 mb-6 max-w-lg mx-auto">Free, private, and designed around you.</p>
          <button
            onClick={handleStartFree}
            className="bg-white text-mint-700 font-medium px-8 py-3 rounded-xl hover:bg-mint-50 transition-colors inline-block"
          >
            Create free account →
          </button>
          <p className="text-xs opacity-60 mt-3">No credit card. No subscription. No ads.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500 font-bold text-[10px]">H</div>
            HealSync © 2026
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Shield size={10} />
            Your data never leaves your device
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Sign in</Link>
            <Link to="/signup" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
