import { useState } from 'react'
import { X, Target, Check, Clock } from 'lucide-react'
import type { HealthGoal } from '../context/GoalsContext'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goal: HealthGoal) => void
}

const TEMPLATES = [
  { title: 'Walk 8000 steps daily',    category: 'fitness'   as const, target: '8000 steps/day' },
  { title: 'Drink 2.5L water daily',   category: 'nutrition' as const, target: '2.5L/day' },
  { title: 'Sleep 8 hours nightly',    category: 'sleep'     as const, target: '8 hrs/night' },
  { title: 'Meditate 10 minutes',      category: 'mental'    as const, target: '10 min/day' },
  { title: 'Exercise 3 times a week',  category: 'fitness'   as const, target: '3x/week' },
  { title: 'Reduce stress to level 2', category: 'mental'    as const, target: 'Stress ≤ 2' },
  { title: 'Log vitals daily',         category: 'vitals'    as const, target: 'Daily' },
  { title: 'No screens after 10pm',    category: 'sleep'     as const, target: 'Daily' },
]

const CATEGORIES = [
  { value: 'fitness',   label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'mental',    label: 'Mental' },
  { value: 'sleep',     label: 'Sleep' },
  { value: 'vitals',    label: 'Vitals' },
  { value: 'custom',    label: 'Custom' },
]

export default function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [title,    setTitle]    = useState('')
  const [category, setCategory] = useState<HealthGoal['category']>('fitness')
  const [target,   setTarget]   = useState('')
  const [deadline, setDeadline] = useState('')
  const [error,    setError]    = useState('')

  if (!isOpen) return null

  const handleTemplateClick = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title)
    setCategory(t.category)
    setTarget(t.target)
    setError('')
  }

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a goal title')
      return
    }

    const newGoal: HealthGoal = {
      id:        Date.now().toString(),
      title:     title.trim(),
      category,
      target:    target.trim(),
      deadline:  deadline || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    onSave(newGoal)

    // Reset form
    setTitle('')
    setCategory('fitness')
    setTarget('')
    setDeadline('')
    setError('')
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end md:items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center">
              <Target size={16} className="text-mint-600 dark:text-mint-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Add health goal</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Quick templates */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Quick add
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.title}
                  onClick={() => handleTemplateClick(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    title === t.title
                      ? 'bg-mint-50 dark:bg-mint-900/30 border-mint-400 dark:border-mint-600 text-mint-700 dark:text-mint-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-mint-300 dark:hover:border-mint-700 hover:text-mint-600 dark:hover:text-mint-400'
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or create custom</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Goal title */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Goal <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              placeholder="e.g. Walk 30 minutes daily"
              className="input w-full"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value as HealthGoal['category'])}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    category === c.value
                      ? 'bg-mint-500 border-mint-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-mint-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
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

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              <Clock size={12} className="inline mr-1 text-gray-400" />
              Deadline (optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input w-full"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="btn-primary w-full h-11 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Add goal
          </button>

        </div>
      </div>
    </div>
  )
}
