import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSmartwatch }
  from '../hooks/useSmartwatch'
import { useBackend }
  from '../context/BackendContext'
import { useToastContext }
  from '../components/ui/Toast'
import PageHeader
  from '../components/ui/PageHeader'
import {
  Heart, Activity, Droplets, Zap,
  Thermometer, Bluetooth, BluetoothOff,
  RefreshCw, Save, AlertTriangle,
  CheckCircle2, Watch, Wifi, Battery,
  Signal, X, Plus, Info,
} from 'lucide-react'
import { MOCK_VITALS_READINGS }
  from '../mock/data'

// ── Vital status helper ─────────────────────────
function getVitalStatus(
  type: string,
  value: number | undefined | null
): 'normal' | 'warning' | 'alert' | 'unknown' {
  if (value == null) return 'unknown'
  switch (type) {
    case 'hr':
      return value < 50 || value > 120
        ? 'alert'
        : value < 60 || value > 100
        ? 'warning' : 'normal'
    case 'sys':
      return value >= 140 ? 'alert'
           : value >= 130 ? 'warning'
           : value < 90   ? 'warning'
           : 'normal'
    case 'spo2':
      return value < 90  ? 'alert'
           : value < 95  ? 'warning'
           : 'normal'
    case 'temp':
      return value > 38.5 ? 'alert'
           : value > 37.5 ? 'warning'
           : value < 36   ? 'warning'
           : 'normal'
    default:
      return 'normal'
  }
}

const statusDot: Record<string, string> = {
  normal:  'bg-mint-400',
  warning: 'bg-amber-400',
  alert:   'bg-red-500 animate-pulse',
  unknown: 'bg-gray-300 dark:bg-gray-600',
}

const statusColor: Record<string, string> = {
  normal:  'text-mint-600 dark:text-mint-400',
  warning: 'text-amber-600 dark:text-amber-400',
  alert:   'text-red-600 dark:text-red-400',
  unknown: 'text-gray-400 dark:text-gray-500',
}

// ── Suggestion generator ────────────────────────
function getSuggestion(
  type: string,
  status: string,
  value: number
): string {
  if (status === 'normal') return ''
  switch (type) {
    case 'hr':
      return value > 100
        ? 'Elevated HR. Try 4-7-8 breathing to calm down.'
        : 'Low HR. If dizzy or unwell, consult a doctor.'
    case 'sys':
      return value >= 140
        ? 'High BP. Sit down, avoid caffeine, see a doctor.'
        : 'Low BP. Stay hydrated and rise slowly.'
    case 'spo2':
      return value < 90
        ? 'Critical — seek medical attention now!'
        : 'Try slow deep breathing to raise oxygen.'
    case 'temp':
      return value > 38.5
        ? 'Fever detected. Rest, hydrate, see a doctor.'
        : 'Low temp. Warm up with clothing or warm drink.'
    default: return ''
  }
}

// ── Manual entry form ───────────────────────────
interface ManualVitals {
  heartRate:       string
  systolicBP:      string
  diastolicBP:     string
  spO2:            string
  steps:           string
  caloriesBurned:  string
  bodyTemperature: string
}

