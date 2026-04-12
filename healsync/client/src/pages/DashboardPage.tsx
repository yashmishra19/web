import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBackend } from '../context/BackendContext'
import { useTheme } from '../context/ThemeContext'
import { MOCK_DASHBOARD, MOCK_VITALS_READINGS }
  from '../mock/data'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import {
  Heart, Droplets, Moon, Smile, Zap,
  Activity, Target, Plus, Wind,
  Apple, Thermometer,
  ChevronRight, Watch, X, Check,
} from 'lucide-react'

// ── Inline GoalModal (no external import needed) ──
interface HealthGoal {
  id:        string
  title:     string
  category:  string
  target:    string
  deadline:  string
  completed: boolean
  createdAt: string
}

const GOAL_TEMPLATES = [
  { title: 'Walk 8000 steps daily',
    target: '8000 steps/day' },
  { title: 'Drink 2.5L water daily',
    target: '2.5L/day' },
  { title: 'Sleep 8 hours nightly',
    target: '8 hrs/night' },
  { title: 'Meditate 10 minutes',
    target: '10 min/day' },
  { title: 'Exercise 3 times a week',
    target: '3x/week' },
  { title: 'No screens after 10pm',
    target: 'Daily' },
]

function GoalModal({ isOpen, onClose, onSave }: {
  isOpen:  boolean
  onClose: () => void
  onSave:  (g: HealthGoal) => void
}) {
  const [title, setTitle]   = useState('')
  const [target, setTarget] = useState('')

  if (!isOpen) return null

  const save = () => {
    if (!title.trim()) return
    onSave({
      id:        Date.now().toString(),
      title:     title.trim(),
      category:  'general',
      target:    target.trim(),
      deadline:  '',
      completed: false,
      createdAt: new Date().toISOString(),
    })
    setTitle('')
    setTarget('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50
        z-50 flex items-end md:items-center
        justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900
          rounded-2xl w-full max-w-md p-5
          shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between
          items-center mb-4">
          <h3 className="text-base font-medium
            text-gray-900 dark:text-white">
            Add health goal
          </h3>
          <button onClick={onClose}
            className="text-gray-400
              hover:text-gray-600 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500
          dark:text-gray-400 mb-2">
          Quick add
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {GOAL_TEMPLATES.map(t => (
            <button
              key={t.title}
              onClick={() => {
                setTitle(t.title)
                setTarget(t.target)
              }}
              className={`text-xs px-3 py-1.5
                rounded-xl border transition-colors
                ${title === t.title
                  ? 'border-mint-400 bg-mint-50 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-mint-300'
                }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium
              text-gray-700 dark:text-gray-300
              block mb-1">
              Goal
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Walk 30 minutes daily"
              className="input w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium
              text-gray-700 dark:text-gray-300
              block mb-1">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 30 min/day"
              className="input w-full"
            />
          </div>
          <button
            onClick={save}
            disabled={!title.trim()}
            className="btn-primary w-full h-10
              text-sm disabled:opacity-50">
            Add goal
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Goals storage ──────────────────────────────
const GOALS_KEY = 'healsync_goals'

function loadGoals(): HealthGoal[] {
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveGoals(goals: HealthGoal[]) {
  localStorage.setItem(
    GOALS_KEY, JSON.stringify(goals)
  )
}

// ── Time ago helper removed (unused) ──────────

// ── Main Dashboard ─────────────────────────────
export default function DashboardPage() {
  const navigate         = useNavigate()
  const { user }         = useAuth()
  const { isOnline }     = useBackend()
  const { resolvedTheme } = useTheme()
  const isDark           = resolvedTheme === 'dark'

  // Dashboard data state
  const [dashData, setDashData] = useState(
    MOCK_DASHBOARD
  )
  const [vitals, setVitals]     = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [goals, setGoals]       =
    useState<HealthGoal[]>([])
  const [showGoalModal, setShowGoalModal] =
    useState(false)

  const loadedRef = useRef(false)

  // Load data once on mount
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    // Load goals from localStorage
    setGoals(loadGoals())

    // Load vitals from localStorage or mock
    try {
      const raw = localStorage.getItem(
        'healsync_vitals_latest'
      )
      if (raw) setVitals(JSON.parse(raw))
      else if (MOCK_VITALS_READINGS?.length) {
        setVitals(MOCK_VITALS_READINGS[0])
      }
    } catch {}

    // Load dashboard data
    const fetchDash = async () => {
      try {
        if (isOnline) {
          const token = localStorage.getItem(
            'healsync_token'
          )
          if (token) {
            const res = await fetch('/api/dashboard', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            if (res.ok) {
              const json = await res.json()
              if (json.data) {
                setDashData(json.data)
              }
            }
          }
        }
      } catch {
        // Use mock data on error
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to prevent flash
    setTimeout(fetchDash, 300)
  }, [])

  const addGoal = (goal: HealthGoal) => {
    const updated = [goal, ...goals]
    setGoals(updated)
    saveGoals(updated)
  }

  const toggleGoal = (id: string) => {
    const updated = goals.map(g =>
      g.id === id
        ? { ...g, completed: !g.completed }
        : g
    )
    setGoals(updated)
    saveGoals(updated)
  }

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    saveGoals(updated)
  }

  // Safe data access
  const hour       = new Date().getHours()
  const timeOfDay  = hour < 12 ? 'Morning'
                   : hour < 17 ? 'Afternoon'
                   : 'Evening'
  const firstName  =
    user?.name?.split(' ')[0] ?? 'there'

  const hasCheckedIn =
    dashData?.hasCheckedInToday ?? false
  const todayMood    = dashData?.todayMood ?? null
  const waterToday   = dashData?.waterToday ?? 0
  const stressToday  = dashData?.stressToday ?? null
  const sleepData7   = dashData?.sleepLast7Days ?? []
  const lastSleep    =
    sleepData7.length > 0
      ? sleepData7[sleepData7.length - 1]
      : null
  const recommendations =
    dashData?.recommendations ?? []

  const avgSleep = sleepData7.length > 0
    ? (sleepData7.reduce((a: number, b: number) =>
        a + b, 0) / sleepData7.length
      ).toFixed(1)
    : '—'

  const chartData = sleepData7.map(
    (hours: number, i: number) => ({
      day: ['M','T','W','T','F','S','S'][i] ?? '',
      hours,
    })
  )

  const recStyle: Record<string, any> = {
    sleep:        { icon: Moon,     bg: 'bg-indigo-100 dark:bg-indigo-900/40', color: 'text-indigo-500 dark:text-indigo-400' },
    hydration:    { icon: Droplets, bg: 'bg-blue-100 dark:bg-blue-900/40',    color: 'text-blue-500 dark:text-blue-400' },
    activity:     { icon: Activity, bg: 'bg-green-100 dark:bg-green-900/40',  color: 'text-green-500 dark:text-green-400' },
    stress:       { icon: Wind,     bg: 'bg-amber-100 dark:bg-amber-900/40',  color: 'text-amber-500 dark:text-amber-400' },
    mental_health:{ icon: Heart,    bg: 'bg-pink-100 dark:bg-pink-900/40',    color: 'text-pink-500 dark:text-pink-400' },
    nutrition:    { icon: Apple,    bg: 'bg-lime-100 dark:bg-lime-900/40',    color: 'text-lime-600 dark:text-lime-400' },
    focus:        { icon: Target,   bg: 'bg-purple-100 dark:bg-purple-900/40',color: 'text-purple-500 dark:text-purple-400' },
  }

  const priorityBorder: Record<string, string> = {
    high:   'border-l-4 border-red-400',
    medium: 'border-l-4 border-amber-400',
    low:    'border-l-4 border-mint-400',
  }

  if (isLoading) {
    return (
      <div className="space-y-4 page-enter
        pb-24 md:pb-8 max-w-4xl mx-auto">
        {/* Greeting skeleton */}
        <div className="pt-1 space-y-2">
          <div className="h-7 w-48 bg-gray-200
            dark:bg-gray-800 rounded-xl
            animate-pulse" />
          <div className="h-4 w-64 bg-gray-100
            dark:bg-gray-700 rounded-xl
            animate-pulse" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1
          md:grid-cols-2 gap-4">
          <div className="h-52 bg-gray-100
            dark:bg-gray-800 rounded-2xl
            animate-pulse" />
          <div className="h-52 bg-gray-100
            dark:bg-gray-800 rounded-2xl
            animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i}
              className="aspect-square bg-gray-100
                dark:bg-gray-800 rounded-2xl
                animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 page-enter
      pb-24 md:pb-8 max-w-4xl mx-auto">

      {/* ── GREETING ── */}
      <div className="pt-1">
        <h1 className="text-xl font-medium
          text-gray-900 dark:text-white">
          Good {timeOfDay}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500
          dark:text-gray-400 mt-0.5">
          {hasCheckedIn
            ? "You've checked in today."
            : <>
                Haven't checked in yet.{' '}
                <span
                  onClick={() =>
                    navigate('/checkin')}
                  className="text-mint-600
                    dark:text-mint-400
                    cursor-pointer
                    hover:underline font-medium">
                  Log now →
                </span>
              </>
          }
        </p>
      </div>

      {/* ── ROW 2: VITALS + RECOMMENDATIONS ── */}
      <div className="grid grid-cols-1
        md:grid-cols-2 gap-4">

        {/* VITALS CARD */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4
          flex flex-col min-h-[220px]">
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center
              gap-2">
              <div className="w-7 h-7 rounded-lg
                bg-red-100 dark:bg-red-900/30
                flex items-center justify-center">
                <Heart size={14}
                  className="text-red-500
                    dark:text-red-400" />
              </div>
              <span className="text-sm font-medium
                text-gray-800 dark:text-gray-100">
                Vitals
              </span>
            </div>
            <button
              onClick={() => navigate('/vitals')}
              className="text-xs text-mint-600
                dark:text-mint-400
                hover:text-mint-700
                flex items-center gap-0.5">
              Update
              <ChevronRight size={12} />
            </button>
          </div>

          {vitals ? (
            <div className="flex-1 grid
              grid-cols-3 grid-rows-2 gap-2">
              {[
                { icon: Heart, color: 'text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', val: vitals.heartRate ? `${vitals.heartRate}` : '—', unit: 'bpm' },
                { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', val: vitals.systolicBP && vitals.diastolicBP ? `${vitals.systolicBP}/${vitals.diastolicBP}` : '—', unit: 'mmHg' },
                { icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', val: vitals.spO2 ? `${vitals.spO2}%` : '—', unit: 'SpO2' },
                { icon: Activity, color: 'text-mint-500 dark:text-mint-400', bg: 'bg-mint-50 dark:bg-mint-900/20', val: vitals.steps ? vitals.steps.toLocaleString() : '—', unit: 'steps' },
                { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', val: vitals.caloriesBurned ? `${vitals.caloriesBurned}` : '—', unit: 'kcal' },
                { icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', val: vitals.bodyTemperature ? `${vitals.bodyTemperature}°` : '—', unit: 'temp' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i}
                    className={`flex flex-col
                      items-center justify-center
                      rounded-2xl ${item.bg}
                      border border-gray-100
                      dark:border-gray-700 p-2`}>
                    <Icon size={24}
                      className={item.color} />
                    <p className="text-sm
                      font-semibold text-gray-900
                      dark:text-white mt-1.5
                      leading-none">
                      {item.val}
                    </p>
                    <p className="text-xs
                      text-gray-400
                      dark:text-gray-500 mt-0.5">
                      {item.unit}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col
              items-center justify-center
              text-center py-4">
              <div className="w-12 h-12 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                flex items-center justify-center
                mx-auto mb-3">
                <Watch size={22}
                  className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500
                dark:text-gray-400 font-medium">
                No vitals recorded
              </p>
              <button
                onClick={() => navigate('/vitals')}
                className="text-xs font-medium
                  text-mint-600 dark:text-mint-400
                  bg-mint-50 dark:bg-mint-900/30
                  px-3 py-1.5 rounded-lg mt-3
                  hover:bg-mint-100 transition-colors">
                Track vitals →
              </button>
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS CARD */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4
          flex flex-col min-h-[220px]">
          <div className="flex items-center
            justify-between mb-3">
            <div>
              <p className="text-sm font-medium
                text-gray-800 dark:text-gray-100">
                For you today
              </p>
              <p className="text-xs text-gray-400
                dark:text-gray-500 mt-0.5">
                Based on your recent activity
              </p>
            </div>
            <button
              onClick={() => navigate('/checkin')}
              className="text-xs text-mint-600
                dark:text-mint-400
                hover:text-mint-700">
              Update →
            </button>
          </div>

          {recommendations.length === 0 ? (
            <div className="flex-1 flex flex-col
              items-center justify-center
              text-center">
              <p className="text-sm text-gray-400
                dark:text-gray-500">
                No recommendations yet
              </p>
              <button
                onClick={() => navigate('/checkin')}
                className="text-xs text-mint-600
                  dark:text-mint-400 mt-2
                  hover:underline">
                Complete a check-in →
              </button>
            </div>
          ) : (
            <div className="flex-1 space-y-2
              overflow-y-auto">
              {recommendations
                .slice(0, 4)
                .map((rec: any) => {
                  const s = recStyle[
                    rec.category
                  ] ?? recStyle.focus
                  const Icon = s.icon
                  return (
                    <div key={rec.id || rec._id}
                      className={`flex items-start
                        gap-3 p-3 rounded-xl
                        bg-gray-50 dark:bg-gray-800
                        ${priorityBorder[
                          rec.priority
                        ] ?? ''}`}>
                      <div className={`w-8 h-8
                        rounded-full flex
                        items-center justify-center
                        shrink-0 ${s.bg}`}>
                        <Icon size={14}
                          className={s.color} />
                      </div>
                      <div className="flex-1
                        min-w-0">
                        <p className="text-xs
                          font-medium text-gray-800
                          dark:text-gray-100
                          leading-snug">
                          {rec.title}
                        </p>
                        <p className="text-xs
                          text-gray-500
                          dark:text-gray-400
                          mt-0.5 line-clamp-2
                          leading-snug">
                          {rec.description}
                        </p>
                        {rec.actionLabel && (
                          <button
                            onClick={() => {
                              const a =
                                rec.actionLabel
                                  .toLowerCase()
                              if (a.includes(
                                'breath'))
                                navigate('/breathing')
                              else if (a.includes(
                                'journal'))
                                navigate('/journal')
                              else
                                navigate('/checkin')
                            }}
                            className="text-xs
                              text-mint-600
                              dark:text-mint-400
                              font-medium mt-1
                              hover:text-mint-700">
                            → {rec.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: 4 STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-3">

        {/* MOOD */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-3 aspect-square
          flex flex-col justify-between">
          <Smile size={16}
            className="text-mint-500
              dark:text-mint-400" />
          <div className="text-center">
            <p className="text-3xl leading-none">
              {todayMood == null ? '—'
               : todayMood === 1 ? '😔'
               : todayMood === 2 ? '😕'
               : todayMood === 3 ? '😐'
               : todayMood === 4 ? '🙂' : '😊'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Mood
            </p>
            <p className={`text-xs mt-0.5
              font-medium
              ${todayMood == null
                ? 'text-gray-400 dark:text-gray-500'
                : todayMood <= 2
                ? 'text-red-400'
                : todayMood === 3
                ? 'text-amber-500'
                : 'text-mint-500 dark:text-mint-400'
              }`}>
              {todayMood == null ? 'Not logged'
               : todayMood === 1 ? 'Very low'
               : todayMood === 2 ? 'Low'
               : todayMood === 3 ? 'Neutral'
               : todayMood === 4 ? 'Good' : 'Great'}
            </p>
          </div>
        </div>

        {/* SLEEP */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-3 aspect-square
          flex flex-col justify-between">
          <Moon size={16}
            className="text-indigo-400" />
          <div className="text-center">
            <p className="text-2xl font-light
              text-gray-800 dark:text-white
              leading-none">
              {lastSleep ?? '—'}
            </p>
            {lastSleep != null && (
              <p className="text-xs text-gray-400
                dark:text-gray-500 mt-0.5">
                hrs
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Sleep
            </p>
            <p className={`text-xs mt-0.5
              font-medium
              ${lastSleep == null
                ? 'text-gray-400 dark:text-gray-500'
                : lastSleep >= 7
                ? 'text-mint-500 dark:text-mint-400'
                : lastSleep >= 5
                ? 'text-amber-500'
                : 'text-red-400'
              }`}>
              {lastSleep == null ? 'No data'
               : lastSleep >= 7 ? 'Good rest'
               : lastSleep >= 5 ? 'Fair'
               : 'Low'}
            </p>
          </div>
        </div>

        {/* WATER */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-3 aspect-square
          flex flex-col justify-between">
          <Droplets size={16}
            className="text-blue-400" />
          <div className="text-center">
            <p className="text-2xl font-light
              text-gray-800 dark:text-white
              leading-none">
              {waterToday || '—'}
            </p>
            {waterToday > 0 && (
              <p className="text-xs text-gray-400
                dark:text-gray-500 mt-0.5">
                litres
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Water
            </p>
            <div className="w-full h-1
              bg-gray-100 dark:bg-gray-700
              rounded-full mt-1">
              <div
                className="h-full bg-blue-400
                  rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (waterToday / 2.5) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* STRESS */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-3 aspect-square
          flex flex-col justify-between">
          <Zap size={16}
            className="text-amber-400" />
          <div className="flex gap-1
            justify-center items-center">
            {stressToday != null
              ? [1,2,3,4,5].map(i => (
                  <div key={i}
                    className={`w-3 h-3
                      rounded-full
                      ${i <= stressToday
                        ? stressToday <= 2
                          ? 'bg-mint-400'
                          : stressToday === 3
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                        : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                  />
                ))
              : <p className="text-2xl font-light
                  text-gray-300 dark:text-gray-600">
                  —
                </p>
            }
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Stress
            </p>
            <p className={`text-xs mt-0.5
              font-medium
              ${stressToday == null
                ? 'text-gray-400 dark:text-gray-500'
                : stressToday <= 2
                ? 'text-mint-500 dark:text-mint-400'
                : stressToday === 3
                ? 'text-amber-500'
                : 'text-red-400'
              }`}>
              {stressToday == null ? 'Not logged'
               : stressToday <= 2 ? 'Low'
               : stressToday === 3 ? 'Moderate'
               : stressToday === 4 ? 'High'
               : 'Very high'}
            </p>
          </div>
        </div>
      </div>

      {/* ── ROW 4: GOALS + SLEEP CHART ── */}
      <div className="grid grid-cols-1
        md:grid-cols-2 gap-4">

        {/* HEALTH GOALS */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4
          flex flex-col min-h-[220px]">
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center
              gap-2">
              <div className="w-7 h-7 rounded-lg
                bg-mint-100 dark:bg-mint-900/30
                flex items-center justify-center">
                <Target size={14}
                  className="text-mint-600
                    dark:text-mint-400" />
              </div>
              <span className="text-sm font-medium
                text-gray-800 dark:text-gray-100">
                Health goals
              </span>
            </div>
            <button
              onClick={() =>
                setShowGoalModal(true)}
              className="w-7 h-7 rounded-full
                bg-mint-500 hover:bg-mint-600
                flex items-center justify-center
                transition-colors shadow-sm">
              <Plus size={14}
                className="text-white" />
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="flex-1 flex flex-col
              items-center justify-center
              text-center">
              <p className="text-sm text-gray-400
                dark:text-gray-500">
                No goals yet
              </p>
              <p className="text-xs text-gray-400
                dark:text-gray-500 mt-1">
                Tap + to add your first goal
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-2
              overflow-y-auto">
              {goals.slice(0, 4).map(goal => (
                <div key={goal.id}
                  className="flex items-center
                    gap-2.5 p-2 rounded-xl
                    bg-gray-50 dark:bg-gray-800
                    group">
                  <button
                    onClick={() =>
                      toggleGoal(goal.id)}
                    className={`w-5 h-5
                      rounded-full border-2
                      flex items-center
                      justify-center shrink-0
                      transition-colors
                      ${goal.completed
                        ? 'bg-mint-500 border-mint-500'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}>
                    {goal.completed && (
                      <Check size={10}
                        className="text-white" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs
                      font-medium leading-snug
                      ${goal.completed
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {goal.title}
                    </p>
                    {goal.target && (
                      <p className="text-xs
                        text-gray-400
                        dark:text-gray-500">
                        {goal.target}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      deleteGoal(goal.id)}
                    className="opacity-0
                      group-hover:opacity-100
                      text-gray-300
                      hover:text-red-400
                      transition-all">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SLEEP CHART */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4
          flex flex-col min-h-[220px]">
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center
              gap-2">
              <div className="w-7 h-7 rounded-lg
                bg-indigo-100
                dark:bg-indigo-900/30
                flex items-center justify-center">
                <Moon size={14}
                  className="text-indigo-500
                    dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium
                text-gray-800 dark:text-gray-100">
                This week
              </span>
            </div>
            <span className="text-xs text-gray-400
              dark:text-gray-500">
              avg {avgSleep} hrs
            </span>
          </div>

          <div className="flex-1">
            {chartData.length === 0 ? (
              <div className="h-full flex
                items-center justify-center">
                <p className="text-xs text-gray-400
                  dark:text-gray-500">
                  No sleep data yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%" height="100%">
                <BarChart data={chartData}
                  barSize={22}
                  margin={{
                    top: 4, right: 4,
                    bottom: 0, left: -20
                  }}>
                  <XAxis dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: isDark
                        ? '#9ca3af' : '#6b7280',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0,12]} hide />
                  <Tooltip
                    formatter={(v) =>
                      [`${v} hrs`, 'Sleep']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '11px',
                      backgroundColor: isDark
                        ? '#1f2937' : '#ffffff',
                      color: isDark
                        ? '#f9fafb' : '#111827',
                      boxShadow:
                        '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="hours"
                    radius={[4,4,0,0]}>
                    {chartData.map(
                      (entry: any, i: number) => (
                        <Cell key={i}
                          fill={
                            entry.hours >= 7
                              ? '#6366f1'
                              : entry.hours >= 5
                              ? '#f59e0b'
                              : '#ef4444'
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            {[
              { c: 'bg-indigo-400', l: 'Good' },
              { c: 'bg-amber-400',  l: 'Fair' },
              { c: 'bg-red-400',    l: 'Low' },
            ].map(item => (
              <div key={item.l}
                className="flex items-center
                  gap-1">
                <div className={`w-2 h-2
                  rounded-full ${item.c}`} />
                <span className="text-xs
                  text-gray-400 dark:text-gray-500">
                  {item.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowGoalModal(true)}
        className="fixed bottom-24 right-4
          md:bottom-8 md:right-8
          w-12 h-12 bg-mint-500
          hover:bg-mint-600 text-white
          rounded-full shadow-lg
          hover:shadow-xl
          flex items-center justify-center
          transition-all duration-200
          active:scale-95 z-40">
        <Plus size={20} />
      </button>

      {/* ── GOAL MODAL ── */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={addGoal}
      />

    </div>
  )
}
