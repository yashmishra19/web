import { useState, useEffect } from 'react'
import { useToastContext } from '../components/ui/Toast'
import { PageHeader } from '../components/ui'

import {
  Pill, Plus, Clock, Check, X, Trash2,
  Bell, BellOff, ChevronDown, ChevronUp,
  AlertCircle, Calendar, Utensils
} from 'lucide-react'

// ── Data Structures ─────────────────────────────────────────

interface Medication {
  id:           string
  name:         string
  dose:         string
  unit:         'mg' | 'ml' | 'tablet' | 'capsule' | 'drops' | 'units'
  frequency:    'once' | 'twice' | 'thrice' | 'asneeded'
  times:        string[]
  withFood:     boolean
  notes:        string
  color:        string
  active:       boolean
  createdAt:    string
}

interface DoseLog {
  id:           string
  medicationId: string
  scheduledTime: string
  date:         string
  taken:        boolean
  takenAt?:     string
}

const STORAGE_KEY_MEDS = 'healsync_medications'
const STORAGE_KEY_LOGS = 'healsync_dose_logs'

const PILL_COLORS = [
  '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#6366f1',
  '#a855f7', '#ec4899', '#14b8a6',
  '#64748b',
]

const UNITS = ['mg', 'ml', 'tablet', 'capsule', 'drops', 'units'] as const

// ── Helper Functions ─────────────────────────────────────────

function getTodayLogs(meds: Medication[], logs: DoseLog[]) {
  const todayDate = new Date()
  const todayStr = todayDate.toISOString().split('T')[0]
  const nowMin = todayDate.getHours() * 60 + todayDate.getMinutes()

  const items: {
    med: Medication
    scheduledTime: string
    log: DoseLog | null
    isPast: boolean
    isNow: boolean
  }[] = []

  meds.filter(m => m.active).forEach(med => {
    med.times.forEach(time => {
      const [h, m] = time.split(':').map(Number)
      const timeMin = h * 60 + m
      const existingLog = logs.find(l =>
        l.medicationId === med.id &&
        l.date === todayStr &&
        l.scheduledTime === time
      )
      items.push({
        med,
        scheduledTime: time,
        log: existingLog || null,
        isPast: timeMin < nowMin,
        isNow: Math.abs(timeMin - nowMin) <= 30,
      })
    })
  })

  return items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
}

function getAdherenceRate(logs: DoseLog[], days = 7): number {
  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  const recent = logs.filter(l => new Date(l.date) >= since)
  if (recent.length === 0) return 100

  const taken = recent.filter(l => l.taken).length
  return Math.round((taken / recent.length) * 100)
}

// ── Component ─────────────────────────────────────────────

