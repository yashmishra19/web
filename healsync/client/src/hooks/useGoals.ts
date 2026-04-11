import { useState, useEffect } from 'react';

export interface HealthGoal {
  id: string
  title: string
  category: 'fitness' | 'nutrition' | 'mental' | 'sleep' | 'vitals' | 'custom'
  target: string
  deadline: string
  completed: boolean
  createdAt: string
}

const GOALS_KEY = 'healsync_goals'

export function useGoals() {
  const [goals, setGoals] = useState<HealthGoal[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOALS_KEY)
      setGoals(raw ? JSON.parse(raw) : [])
    } catch { setGoals([]) }
  }, [])

  const addGoal = (goal: HealthGoal) => {
    const updated = [goal, ...goals]
    setGoals(updated)
    localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
  }

  const toggleGoal = (id: string) => {
    const updated = goals.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    )
    setGoals(updated)
    localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
  }

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id)
    setGoals(updated)
    localStorage.setItem(GOALS_KEY, JSON.stringify(updated))
  }

  return { goals, addGoal, toggleGoal, deleteGoal }
}
