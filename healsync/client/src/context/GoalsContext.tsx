import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

const GOALS_KEY = 'healsync_goals'

export interface HealthGoal {
  id: string
  title: string
  category: 'fitness' | 'nutrition' | 'mental' | 'sleep' | 'vitals' | 'custom'
  target: string
  deadline?: string
  completed: boolean
  createdAt: string
}

interface GoalsContextValue {
  goals: HealthGoal[]
  addGoal: (goal: HealthGoal) => void
  toggleGoal: (id: string) => void
  deleteGoal: (id: string) => void
  clearCompleted: () => void
}

const GoalsContext = createContext<GoalsContextValue | null>(null)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<HealthGoal[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOALS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setGoals(parsed)
        }
      }
    } catch {
      setGoals([])
    }
  }, [])

  // Persist to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  }, [goals])

  const addGoal = (goal: HealthGoal) => {
    setGoals(prev => [goal, ...prev])
  }

  const toggleGoal = (id: string) => {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    )
  }

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const clearCompleted = () => {
    setGoals(prev => prev.filter(g => !g.completed))
  }

  return (
    <GoalsContext.Provider value={{
      goals,
      addGoal,
      toggleGoal,
      deleteGoal,
      clearCompleted,
    }}>
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals(): GoalsContextValue {
  const ctx = useContext(GoalsContext)
  if (!ctx) throw new Error('useGoals must be used inside GoalsProvider')
  return ctx
}
