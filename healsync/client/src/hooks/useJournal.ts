import { useState, useEffect, useCallback } from 'react'
import { MOCK_JOURNAL_ENTRIES } from '../mock/data'
import type { JournalEntry, JournalEntryPayload } from '../../../shared/types'

const JOURNAL_KEY = 'healsync_journal'

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadEntries = useCallback(() => {
    try {
      const raw = localStorage.getItem(JOURNAL_KEY)
      if (raw) {
        setEntries(JSON.parse(raw))
      } else {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(MOCK_JOURNAL_ENTRIES))
        setEntries(MOCK_JOURNAL_ENTRIES)
      }
    } catch {
      setEntries(MOCK_JOURNAL_ENTRIES)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadEntries, 600)
    return () => clearTimeout(timer)
  }, [loadEntries])

  const addEntry = (payload: JournalEntryPayload): JournalEntry => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      userId: 'mock-user-1',
      content: payload.content,
      moodTag: payload.moodTag ? String(payload.moodTag) : undefined,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
    return newEntry
  }

  const deleteEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
  }

  const updateEntry = (id: string, content: string, moodTag: number | null) => {
    const updated = entries.map(e =>
      e.id === id
        ? { ...e, content, moodTag: moodTag ? String(moodTag) : undefined, updatedAt: new Date().toISOString() }
        : e
    )
    setEntries(updated)
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
  }

  return { entries, isLoading, addEntry, deleteEntry, updateEntry }
}
