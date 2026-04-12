import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react'

interface BackendContextValue {
  isOnline:   boolean
  isChecking: boolean
  recheck:    () => void
}

const BackendContext =
  createContext<BackendContextValue>({
    isOnline:   false,
    isChecking: true,
    recheck:    () => {},
  })

export function BackendProvider(
  { children }: { children: ReactNode }
) {
  const [isOnline, setIsOnline] =
    useState(false)
  const [isChecking, setIsChecking] =
    useState(true)

  const mountedRef  = useRef(true)
  const pendingRef  = useRef(false)

  const check = async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    try {
      const url = (
        import.meta.env.VITE_API_URL || '/api'
      ) + '/health'
      const ctrl = new AbortController()
      const t    = setTimeout(
        () => ctrl.abort(), 4000
      )
      const res  = await fetch(url, {
        signal: ctrl.signal,
        cache:  'no-store',
      })
      clearTimeout(t)
      if (mountedRef.current) {
        setIsOnline(res.ok)
        setIsChecking(false)
      }
    } catch {
      if (mountedRef.current) {
        setIsOnline(false)
        setIsChecking(false)
      }
    } finally {
      pendingRef.current = false
    }
  }

  useEffect(() => {
    mountedRef.current = true
    check()
    // Recheck every 30 seconds only
    const id = setInterval(check, 30000)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, []) // ← EMPTY ARRAY. DO NOT ADD DEPS.

  return (
    <BackendContext.Provider value={{
      isOnline,
      isChecking,
      recheck: check,
    }}>
      {children}
    </BackendContext.Provider>
  )
}

export const useBackend = () =>
  useContext(BackendContext)
