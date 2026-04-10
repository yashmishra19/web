import {
  createContext, useContext, useState,
  useEffect, ReactNode
} from 'react'
import { isBackendAvailable } from '../api/apiUtils'

interface BackendContextValue {
  isOnline: boolean
  isChecking: boolean
}

const BackendContext = createContext<BackendContextValue>({
  isOnline: false,
  isChecking: true,
})

export function BackendProvider(
  { children }: { children: ReactNode }
) {
  const [isOnline, setIsOnline]       = useState(false)
  const [isChecking, setIsChecking]   = useState(true)

  useEffect(() => {
    isBackendAvailable().then(available => {
      setIsOnline(available)
      setIsChecking(false)
      if (available) {
        console.log('✅ Backend connected')
      } else {
        console.log('⚠️ Backend offline — using mock data')
      }
    })
  }, [])

  return (
    <BackendContext.Provider value={{ isOnline, isChecking }}>
      {children}
    </BackendContext.Provider>
  )
}

export const useBackend = () => useContext(BackendContext)
