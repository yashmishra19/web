import { useState, useEffect, useCallback } from 'react'
import { journalApi } from '../api'
import { useBackend } from '../context/BackendContext'
import { MOCK_JOURNAL_ENTRIES } from '../mock/data'
import type { JournalEntry, JournalEntryPayload } from '../../../shared/types'

const JOURNAL_KEY = 'healsync_journal'

export function useJournal() {
  const { isOnline } = useBackend()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    try {
      if (isOnline) {
        const res = await journalApi.getAll(1, 20)
        setEntries(res.data)
      } else {
        const raw = localStorage.getItem(JOURNAL_KEY)
        if (raw) {
          setEntries(JSON.parse(raw))
        } else {
          localStorage.setItem(JOURNAL_KEY, JSON.stringify(MOCK_JOURNAL_ENTRIES))
          setEntries(MOCK_JOURNAL_ENTRIES)
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load journal entries');
      if (!isOnline) setEntries(MOCK_JOURNAL_ENTRIES)
    } finally {
      setIsLoading(false)
    }
  }, [isOnline])

  useEffect(() => {
    const timer = setTimeout(loadEntries, 600)
    return () => clearTimeout(timer)
  }, [loadEntries])

  const addEntry = async (payload: JournalEntryPayload): Promise<JournalEntry> => {
    if (isOnline) {
      const entry = await journalApi.create(payload)
      setEntries(prev => [entry, ...prev])
      return entry
    } else {
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
  }

  const deleteEntry = async (id: string) => {
    if (isOnline) {
      await journalApi.delete(id)
    }
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    if (!isOnline) {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
    }
  }

  const updateEntry = async (id: string, content: string, moodTag: number | null) => {
    if (isOnline) {
      await journalApi.update(id, { content, moodTag: moodTag ? String(moodTag) : undefined })
    }
    const updated = entries.map(e =>
      e.id === id
        ? { ...e, content, moodTag: moodTag ? String(moodTag) : undefined, updatedAt: new Date().toISOString() }
        : e
    )
    setEntries(updated)
    if (!isOnline) {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated))
    }
  }

  return { entries, isLoading, error, addEntry, deleteEntry, updateEntry }
}
