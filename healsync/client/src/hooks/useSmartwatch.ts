import { useState, useCallback, useRef } from 'react'
import type {
  WatchConnectionStatus,
  WatchDevice,
  VitalsPayload,
} from '../../../shared/types'

export function useSmartwatch() {
  const [status, setStatus] =
    useState<WatchConnectionStatus>('disconnected')
  const [device, setDevice] =
    useState<WatchDevice | null>(null)
  const [liveVitals, setLiveVitals] =
    useState<Partial<VitalsPayload> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isBluetoothSupported = () =>
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator

  // ── Real Bluetooth connection (Web Bluetooth API) ──
  const connectReal = useCallback(async () => {
    if (!isBluetoothSupported()) {
      setStatus('unsupported')
      setError(
        'Web Bluetooth is not supported in this browser. ' +
        'Use Chrome on Android or desktop.'
      )
      return
    }

    try {
      setStatus('connecting')
      setError(null)

      const device = await (navigator as any)
        .bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            'heart_rate',
            '0x180d',
            '0x180f',
          ],
        })

      setDevice({
        id:   device.id,
        name: device.name || 'Unknown Device',
        type: 'generic',
      })

      const server = await device.gatt.connect()

      // Try to read heart rate service
      try {
        const service = await server.getPrimaryService(
          'heart_rate'
        )
        const characteristic =
          await service.getCharacteristic(
            'heart_rate_measurement'
          )

        await characteristic.startNotifications()
        characteristic.addEventListener(
          'characteristicvaluechanged',
          (event: any) => {
            const value = event.target.value
            const hr = value.getUint8(1)
            setLiveVitals(prev => ({
              ...prev,
              heartRate: hr,
              source: 'smartwatch',
            }))
          }
        )
      } catch {
        // Device might not support heart rate service
      }

      setStatus('connected')

    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setStatus('disconnected')
        setError('No device selected.')
      } else {
        setStatus('disconnected')
        setError(
          'Could not connect to device. ' +
          'Make sure Bluetooth is on and the ' +
          'device is nearby.'
        )
      }
    }
  }, [])

  // ── Simulation mode (for demo + unsupported browsers) ──
  const connectSimulated = useCallback(() => {
    setStatus('simulating')
    setError(null)
    setDevice({
      id:           'simulated-device-001',
      name:         'HealSync Demo Watch',
      type:         'simulated',
      batteryLevel: 78,
      lastSync:     new Date().toISOString(),
    })

    // Generate realistic simulated vitals
    const generateVitals = () => {
      const baseHR = 72
      const variation = Math.floor(Math.random() * 10) - 5

      setLiveVitals({
        heartRate:       baseHR + variation,
        systolicBP:      118 + Math.floor(Math.random() * 8),
        diastolicBP:     76  + Math.floor(Math.random() * 6),
        spO2:            97  + Math.floor(Math.random() * 3),
        steps:           Math.floor(Math.random() * 8000) + 2000,
        caloriesBurned:  Math.floor(Math.random() * 400) + 100,
        bodyTemperature: parseFloat(
          (36.5 + Math.random() * 0.8).toFixed(1)
        ),
        source: 'simulated',
      })
    }

    generateVitals()
    simulationRef.current = setInterval(
      generateVitals, 3000
    )
  }, [])

  const disconnect = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }
    setStatus('disconnected')
    setDevice(null)
    setLiveVitals(null)
    setError(null)
  }, [])

  const refreshSimulated = useCallback(() => {
    if (status !== 'simulating') return
    const baseHR = 72
    const variation = Math.floor(Math.random() * 10) - 5
    setLiveVitals({
      heartRate:       baseHR + variation,
      systolicBP:      118 + Math.floor(Math.random() * 8),
      diastolicBP:     76  + Math.floor(Math.random() * 6),
      spO2:            97  + Math.floor(Math.random() * 3),
      steps:           Math.floor(Math.random() * 8000) + 2000,
      caloriesBurned:  Math.floor(Math.random() * 400) + 100,
      bodyTemperature: parseFloat(
        (36.5 + Math.random() * 0.8).toFixed(1)
      ),
      source: 'simulated',
    })
  }, [status])

  return {
    status,
    device,
    liveVitals,
    error,
    isBluetoothSupported: isBluetoothSupported(),
    connectReal,
    connectSimulated,
    disconnect,
    refreshSimulated,
  }
}
