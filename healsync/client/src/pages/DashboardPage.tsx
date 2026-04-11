import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../context/AuthContext'
import { useBackend } from '../context/BackendContext'
import { useTheme } from '../context/ThemeContext'
import { useGoals } from '../context/GoalsContext'
import type { HealthGoal } from '../context/GoalsContext'
import { vitalsApi } from '../api'
import GoalModal from '../components/GoalModal'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import {
  Heart,
  Droplets,
  Moon,
  Smile,
  Zap,
  Activity,
  Target,
  Plus,
  Wind,
  Apple,
  Thermometer,
  ChevronRight,
  Watch,
} from 'lucide-react'
import type {
  VitalsReading,
} from '../../../shared/types'
import { MOCK_VITALS_READINGS } from '../mock/data'

export default function DashboardPage() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const { isOnline } = useBackend()
  const { resolvedTheme } = useTheme()
  const isDark     = resolvedTheme === 'dark'
  const { data, isLoading } = useDashboard()
  const { goals, addGoal, toggleGoal, deleteGoal } = useGoals()

  const [latestVitals, setLatestVitals] =
    useState<VitalsReading | null>(null)
  const [showGoalModal, setShowGoalModal] =
    useState(false)

  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? 'Morning' :
    hour < 17 ? 'Afternoon' : 'Evening'

  useEffect(() => {
    const load = async () => {
      try {
        if (isOnline) {
          const v = await vitalsApi.getLatest()
          setLatestVitals(v)
        } else {
          setLatestVitals(MOCK_VITALS_READINGS[0] || null)
        }
      } catch {
        setLatestVitals(MOCK_VITALS_READINGS[0] || null)
      }
    }
    load()
  }, [isOnline])

  const hasCheckedInToday =
    data?.hasCheckedInToday ?? false
  const recommendations =
    data?.recommendations ?? []
  const sleepLast7Days =
    data?.sleepLast7Days ?? []
  const todayMood    = data?.todayMood ?? null
  const waterToday   = data?.waterToday ?? 0
  const stressToday  = data?.stressToday ?? null
  const lastSleep    = sleepLast7Days[sleepLast7Days.length - 1] ?? null

  const sleepData = sleepLast7Days.map((hours, i) => ({
    day: ['M','T','W','T','F','S','S'][i] ?? '',
    hours,
  }))

  const avgSleep = sleepLast7Days.length > 0
    ? (sleepLast7Days.reduce((a,b) => a+b, 0) /
       sleepLast7Days.length).toFixed(1)
    : '—'



  // Category icon + color map for recommendations
  const recStyle: Record<string, {
    icon: any
    bg: string
    iconColor: string
  }> = {
    sleep: {
      icon: Moon,
      bg: 'bg-indigo-100 dark:bg-indigo-900/40',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
    },
    hydration: {
      icon: Droplets,
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-500 dark:text-blue-400',
    },
    activity: {
      icon: Activity,
      bg: 'bg-green-100 dark:bg-green-900/40',
      iconColor: 'text-green-500 dark:text-green-400',
    },
    stress: {
      icon: Wind,
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      iconColor: 'text-amber-500 dark:text-amber-400',
    },
    mental_health: {
      icon: Heart,
      bg: 'bg-pink-100 dark:bg-pink-900/40',
      iconColor: 'text-pink-500 dark:text-pink-400',
    },
    nutrition: {
      icon: Apple,
      bg: 'bg-lime-100 dark:bg-lime-900/40',
      iconColor: 'text-lime-600 dark:text-lime-400',
    },
    focus: {
      icon: Target,
      bg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-500 dark:text-purple-400',
    },
  }

  const priorityBorder: Record<string, string> = {
    high:   'border-l-4 border-red-400',
    medium: 'border-l-4 border-amber-400',
    low:    'border-l-4 border-mint-400',
  }

  return (
    <div className="space-y-4 page-enter
      pb-24 md:pb-8 max-w-4xl mx-auto">

      {/* ── ROW 1: GREETING ── */}
      <div className="pt-1">
        <h1 className="text-xl font-medium
          text-gray-900 dark:text-white">
          Good {timeOfDay},{' '}
          {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500
          dark:text-gray-400 mt-0.5">
          {hasCheckedInToday
            ? "You've checked in today. Here's your overview."
            : <>
                Haven't checked in yet.{' '}
                <span
                  onClick={() => navigate('/checkin')}
                  className="text-mint-600
                    dark:text-mint-400 cursor-pointer
                    hover:underline font-medium"
                >
                  Log now →
                </span>
              </>
          }
        </p>
      </div>

      {/* ── ROW 2: VITALS + RECOMMENDATIONS ── */}
      {/* Equal width, equal height, side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2
        gap-4 items-stretch">

        {/* VITALS CARD */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4 flex flex-col">

          {/* Card header */}
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center gap-2">
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
                dark:hover:text-mint-300
                flex items-center gap-0.5
                transition-colors">
              Update
              <ChevronRight size={12} />
            </button>
          </div>

          {/* Vitals content */}
          {latestVitals ? (
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 mt-1">

              {/* Heart Rate */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-red-50 dark:bg-red-900/20
                border border-red-100 dark:border-red-800 p-3">
                <Heart size={28} className="text-red-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.heartRate ?? '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  bpm
                </p>
              </div>

              {/* Blood Pressure */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-purple-50 dark:bg-purple-900/20
                border border-purple-100 dark:border-purple-800 p-3">
                <Activity size={28} className="text-purple-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.systolicBP && latestVitals.diastolicBP
                    ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`
                    : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  mmHg
                </p>
              </div>

              {/* SpO2 */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-blue-50 dark:bg-blue-900/20
                border border-blue-100 dark:border-blue-800 p-3">
                <Droplets size={28} className="text-blue-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.spO2 ? `${latestVitals.spO2}%` : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  oxygen
                </p>
              </div>

              {/* Steps */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-mint-50 dark:bg-mint-900/20
                border border-mint-100 dark:border-mint-800 p-3">
                <Activity size={28} className="text-mint-500 dark:text-mint-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.steps
                    ? latestVitals.steps.toLocaleString()
                    : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  steps
                </p>
              </div>

              {/* Calories */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-amber-50 dark:bg-amber-900/20
                border border-amber-100 dark:border-amber-800 p-3">
                <Zap size={28} className="text-amber-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.caloriesBurned ?? '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  kcal
                </p>
              </div>

              {/* Temperature */}
              <div className="flex flex-col items-center justify-center
                rounded-2xl bg-orange-50 dark:bg-orange-900/20
                border border-orange-100 dark:border-orange-800 p-3">
                <Thermometer size={28} className="text-orange-400" />
                <p className="text-lg font-semibold text-gray-900
                  dark:text-white leading-none mt-2">
                  {latestVitals.bodyTemperature
                    ? `${latestVitals.bodyTemperature}°`
                    : '—'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  temp
                </p>
              </div>

            </div>

          ) : (
            /* No vitals CTA */
            <div className="flex-1 flex flex-col
              items-center justify-center text-center
              py-4">
              <div className="w-12 h-12 rounded-2xl
                bg-gray-100 dark:bg-gray-800
                flex items-center justify-center
                mx-auto mb-3">
                <Watch size={22}
                  className="text-gray-400
                    dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500
                dark:text-gray-400 font-medium">
                No vitals recorded
              </p>
              <p className="text-xs text-gray-400
                dark:text-gray-500 mt-1 mb-3">
                Connect a smartwatch or enter manually
              </p>
              <button
                onClick={() => navigate('/vitals')}
                className="text-xs font-medium
                  text-mint-600 dark:text-mint-400
                  bg-mint-50 dark:bg-mint-900/30
                  px-3 py-1.5 rounded-lg
                  hover:bg-mint-100
                  dark:hover:bg-mint-900/50
                  transition-colors">
                Track vitals →
              </button>
            </div>
          )}
        </div>

        {/* RECOMMENDATIONS CARD */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4 flex flex-col">

          {/* Card header */}
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
                hover:text-mint-700
                dark:hover:text-mint-300
                transition-colors">
              Update →
            </button>
          </div>

          {/* Recommendations list */}
          {isLoading ? (
            <div className="flex-1 space-y-2">
              {[1,2,3].map(i => (
                <div key={i}
                  className="h-14 bg-gray-100
                    dark:bg-gray-800 rounded-xl
                    animate-pulse" />
              ))}
            </div>

          ) : recommendations.length === 0 ? (
            <div className="flex-1 flex flex-col
              items-center justify-center text-center
              py-4">
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
              {recommendations.slice(0,4).map(rec => {
                const style = recStyle[rec.category]
                  ?? recStyle.focus
                const Icon = style.icon
                return (
                  <div
                    key={rec.id}
                    className={`
                      flex items-start gap-3 p-3
                      rounded-xl bg-gray-50
                      dark:bg-gray-800
                      ${priorityBorder[rec.priority]
                        ?? ''}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full
                      flex items-center justify-center
                      shrink-0 ${style.bg}
                    `}>
                      <Icon size={14}
                        className={style.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium
                        text-gray-800 dark:text-gray-100
                        leading-snug">
                        {rec.title}
                      </p>
                      <p className="text-xs
                        text-gray-500 dark:text-gray-400
                        mt-0.5 leading-snug line-clamp-2">
                        {rec.description}
                      </p>
                      {rec.actionLabel && (
                        <button
                          onClick={() => {
                            if (rec.actionLabel
                              ?.toLowerCase()
                              .includes('breath'))
                              navigate('/breathing')
                            else if (rec.actionLabel
                              ?.toLowerCase()
                              .includes('journal'))
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

      {/* ── ROW 3: 4 SMALL SQUARE CARDS ── */}
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
            <p className="text-3xl leading-none mb-1">
              {todayMood === null ? '—' :
               todayMood === 1 ? '😔' :
               todayMood === 2 ? '😕' :
               todayMood === 3 ? '😐' :
               todayMood === 4 ? '🙂' : '😊'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Mood
            </p>
            <p className={`text-xs mt-0.5 font-medium
              ${todayMood === null
                ? 'text-gray-400 dark:text-gray-500'
                : todayMood <= 2
                ? 'text-red-400'
                : todayMood === 3
                ? 'text-amber-500'
                : 'text-mint-500 dark:text-mint-400'
              }`}>
              {todayMood === null ? 'Not logged' :
               todayMood === 1 ? 'Very low' :
               todayMood === 2 ? 'Low' :
               todayMood === 3 ? 'Neutral' :
               todayMood === 4 ? 'Good' : 'Great'}
            </p>
          </div>
        </div>

        {/* SLEEP */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-3 aspect-square
          flex flex-col justify-between">
          <Moon size={16}
            className="text-indigo-400
              dark:text-indigo-400" />
          <div className="text-center">
            <p className="text-2xl font-light
              text-gray-800 dark:text-white
              leading-none">
              {lastSleep ?? '—'}
            </p>
            {lastSleep && (
              <p className="text-xs
                text-gray-400 dark:text-gray-500
                mt-0.5">
                hrs
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Sleep
            </p>
            <p className={`text-xs mt-0.5 font-medium
              ${lastSleep === null
                ? 'text-gray-400 dark:text-gray-500'
                : lastSleep >= 7
                ? 'text-mint-500 dark:text-mint-400'
                : lastSleep >= 5
                ? 'text-amber-500'
                : 'text-red-400'
              }`}>
              {lastSleep === null ? 'No data' :
               lastSleep >= 7 ? 'Good rest' :
               lastSleep >= 5 ? 'Fair' :
               'Needs work'}
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
              <p className="text-xs
                text-gray-400 dark:text-gray-500
                mt-0.5">
                litres
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium
              text-gray-500 dark:text-gray-400">
              Water
            </p>
            {/* Mini progress bar */}
            <div className="w-full h-1 bg-gray-100
              dark:bg-gray-700 rounded-full mt-1">
              <div
                className="h-full bg-blue-400
                  rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (waterToday / 2.5) * 100, 100
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
          <div className="flex gap-1 justify-center
            items-center">
            {stressToday !== null
              ? [1,2,3,4,5].map(i => (
                  <div key={i}
                    className={`w-3 h-3 rounded-full
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
            <p className={`text-xs mt-0.5 font-medium
              ${stressToday === null
                ? 'text-gray-400 dark:text-gray-500'
                : stressToday <= 2
                ? 'text-mint-500 dark:text-mint-400'
                : stressToday === 3
                ? 'text-amber-500'
                : 'text-red-400'
              }`}>
              {stressToday === null ? 'Not logged' :
               stressToday <= 2 ? 'Low' :
               stressToday === 3 ? 'Moderate' :
               stressToday === 4 ? 'High' :
               'Very high'}
            </p>
          </div>
        </div>

      </div>

      {/* ── ROW 4: HEALTH GOALS + SLEEP CHART ── */}
      {/* Same height, same width, side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2
        gap-4 items-stretch">

        {/* HEALTH GOALS */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4 flex flex-col
          min-h-[220px]">

          {/* Header */}
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center gap-2">
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
              onClick={() => setShowGoalModal(true)}
              className="w-7 h-7 rounded-full
                bg-mint-500 hover:bg-mint-600
                flex items-center justify-center
                transition-colors shadow-sm">
              <Plus size={14} className="text-white" />
            </button>
          </div>

          {/* Goals list */}
          {goals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <Target size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">No goals yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tap + to add your first health goal</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto">
              {goals.slice(0, 5).map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      goal.completed
                        ? 'bg-mint-500 border-mint-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-mint-400'
                    }`}
                  >
                    {goal.completed && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5l2 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Goal info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug truncate ${
                      goal.completed
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {goal.title}
                    </p>
                    {goal.target && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{goal.target}</p>
                    )}
                  </div>

                  {/* Delete button — visible on hover */}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-500 transition-all shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {goals.length > 5 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
                  +{goals.length - 5} more goals
                </p>
              )}
            </div>
          )}
        </div>

        {/* SLEEP THIS WEEK */}
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-4 flex flex-col
          min-h-[220px]">

          {/* Header */}
          <div className="flex items-center
            justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg
                bg-indigo-100 dark:bg-indigo-900/30
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
            <span className="text-xs
              text-gray-400 dark:text-gray-500">
              avg {avgSleep} hrs
            </span>
          </div>

          {/* Chart fills remaining space */}
          <div className="flex-1">
            {isLoading ? (
              <div className="h-full bg-gray-100
                dark:bg-gray-800 rounded-xl
                animate-pulse" />
            ) : sleepLast7Days.length === 0 ? (
              <div className="h-full flex items-center
                justify-center">
                <p className="text-xs
                  text-gray-400 dark:text-gray-500">
                  No sleep data yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%" height="100%">
                <BarChart
                  data={sleepData}
                  barSize={22}
                  margin={{
                    top: 4,
                    right: 4,
                    bottom: 0,
                    left: -20,
                  }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? '#9ca3af' : '#6b7280',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 12]}
                    hide
                  />
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
                  <Bar
                    dataKey="hours"
                    radius={[4, 4, 0, 0]}
                  >
                    {sleepData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.hours >= 7
                            ? '#6366f1'
                            : entry.hours >= 5
                            ? '#f59e0b'
                            : '#ef4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-2">
            {[
              { color: 'bg-indigo-400', label: 'Good' },
              { color: 'bg-amber-400', label: 'Fair' },
              { color: 'bg-red-400', label: 'Low' },
            ].map(item => (
              <div key={item.label}
                className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full
                  ${item.color}`} />
                <span className="text-xs
                  text-gray-400 dark:text-gray-500">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── + FAB BUTTON ── */}
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
          active:scale-95 z-40"
        aria-label="Add health goal"
      >
        <Plus size={20} />
      </button>

      {/* ── GOAL MODAL ── */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={(goal: HealthGoal) => {
          addGoal(goal)
          setShowGoalModal(false)
        }}
      />

    </div>
  )
}