export default function MedicationPage() {
  const { showToast } = useToastContext()
  const [meds, setMeds] = useState<Medication[]>([])
  const [logs, setLogs] = useState<DoseLog[]>([])
  const [activeTab, setActiveTab] = useState<'today' | 'medications' | 'history'>('today')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedMed, setExpandedMed] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formDose, setFormDose] = useState('')
  const [formUnit, setFormUnit] = useState<Medication['unit']>('mg')
  const [formFrequency, setFormFrequency] = useState<Medication['frequency']>('once')
  const [formTimes, setFormTimes] = useState<string[]>(['08:00'])
  const [formWithFood, setFormWithFood] = useState(false)
  const [formNotes, setFormNotes] = useState('')
  const [formColor, setFormColor] = useState(PILL_COLORS[0])

  // Load from localStorage
  useEffect(() => {
    try {
      const savedMeds = localStorage.getItem(STORAGE_KEY_MEDS)
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS)
      if (savedMeds) setMeds(JSON.parse(savedMeds))
      if (savedLogs) setLogs(JSON.parse(savedLogs))
    } catch (e) {
      console.error('Failed to load medication data', e)
    }
  }, [])

  const saveMeds = (updated: Medication[]) => {
    setMeds(updated)
    localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(updated))
  }

  const saveLogs = (updated: DoseLog[]) => {
    setLogs(updated)
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated))
  }

  const handleFrequencyChange = (freq: Medication['frequency']) => {
    setFormFrequency(freq)
    if (freq === 'once') setFormTimes(['08:00'])
    else if (freq === 'twice') setFormTimes(['08:00', '20:00'])
    else if (freq === 'thrice') setFormTimes(['08:00', '14:00', '20:00'])
    else if (freq === 'asneeded') setFormTimes([])
  }

  const addMedication = () => {
    if (!formName.trim() || !formDose.trim()) {
      showToast('Please fill in name and dose', 'error')
      return
    }

    const newMed: Medication = {
      id: Date.now().toString(),
      name: formName.trim(),
      dose: formDose.trim(),
      unit: formUnit,
      frequency: formFrequency,
      times: formTimes,
      withFood: formWithFood,
      notes: formNotes.trim(),
      color: formColor,
      active: true,
      createdAt: new Date().toISOString()
    }

    saveMeds([newMed, ...meds])
    showToast('Medication added 💊', 'success')
    setShowAddForm(false)
    resetForm()
  }

  const resetForm = () => {
    setFormName('')
    setFormDose('')
    setFormUnit('mg')
    setFormFrequency('once')
    setFormTimes(['08:00'])
    setFormWithFood(false)
    setFormNotes('')
    setFormColor(PILL_COLORS[0])
  }

  const markTaken = (med: Medication, scheduledTime: string, taken: boolean) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const updated = [...logs]
    const idx = updated.findIndex(l =>
      l.medicationId === med.id &&
      l.date === todayStr &&
      l.scheduledTime === scheduledTime
    )

    if (idx >= 0) {
      updated[idx] = {
        ...updated[idx],
        taken,
        takenAt: taken ? new Date().toISOString() : undefined
      }
    } else {
      updated.push({
        id: Date.now().toString(),
        medicationId: med.id,
        scheduledTime,
        date: todayStr,
        taken,
        takenAt: taken ? new Date().toISOString() : undefined
      })
    }

    saveLogs(updated)
    if (taken) {
      showToast(`✅ ${med.name} marked as taken`, 'success')
    }
  }

  const deleteMedication = (id: string) => {
    if (confirm('Remove this medication?')) {
      saveMeds(meds.filter(m => m.id !== id))
      showToast('Medication removed', 'info')
    }
  }

  const toggleActive = (id: string) => {
    saveMeds(meds.map(m => m.id === id ? { ...m, active: !m.active } : m))
  }

  const todaySchedule = getTodayLogs(meds, logs)
  const adherenceRate = getAdherenceRate(logs, 7)
  const takenToday = todaySchedule.filter(i => i.log?.taken).length
  const totalToday = todaySchedule.length
  const missedToday = todaySchedule.filter(i => !i.log?.taken && i.isPast).length

  return (
    <div className="space-y-4 page-enter pb-24 md:pb-8 max-w-2xl mx-auto">
      <PageHeader
        title="Medications"
        subtitle="Track doses and never miss a medication"
      />

      {/* ── STATS ROW ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Progress */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-2xl font-light text-gray-900 dark:text-white">
            {takenToday}/{totalToday}
          </p>
          <p className="text-xs text-gray-400 mt-1">Taken today</p>
          <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-mint-400 transition-all duration-500"
              style={{ width: `${totalToday ? (takenToday/totalToday)*100 : 0}%` }}
            />
          </div>
        </div>

        {/* Missed */}
        <div className={`rounded-2xl p-4 border transition-colors ${missedToday > 0 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' 
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
          <p className={`text-2xl font-light ${missedToday > 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {missedToday}
          </p>
          <p className="text-xs text-gray-400 mt-1">Missed today</p>
        </div>

        {/* Adherence */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <p className={`text-2xl font-light ${
            adherenceRate >= 80 ? 'text-mint-500' : 
            adherenceRate >= 60 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {adherenceRate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">7-day adherence</p>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <div className="flex gap-4">
          {(['today', 'medications', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors capitalize ${
                activeTab === tab 
                  ? 'text-mint-600 dark:text-mint-400 border-b-2 border-mint-500 pb-2' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {tab === 'medications' ? 'My Medications' : tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-8 h-8 rounded-full bg-mint-500 text-white flex items-center justify-center hover:bg-mint-600 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────── */}
      <div className="space-y-3">
        {activeTab === 'today' && (
          <>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Pill className="mx-auto text-gray-200 dark:text-gray-800 mb-3" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No medications scheduled today.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="text-mint-600 text-sm mt-2 font-medium"
                >
                  Add a medication to get started
                </button>
              </div>
            ) : (
              todaySchedule.map((item) => (
                <div 
                  key={`${item.med.id}-${item.scheduledTime}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    item.log?.taken
                      ? 'bg-mint-50 dark:bg-mint-900/20 border-mint-200 dark:border-mint-800'
                      : item.isPast
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: item.med.color }}
                  >
                    <span className="text-xl">💊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {item.med.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 overflow-hidden">
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {item.med.dose} {item.med.unit}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5 shrink-0">
                        <Clock size={10} />
                        {item.scheduledTime}
                      </span>
                      {item.med.withFood && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-0.5">
                            <Utensils size={10} /> with food
                          </span>
                        </>
                      )}
                    </div>
                    {item.log?.taken && item.log.takenAt && (
                      <p className="text-xs text-mint-500 dark:text-mint-400 mt-0.5 font-medium">
                        ✓ Taken at {new Date(item.log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {item.isPast && !item.log?.taken && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 font-medium flex items-center gap-1">
                        <AlertCircle size={10} /> Missed dose
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => markTaken(item.med, item.scheduledTime, !item.log?.taken)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                      item.log?.taken
                        ? 'bg-mint-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-mint-100 hover:text-mint-600 dark:hover:bg-mint-900/30 dark:hover:text-mint-400'
                    }`}
                  >
                    <Check size={18} />
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'medications' && (
          <>
            {meds.length === 0 ? (
               <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No medications added.</p>
               </div>
            ) : (
              meds.map(med => (
                <div key={med.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: med.color }}
                      >
                        <span className="text-xl">💊</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {med.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {med.dose} {med.unit} · {med.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                         med.active ? 'bg-mint-100 text-mint-700' : 'bg-gray-100 text-gray-500'
                       }`}>
                         {med.active ? 'Active' : 'Paused'}
                       </span>
                       {expandedMed === med.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedMed === med.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 dark:border-gray-800 space-y-4">
                      {med.notes && (
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Notes</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{med.notes}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Schedule</p>
                        <div className="flex flex-wrap gap-2">
                          {med.times.map(t => (
                            <span key={t} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                              {t}
                            </span>
                          ))}
                          {med.times.length === 0 && <span className="text-xs italic text-gray-400">As needed</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => toggleActive(med.id)}
                          className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-medium border ${
                            med.active 
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50' 
                              : 'border-mint-200 text-mint-600 hover:bg-mint-50'
                          }`}
                        >
                          {med.active ? <BellOff size={14} /> : <Bell size={14} />}
                          {med.active ? 'Pause Reminders' : 'Resume Reminders'}
                        </button>
                        <button
                          onClick={() => deleteMedication(med.id)}
                          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} className="text-mint-500" />
              <h3 className="text-sm font-medium">Last 7 Days Activity</h3>
            </div>
            
            <div className="space-y-6">
              {[0, 1, 2, 3, 4, 5, 6].map(offset => {
                const date = new Date()
                date.setDate(date.getDate() - offset)
                const dateStr = date.toISOString().split('T')[0]
                const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'long' })
                const label = `${dayName}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                
                const dailyLogs = logs.filter(l => l.date === dateStr)
                const taken = dailyLogs.filter(l => l.taken).length
                const total = meds.reduce((acc, med) => acc + (med.active ? med.times.length : 0), 0) // Approximation
                const rate = total > 0 ? Math.round((taken / total) * 100) : 100

                if (total === 0 && dailyLogs.length === 0) return null

                return (
                  <div key={dateStr} className="relative pl-4 border-l border-gray-100 dark:border-gray-800 ml-1">
                    <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-mint-500" />
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                         rate >= 80 ? 'bg-mint-100 text-mint-700' : 
                         rate >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {rate}%
                       </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {meds.filter(m => m.active).map(med => (
                        med.times.map(t => {
                          const log = logs.find(l => l.medicationId === med.id && l.date === dateStr && l.scheduledTime === t)
                          return (
                            <div 
                              key={`${dateStr}-${med.id}-${t}`}
                              className={`w-2.5 h-2.5 rounded-sm shadow-sm ${log?.taken ? 'bg-mint-400' : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
                              title={`${med.name} at ${t}`}
                            />
                          )
                        })
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── ADD MEDICATION SLIDE-UP FORM ────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-950 w-full max-w-xl rounded-t-[32px] p-6 slide-up overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Add Medication</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Metformin, Aspirin"
                  className="input w-full"
                />
              </div>

              {/* Dose & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Dose</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formDose}
                    onChange={e => setFormDose(e.target.value)}
                    placeholder="e.g. 500"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Unit</label>
                  <select 
                    className="input w-full"
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value as Medication['unit'])}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Frequency</label>
                <div className="flex flex-wrap gap-2">
                  {(['once', 'twice', 'thrice', 'asneeded'] as const).map(freq => (
                    <button
                      key={freq}
                      onClick={() => handleFrequencyChange(freq)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        formFrequency === freq 
                          ? 'bg-mint-500 border-mint-500 text-white shadow-md' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-mint-300'
                      }`}
                    >
                      {freq === 'asneeded' ? 'As needed' : freq.charAt(0).toUpperCase() + freq.slice(1) + ' daily'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Times */}
              {formFrequency !== 'asneeded' && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Times</label>
                  <div className="flex flex-wrap gap-3">
                    {formTimes.map((time, idx) => (
                      <input
                        key={idx}
                        type="time"
                        value={time}
                        onChange={e => {
                          const newTimes = [...formTimes]
                          newTimes[idx] = e.target.value
                          setFormTimes(newTimes)
                        }}
                        className="input text-sm py-2 px-3 w-32"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Food & Notes */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="withFood"
                  checked={formWithFood}
                  onChange={e => setFormWithFood(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-mint-500 focus:ring-mint-500"
                />
                <label htmlFor="withFood" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Take with food
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Notes (Optional)</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Special instructions..."
                  className="input w-full min-h-[80px] py-2"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Pill Color</label>
                <div className="flex flex-wrap gap-3">
                  {PILL_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${formColor === color ? 'scale-125 ring-2 ring-offset-2 ring-mint-500' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={addMedication}
                className="btn-primary w-full h-12 text-sm mt-4 font-bold shadow-lg shadow-mint-500/20"
              >
                Save Medication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
