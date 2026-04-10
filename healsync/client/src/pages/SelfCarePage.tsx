import { useState } from 'react';
import { PageHeader, Card, Badge, Button, DisclaimerBanner } from '../components/ui';
import { BookOpen, Sun, Coffee, Music, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SELF_CARE_CATEGORIES = [
  {
    id: 'mind',
    label: 'Mental',
    icon: BookOpen,
    color: 'purple',
    items: [
      { title: 'Morning journaling', desc: '5 minutes of free writing to clear your mind', time: '5 min', action: 'Start journal', href: '/journal' },
      { title: 'Guided breathing', desc: 'Calm your nervous system with box breathing', time: '5 min', action: 'Start breathing', href: '/breathing' },
      { title: 'Digital detox hour', desc: 'Put your phone down and be present', time: '1 hour', action: null, href: null },
      { title: 'Gratitude list', desc: 'Write 3 things you are grateful for today', time: '3 min', action: 'Open journal', href: '/journal' },
    ]
  },
  {
    id: 'body',
    label: 'Physical',
    icon: Sun,
    color: 'green',
    items: [
      { title: 'Morning stretch', desc: '10 minutes of gentle stretching after waking up', time: '10 min', action: null, href: null },
      { title: 'Walk outside', desc: 'A short walk in natural light boosts serotonin', time: '15 min', action: null, href: null },
      { title: 'Stay hydrated', desc: 'Drink a full glass of water right now', time: '1 min', action: 'Log water', href: '/checkin' },
      { title: 'Early bedtime', desc: 'Aim to be in bed 30 minutes earlier tonight', time: 'Tonight', action: null, href: null },
    ]
  },
  {
    id: 'social',
    label: 'Social',
    icon: Coffee,
    color: 'amber',
    items: [
      { title: 'Call a friend', desc: 'A 10-minute call with someone you trust', time: '10 min', action: null, href: null },
      { title: 'Step outside', desc: 'Go somewhere with other people around', time: '20 min', action: null, href: null },
      { title: 'Send a kind message', desc: 'Tell someone you appreciate them', time: '2 min', action: null, href: null },
    ]
  },
  {
    id: 'relax',
    label: 'Relaxation',
    icon: Music,
    color: 'blue',
    items: [
      { title: 'Listen to calm music', desc: 'Put on music that makes you feel safe', time: '15 min', action: null, href: null },
      { title: 'Take a warm shower', desc: 'Warm water reduces cortisol levels', time: '10 min', action: null, href: null },
      { title: 'Read a book', desc: 'Even 10 pages helps lower stress significantly', time: '15 min', action: null, href: null },
      { title: 'Breathing exercise', desc: 'Use 4-7-8 breathing to calm down quickly', time: '5 min', action: 'Start now', href: '/breathing' },
    ]
  },
];

const SUPPORT_RESOURCES = [
  {
    name: 'iCall — India',
    desc: 'Free psychological counselling by trained professionals',
    contact: '9152987821',
    type: 'phone',
    available: 'Mon–Sat, 8am–10pm',
  },
  {
    name: 'Vandrevala Foundation',
    desc: '24/7 mental health helpline across India',
    contact: '1860-2662-345',
    type: 'phone',
    available: '24 / 7',
  },
  {
    name: 'AASRA',
    desc: 'Suicide prevention and crisis support',
    contact: '9820466627',
    type: 'phone',
    available: '24 / 7',
  },
  {
    name: 'Snehi',
    desc: 'Emotional support helpline',
    contact: '044-24640050',
    type: 'phone',
    available: 'Daily, 8am–10pm',
  },
];

export default function SelfCarePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('mind');

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const allItems = SELF_CARE_CATEGORIES.flatMap(c => c.items);
  const pick = allItems[dayOfYear % allItems.length];

  const activeCategoryData = SELF_CARE_CATEGORIES.find(c => c.id === activeCategory);
  if (!activeCategoryData) return null;

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto pb-20">
      <PageHeader title="Self-Care" subtitle="Small actions that make a big difference" />

      <Card className="bg-gradient-to-r from-purple-50 to-mint-50 dark:from-purple-900/20 dark:to-mint-900/20 border border-purple-100 dark:border-purple-800">
        <div className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2">
          Today's recommendation
        </div>
        <div className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">{pick.title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{pick.desc}</div>
        {pick.href && (
          <Button variant="primary" size="sm" onClick={() => navigate(pick.href!)}>
            Try it now →
          </Button>
        )}
      </Card>

      <div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {SELF_CARE_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] shrink-0 ${
                  isActive
                    ? 'bg-mint-500 text-white border border-mint-500'
                    : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeCategoryData.items.map((item, idx) => (
            <Card key={idx} className="hover:shadow-card-hover cursor-default transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.title}</div>
                <Badge color="gray">{item.time}</Badge>
              </div>
              <div className="text-xs text-gray-400 mt-1 mb-3">{item.desc}</div>
              {item.action && item.href && (
                <Button variant="secondary" size="sm" onClick={() => navigate(item.href!)}>
                  {item.action} →
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <PhoneCall size={18} className="text-red-500" />
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Crisis support & helplines</div>
        </div>
        <div className="text-xs text-gray-400 mb-4">
          If you are struggling, you do not have to face it alone. Reaching out is a sign of strength.
        </div>

        <div className="space-y-3">
          {SUPPORT_RESOURCES.map((res, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <PhoneCall size={16} className="text-red-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{res.name}</div>
                <div className="text-xs text-gray-400 mb-1">{res.desc}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="text-sm font-medium text-mint-600 dark:text-mint-400">{res.contact}</div>
                  <Badge color="gray" className="text-[10px]">{res.available}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <DisclaimerBanner />
    </div>
  );
}