export default function VitalsPage() {
  const navigate   = useNavigate()
  const { isOnline } = useBackend()
  const { showToast } = useToastContext()
  const sw = useSmartwatch()

  const [tab, setTab] =
    useState<'watch' | 'manual'>('watch')
  const [isSaving, setIsSaving] =
    useState(false)
  const [savedHistory, setSavedHistory] =
    useState<any[]>([])
  const [showHistory, setShowHistory] =
    useState(false)
  const [manual, setManual] =
    useState<ManualVitals>({
      heartRate: '', systolicBP: '',
      diastolicBP: '', spO2: '',
      steps: '', caloriesBurned: '',
      bodyTemperature: '',
    })

  // Load saved history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        'healsync_vitals_history'
      )
      if (raw) setSavedHistory(JSON.parse(raw))
      else setSavedHistory(
        MOCK_VITALS_READINGS || []
      )
    } catch {
      setSavedHistory([])
    }
  }, [])

  // Save reading to storage
  const handleSave = async (
    vitalsToSave: any
  ) => {
    setIsSaving(true)
    try {
      // Save as latest
      const record = {
        ...vitalsToSave,
        id:        Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(
        'healsync_vitals_latest',
        JSON.stringify(record)
      )

      // Add to history
      const rawH = localStorage.getItem(
        'healsync_vitals_history'
      )
      const hist = rawH
        ? JSON.parse(rawH) : []
      const updated = [record, ...hist]
        .slice(0, 30)
      localStorage.setItem(
        'healsync_vitals_history',
        JSON.stringify(updated)
      )
      setSavedHistory(updated)

      // Save to backend if online
      if (isOnline) {
        try {
          const token = localStorage.getItem(
            'healsync_token'
          )
          await fetch('/api/vitals', {
            method:  'POST',
            headers: {
              'Content-Type':  'application/json',
              Authorization:
                `Bearer ${token}`,
            },
            body: JSON.stringify(vitalsToSave),
          })
        } catch {}
      }

      showToast('Vitals saved ✅', 'success')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualSave = () => {
    const hasAny = Object.values(manual)
      .some(v => v.trim() !== '')
    if (!hasAny) {
      showToast(
        'Enter at least one measurement',
        'error'
      )
      return
    }
    const payload = {
      heartRate:
        manual.heartRate
          ? Number(manual.heartRate) : null,
      systolicBP:
        manual.systolicBP
          ? Number(manual.systolicBP) : null,
      diastolicBP:
        manual.diastolicBP
          ? Number(manual.diastolicBP) : null,
      spO2:
        manual.spO2
          ? Number(manual.spO2) : null,
      steps:
        manual.steps
          ? Number(manual.steps) : null,
      caloriesBurned:
        manual.caloriesBurned
          ? Number(manual.caloriesBurned) : null,
      bodyTemperature:
        manual.bodyTemperature
          ? Number(manual.bodyTemperature) : null,
      source: 'manual',
    }
    handleSave(payload)
    setManual({
      heartRate: '', systolicBP: '',
      diastolicBP: '', spO2: '',
      steps: '', caloriesBurned: '',
      bodyTemperature: '',
    })
  }

  // ── Vital tiles data ──────────────────────────
  const v = sw.vitals

  const vitalTiles = [
    {
      key:   'hr',
      icon:  Heart,
      label: 'Heart Rate',
      value: v?.heartRate,
      unit:  'bpm',
      bg:    'bg-red-50 dark:bg-red-900/20',
      iconC: 'text-red-500',
      status: getVitalStatus(
        'hr', v?.heartRate
      ),
    },
    {
      key:   'bp',
      icon:  Activity,
      label: 'Blood Pressure',
      value: v?.systolicBP && v?.diastolicBP
        ? `${v.systolicBP}/${v.diastolicBP}`
        : null,
      unit:  'mmHg',
      bg:    'bg-purple-50 dark:bg-purple-900/20',
      iconC: 'text-purple-500',
      status: getVitalStatus(
        'sys', v?.systolicBP
      ),
    },
    {
      key:   'spo2',
      icon:  Droplets,
      label: 'SpO2',
      value: v?.spO2,
      unit:  '%',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
      iconC: 'text-blue-500',
      status: getVitalStatus(
        'spo2', v?.spO2
      ),
    },
    {
      key:   'steps',
      icon:  Activity,
      label: 'Steps',
      value: v?.steps
        ? v.steps.toLocaleString()
        : null,
      unit:  'today',
      bg: 'bg-mint-50 dark:bg-mint-900/20',
      iconC: 'text-mint-600 dark:text-mint-400',
      status: 'normal' as const,
    },
    {
      key:   'cal',
      icon:  Zap,
      label: 'Calories',
      value: v?.caloriesBurned,
      unit:  'kcal',
      bg:    'bg-amber-50 dark:bg-amber-900/20',
      iconC: 'text-amber-500',
      status: 'normal' as const,
    },
    {
      key:   'temp',
      icon:  Thermometer,
      label: 'Temperature',
      value: v?.bodyTemperature
        ? `${v.bodyTemperature}°`
        : null,
      unit:  'celsius',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconC: 'text-orange-500',
      status: getVitalStatus(
        'temp', v?.bodyTemperature
      ),
    },
  ]

  // Alerts from current vitals
  const alerts = [
    getSuggestion(
      'hr', vitalTiles[0].status,
      v?.heartRate ?? 0
    ),
    getSuggestion(
      'bp', vitalTiles[1].status,
      v?.systolicBP ?? 0
    ),
    getSuggestion(
      'spo2', vitalTiles[2].status,
      v?.spO2 ?? 0
    ),
    getSuggestion(
      'temp', vitalTiles[5].status,
      v?.bodyTemperature ?? 0
    ),
  ].filter(Boolean)

  return (
    <div className="space-y-4 page-enter
      pb-24 md:pb-8 max-w-2xl mx-auto">

      <PageHeader
        title="Vitals & Health Metrics"
        subtitle="Monitor your health in real time"
      />

      {/* ── TABS ── */}
      <div className="flex gap-2">
        {[
          { id: 'watch', icon: Watch,
            label: 'Smartwatch' },
          { id: 'manual', icon: Plus,
            label: 'Manual entry' },
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() =>
                setTab(t.id as any)}
              className={`flex items-center
                gap-2 px-4 py-2 rounded-xl
                text-sm font-medium
                transition-all border
                ${tab === t.id
                  ? 'bg-mint-500 text-white border-mint-500 shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-mint-300'
                }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ════════════════════════════════════
          SMARTWATCH TAB
      ════════════════════════════════════ */}
      {tab === 'watch' && (
        <div className="space-y-4">

          {/* CONNECTION CARD */}
          <div className="bg-white
            dark:bg-gray-900 rounded-2xl
            border border-gray-100
            dark:border-gray-800 p-5">

            {/* Status header */}
            <div className="flex items-center
              justify-between mb-4">
              <div className="flex items-center
                gap-3">
                <div className={`w-10 h-10
                  rounded-2xl flex items-center
                  justify-center
                  ${sw.isConnected
                    ? 'bg-mint-100 dark:bg-mint-900/30'
                    : sw.isConnecting
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                  {sw.isConnected ? (
                    <Bluetooth size={20}
                      className="text-mint-600
                        dark:text-mint-400" />
                  ) : sw.isConnecting ? (
                    <Bluetooth size={20}
                      className="text-blue-500
                        animate-pulse" />
                  ) : (
                    <BluetoothOff size={20}
                      className="text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm
                    font-medium text-gray-800
                    dark:text-gray-100">
                    {sw.status === 'idle'
                      ? 'Not connected'
                      : sw.status === 'scanning'
                      ? 'Scanning...'
                      : sw.status === 'connecting'
                      ? 'Connecting...'
                      : sw.status === 'connected'
                      ? sw.device?.name ??
                        'Connected'
                      : sw.status === 'simulating'
                      ? sw.device?.name ??
                        'Demo Watch'
                      : sw.status === 'error'
                      ? 'Connection failed'
                      : 'Disconnected'}
                  </p>
                  <div className="flex items-center
                    gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5
                      rounded-full
                      ${sw.isConnected
                        ? 'bg-mint-400'
                        : sw.isConnecting
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    <span className="text-xs
                      text-gray-500
                      dark:text-gray-400">
                      {sw.status === 'simulating'
                        ? 'Simulated · updates every 3s'
                        : sw.status === 'connected'
                        ? 'Live · Bluetooth LE'
                        : sw.status === 'scanning' ||
                          sw.status === 'connecting'
                        ? 'Please wait...'
                        : 'Tap connect below'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Device info badges */}
              {sw.device && (
                <div className="flex gap-2">
                  {sw.device.batteryLevel
                    != null && (
                    <div className="flex
                      items-center gap-1
                      text-xs text-gray-500
                      dark:text-gray-400
                      bg-gray-100
                      dark:bg-gray-800
                      px-2 py-1 rounded-lg">
                      <Battery size={12} />
                      {sw.device.batteryLevel}%
                    </div>
                  )}
                  {sw.status === 'simulating' && (
                    <span className="text-xs
                      bg-amber-100
                      dark:bg-amber-900/30
                      text-amber-700
                      dark:text-amber-400
                      px-2 py-1 rounded-lg">
                      Demo
                    </span>
                  )}
                  {sw.status === 'connected' && (
                    <span className="text-xs
                      bg-mint-100
                      dark:bg-mint-900/30
                      text-mint-700
                      dark:text-mint-400
                      px-2 py-1 rounded-lg">
                      Live
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error message */}
            {sw.error && (
              <div className="flex gap-2
                bg-red-50 dark:bg-red-900/20
                border border-red-200
                dark:border-red-800
                rounded-xl p-3 mb-4">
                <AlertTriangle size={15}
                  className="text-red-500
                    shrink-0 mt-0.5" />
                <p className="text-xs text-red-700
                  dark:text-red-400">
                  {sw.error}
                </p>
              </div>
            )}

            {/* Not connected — show buttons */}
            {!sw.isConnected &&
             !sw.isConnecting && (
              <div className="space-y-3">

                {/* Real Bluetooth button */}
                <button
                  onClick={sw.connectBluetooth}
                  disabled={!sw.isSupported}
                  className={`w-full flex items-center
                    justify-center gap-2.5
                    py-3 rounded-xl text-sm
                    font-medium transition-all
                    ${sw.isSupported
                      ? 'bg-mint-500 hover:bg-mint-600 text-white shadow-sm active:scale-[0.98]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Bluetooth size={18} />
                  {sw.isSupported
                    ? 'Connect real smartwatch'
                    : 'Bluetooth not supported'}
                </button>

                {!sw.isSupported && (
                  <div className="flex gap-2
                    bg-amber-50
                    dark:bg-amber-900/20
                    border border-amber-200
                    dark:border-amber-800
                    rounded-xl p-3">
                    <Info size={14}
                      className="text-amber-500
                        shrink-0 mt-0.5" />
                    <p className="text-xs
                      text-amber-700
                      dark:text-amber-400">
                      Web Bluetooth requires
                      Chrome on Android or
                      desktop. Not supported
                      on iOS Safari or Firefox.
                    </p>
                  </div>
                )}

                {/* Demo button */}
                <button
                  onClick={sw.connectSimulation}
                  className="w-full flex items-center
                    justify-center gap-2.5
                    py-3 rounded-xl text-sm
                    font-medium border
                    border-gray-200
                    dark:border-gray-700
                    bg-white dark:bg-gray-800
                    text-gray-700
                    dark:text-gray-300
                    hover:bg-gray-50
                    dark:hover:bg-gray-700
                    transition-all
                    active:scale-[0.98]">
                  <RefreshCw size={16} />
                  Use demo simulation
                </button>

                <p className="text-xs
                  text-center text-gray-400
                  dark:text-gray-500">
                  Compatible with most BLE
                  heart rate monitors,
                  fitness bands and
                  smartwatches
                </p>
              </div>
            )}

            {/* Connecting state */}
            {sw.isConnecting && (
              <div className="text-center py-6">
                <div className="relative
                  w-16 h-16 mx-auto mb-4">
                  <div className="absolute
                    inset-0 rounded-full border-4
                    border-mint-200
                    dark:border-mint-800" />
                  <div className="absolute
                    inset-0 rounded-full border-4
                    border-mint-500 border-t-transparent
                    animate-spin" />
                  <div className="absolute
                    inset-0 flex items-center
                    justify-center">
                    <Bluetooth size={20}
                      className="text-mint-500" />
                  </div>
                </div>
                <p className="text-sm font-medium
                  text-gray-800 dark:text-gray-100">
                  {sw.status === 'scanning'
                    ? 'Looking for devices...'
                    : 'Pairing...'}
                </p>
                <p className="text-xs text-gray-400
                  dark:text-gray-500 mt-1">
                  Select your device from
                  the browser popup
                </p>
              </div>
            )}

            {/* Connected — show disconnect */}
            {sw.isConnected && (
              <div className="flex gap-2 mt-2">
                {sw.status === 'simulating' && (
                  <button
                    onClick={
                      sw.connectSimulation
                    }
                    className="flex-1 flex
                      items-center justify-center
                      gap-1.5 py-2 rounded-xl
                      text-xs font-medium
                      bg-gray-100
                      dark:bg-gray-800
                      text-gray-600
                      dark:text-gray-300
                      hover:bg-gray-200
                      dark:hover:bg-gray-700
                      transition-colors">
                    <RefreshCw size={13} />
                    New reading
                  </button>
                )}
                <button
                  onClick={
                    sw.disconnectDevice
                  }
                  className="flex-1 flex
                    items-center justify-center
                    gap-1.5 py-2 rounded-xl
                    text-xs font-medium
                    bg-red-50
                    dark:bg-red-900/20
                    text-red-600
                    dark:text-red-400
                    hover:bg-red-100
                    dark:hover:bg-red-900/30
                    transition-colors border
                    border-red-200
                    dark:border-red-800">
                  <BluetoothOff size={13} />
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* LIVE VITALS GRID */}
          {sw.isConnected && (
            <div className="space-y-3">
              <div className="flex items-center
                justify-between">
                <h3 className="text-sm font-medium
                  text-gray-800 dark:text-gray-100">
                  Live readings
                </h3>
                {v?.timestamp && (
                  <span className="text-xs
                    text-gray-400
                    dark:text-gray-500">
                    {new Date(v.timestamp)
                      .toLocaleTimeString([], {
                        hour:   '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2
                gap-3">
                {vitalTiles.map(tile => {
                  const Icon = tile.icon
                  const st  = tile.status
                  return (
                    <div key={tile.key}
                      className={`
                        ${tile.bg} rounded-2xl
                        border border-gray-100
                        dark:border-gray-700
                        p-4 relative
                      `}>
                      {/* Status dot */}
                      <div className={`
                        absolute top-3 right-3
                        w-2 h-2 rounded-full
                        ${statusDot[st]}
                      `} />

                      <Icon size={22}
                        className={`${tile.iconC}
                          mb-3`} />

                      <p className="text-2xl
                        font-semibold
                        text-gray-900
                        dark:text-white
                        leading-none">
                        {tile.value ?? (
                          <span className="text-gray-300 dark:text-gray-600">
                            —
                          </span>
                        )}
                      </p>
                      <p className="text-xs
                        text-gray-400
                        dark:text-gray-500
                        mt-0.5">
                        {tile.unit}
                      </p>
                      <p className="text-xs
                        font-medium mt-1
                        capitalize
                        ${statusColor[st]}">
                        {st !== 'unknown'
                          ? st : ''}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Health alerts */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div key={i}
                      className="flex gap-2.5
                        bg-amber-50
                        dark:bg-amber-900/20
                        border border-amber-200
                        dark:border-amber-800
                        rounded-xl p-3">
                      <AlertTriangle size={15}
                        className="text-amber-500
                          shrink-0 mt-0.5" />
                      <p className="text-xs
                        text-amber-800
                        dark:text-amber-300">
                        {alert}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Save button */}
              <button
                onClick={() =>
                  handleSave({
                    ...sw.vitals,
                    heartRate:
                      sw.vitals?.heartRate,
                    systolicBP:
                      sw.vitals?.systolicBP,
                    diastolicBP:
                      sw.vitals?.diastolicBP,
                    spO2: sw.vitals?.spO2,
                    steps: sw.vitals?.steps,
                    caloriesBurned:
                      sw.vitals?.caloriesBurned,
                    bodyTemperature:
                      sw.vitals?.bodyTemperature,
                    source: sw.vitals?.source
                              ?? 'bluetooth',
                  })}
                disabled={isSaving || !sw.vitals}
                className="w-full btn-primary
                  h-11 text-sm flex items-center
                  justify-center gap-2
                  disabled:opacity-50">
                {isSaving ? (
                  <div className="w-4 h-4
                    border-2 border-white/30
                    border-t-white rounded-full
                    animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Save this reading
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          MANUAL ENTRY TAB
      ════════════════════════════════════ */}
      {tab === 'manual' && (
        <div className="bg-white dark:bg-gray-900
          rounded-2xl border border-gray-100
          dark:border-gray-800 p-5
          space-y-4">

          <p className="text-sm text-gray-500
            dark:text-gray-400">
            Enter any readings you have.
            You can leave fields blank.
          </p>

          <div className="grid grid-cols-1
            md:grid-cols-2 gap-4">

            {[
              {
                key:   'heartRate',
                label: 'Heart rate',
                unit:  'bpm',
                ph:    '72',
                icon:  Heart,
                color: 'text-red-400',
                min:   40, max: 200,
              },
              {
                key:   'systolicBP',
                label: 'Systolic BP',
                unit:  'mmHg',
                ph:    '120',
                icon:  Activity,
                color: 'text-purple-400',
                min:   70, max: 200,
              },
              {
                key:   'diastolicBP',
                label: 'Diastolic BP',
                unit:  'mmHg',
                ph:    '80',
                icon:  Activity,
                color: 'text-purple-400',
                min:   40, max: 130,
              },
              {
                key:   'spO2',
                label: 'Blood oxygen SpO2',
                unit:  '%',
                ph:    '98',
                icon:  Droplets,
                color: 'text-blue-400',
                min:   85, max: 100,
              },
              {
                key:   'steps',
                label: 'Steps today',
                unit:  'steps',
                ph:    '6500',
                icon:  Activity,
                color: 'text-mint-500',
                min:   0, max: 50000,
              },
              {
                key:   'caloriesBurned',
                label: 'Calories burned',
                unit:  'kcal',
                ph:    '250',
                icon:  Zap,
                color: 'text-amber-400',
                min:   0, max: 5000,
              },
              {
                key:   'bodyTemperature',
                label: 'Body temperature',
                unit:  '°C',
                ph:    '36.6',
                icon:  Thermometer,
                color: 'text-orange-400',
                min:   35, max: 42,
              },
            ].map(field => {
              const Icon = field.icon
              return (
                <div key={field.key}>
                  <label className="text-sm
                    font-medium text-gray-700
                    dark:text-gray-300 block
                    mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <Icon size={15}
                      className={`absolute
                        left-3 top-1/2
                        -translate-y-1/2
                        ${field.color}
                        pointer-events-none`}
                    />
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={
                        field.key ===
                        'bodyTemperature'
                          ? '0.1' : '1'
                      }
                      value={
                        manual[
                          field.key as
                          keyof ManualVitals
                        ]
                      }
                      onChange={e =>
                        setManual(m => ({
                          ...m,
                          [field.key]:
                            e.target.value,
                        }))}
                      placeholder={field.ph}
                      className="input pl-9
                        pr-12 w-full"
                    />
                    <span className="absolute
                      right-3 top-1/2
                      -translate-y-1/2 text-xs
                      text-gray-400
                      dark:text-gray-500
                      pointer-events-none">
                      {field.unit}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="btn-primary w-full
              h-11 text-sm flex items-center
              justify-center gap-2">
            {isSaving ? (
              <div className="w-4 h-4 border-2
                border-white/30 border-t-white
                rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save and get suggestions
          </button>
        </div>
      )}

      {/* ── HISTORY ── */}
      <div className="bg-white dark:bg-gray-900
        rounded-2xl border border-gray-100
        dark:border-gray-800">

        <button
          onClick={() =>
            setShowHistory(h => !h)}
          className="w-full flex items-center
            justify-between p-4 text-left">
          <span className="text-sm font-medium
            text-gray-800 dark:text-gray-100">
            Previous readings
          </span>
          <span className="text-xs text-gray-400
            dark:text-gray-500">
            {showHistory ? 'Hide' : 'Show'}
          </span>
        </button>

        {showHistory && (
          <div className="border-t border-gray-100
            dark:border-gray-800">
            {savedHistory.length === 0 ? (
              <p className="text-sm text-gray-400
                dark:text-gray-500 text-center
                py-8">
                No readings saved yet
              </p>
            ) : (
              <div className="divide-y
                divide-gray-100
                dark:divide-gray-800">
                {savedHistory
                  .slice(0, 10)
                  .map((r: any, i: number) => (
                  <div key={r.id || i}
                    className="p-3 flex items-start
                      justify-between gap-3">
                    <div>
                      <p className="text-xs
                        font-medium text-gray-700
                        dark:text-gray-300">
                        {new Date(
                          r.createdAt || r.recordedAt
                        ).toLocaleDateString(
                          'en-GB', {
                            day:    'numeric',
                            month:  'short',
                            hour:   '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                      <div className="flex
                        flex-wrap gap-1.5 mt-1">
                        {r.heartRate && (
                          <span className="text-xs
                            bg-red-50
                            dark:bg-red-900/20
                            text-red-600
                            dark:text-red-400
                            px-2 py-0.5
                            rounded-lg">
                            ❤️ {r.heartRate} bpm
                          </span>
                        )}
                        {r.systolicBP &&
                         r.diastolicBP && (
                          <span className="text-xs
                            bg-purple-50
                            dark:bg-purple-900/20
                            text-purple-600
                            dark:text-purple-400
                            px-2 py-0.5
                            rounded-lg">
                            💜 {r.systolicBP}/
                            {r.diastolicBP}
                          </span>
                        )}
                        {r.spO2 && (
                          <span className="text-xs
                            bg-blue-50
                            dark:bg-blue-900/20
                            text-blue-600
                            dark:text-blue-400
                            px-2 py-0.5
                            rounded-lg">
                            💧 {r.spO2}%
                          </span>
                        )}
                        {r.steps && (
                          <span className="text-xs
                            bg-mint-50
                            dark:bg-mint-900/20
                            text-mint-600
                            dark:text-mint-400
                            px-2 py-0.5
                            rounded-lg">
                            👟 {r.steps
                              .toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs
                      px-2 py-1 rounded-lg shrink-0
                      ${r.source === 'bluetooth'
                        ? 'bg-mint-50 dark:bg-mint-900/20 text-mint-600 dark:text-mint-400'
                        : r.source === 'simulated'
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                      {r.source || 'manual'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
