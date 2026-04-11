import { useState, useEffect, useCallback } from 'react'
import { journalApi } from '../api'
import { isNetworkError } from '../api/apiUtils'
import { useBackend } from '../context/BackendContext'
import { MOCK_JOURNAL_ENTRIES } from '../mock/data'
import type {
  JournalEntry,
  JournalEntryPayload,
} from '../../../shared/types'

const JOURNAL_KEY = 'healsync_journal'

export function useJournal() {
  const { isOnline } = useBackend()
  const [entries, setEntries] =
    useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] =
    useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    let mounted = true
    try {
      setIsLoading(true)
      setError(null)

      if (isOnline) {
        const res = await journalApi.getAll(1, 20)
        if (mounted) setEntries(res.data || [])
      } else {
        await new Promise(r => setTimeout(r, 600))
        const raw = localStorage.getItem(JOURNAL_KEY)
        if (mounted) {
          setEntries(
            raw
              ? JSON.parse(raw)
              : MOCK_JOURNAL_ENTRIES
          )
        }
      }
    } catch (err: any) {
      if (!mounted) return
      if (isNetworkError(err)) {
        const raw = localStorage.getItem(JOURNAL_KEY)
        setEntries(
          raw
            ? JSON.parse(raw)
            : MOCK_JOURNAL_ENTRIES
        )
      } else {
        setError('Failed to load journal entries')
      }
    } finally {
      if (mounted) setIsLoading(false)
    }
    return () => { mounted = false }
  }, [isOnline])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const addEntry = useCallback(async (
    payload: JournalEntryPayload
  ): Promise<JournalEntry> => {
    if (isOnline) {
      try {
        const entry = await journalApi.create(payload)
        setEntries(prev => [entry, ...prev])
        return entry
      } catch (err: any) {
        if (!isNetworkError(err)) throw err
        // Network error — fall through to local save
      }
    }

    // Offline save
    const newEntry: JournalEntry = {
      id:        Date.now().toString(),
      userId:    'mock-user-1',
      content:   payload.content,
      moodTag:   payload.moodTag,
      date:      new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    localStorage.setItem(
      JOURNAL_KEY, JSON.stringify(updated)
    )
    return newEntry
  }, [isOnline, entries])

  const deleteEntry = useCallback(async (
    id: string
  ): Promise<void> => {
    if (isOnline) {
      try {
        await journalApi.delete(id)
      } catch (err: any) {
        if (!isNetworkError(err)) throw err
      }
    }
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    if (!isOnline) {
      localStorage.setItem(
        JOURNAL_KEY, JSON.stringify(updated)
      )
    }
  }, [isOnline, entries])

  const updateEntry = useCallback(async (
    id: string,
    content: string,
    moodTag: number | null
  ): Promise<void> => {
    const stringMoodTag = moodTag !== null ? String(moodTag) : undefined;
    if (isOnline) {
      try {
        await journalApi.update(id, { content, moodTag: stringMoodTag })
      } catch (err: any) {
        if (!isNetworkError(err)) throw err
      }
    }
    const updated = entries.map(e =>
      e.id === id
        ? {
            ...e,
            content,
            moodTag: stringMoodTag,
            updatedAt: new Date().toISOString(),
          }
        : e
    )
    setEntries(updated)
    if (!isOnline) {
      localStorage.setItem(
        JOURNAL_KEY, JSON.stringify(updated)
      )
    }
  }, [isOnline, entries])

  return {
    entries,
    isLoading,
    error,
    addEntry,
    deleteEntry,
    updateEntry,
    refetch: loadEntries,
  }
}
