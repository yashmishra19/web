import {
  useState, useCallback,
  useRef, useEffect,
} from 'react'

export type ConnectionStatus =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'simulating'
  | 'disconnected'
  | 'unsupported'
  | 'error'

export interface LiveVitals {
  heartRate?:        number
  systolicBP?:       number
  diastolicBP?:      number
  spO2?:             number
  steps?:            number
  caloriesBurned?:   number
  bodyTemperature?:  number
  source:            'bluetooth' | 'simulated'
  timestamp:         string
}

export interface ConnectedDevice {
  id:           string
  name:         string
  batteryLevel: number | null
  rssi:         number | null
}

// Standard Bluetooth GATT service UUIDs
const HEART_RATE_SERVICE         = 0x180D
const HEART_RATE_MEASUREMENT     = 0x2A37
const BATTERY_SERVICE            = 0x180F
const BATTERY_LEVEL              = 0x2A19
const HEALTH_THERMOMETER_SERVICE = 0x1809
const TEMPERATURE_MEASUREMENT    = 0x2A1C
const PULSE_OXIMETER_SERVICE     = 0x1822
const PLX_CONTINUOUS_MEASUREMENT = 0x2A5F

export function useSmartwatch() {
  const [status, setStatus] =
    useState<ConnectionStatus>('idle')
  const [device, setDevice] =
    useState<ConnectedDevice | null>(null)
  const [vitals, setVitals] =
    useState<LiveVitals | null>(null)
  const [error, setError] =
    useState<string | null>(null)
  const [history, setHistory] =
    useState<LiveVitals[]>([])

  const deviceRef    = useRef<any>(null)
  const serverRef    = useRef<any>(null)
  const simIntervalRef = useRef<any>(null)
  const characteristicsRef = useRef<any[]>([])

  const isSupported =
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator

  // ── Cleanup on unmount ──────────────────────
  useEffect(() => {
    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current)
      }
      disconnectDevice()
    }
  }, [])

  // ── Add vitals to history ───────────────────
  const addToHistory = useCallback(
    (v: LiveVitals) => {
      setHistory(prev =>
        [v, ...prev].slice(0, 50)
      )
    }, []
  )

  // ── Parse heart rate from BLE data ─────────
  const parseHeartRate = (value: DataView) => {
    const flags = value.getUint8(0)
    const is16Bit = flags & 0x1
    return is16Bit
      ? value.getUint16(1, true)
      : value.getUint8(1)
  }

  // ── Parse SpO2 from BLE data ────────────────
  const parseSpO2 = (value: DataView) => {
    try {
      return value.getUint8(3)
    } catch { return null }
  }

  // ── Parse temperature from BLE data ────────
  const parseTemperature = (value: DataView) => {
    try {
      const mantissa = (
        value.getUint8(1) |
        (value.getUint8(2) << 8) |
        (value.getUint8(3) << 16)
      )
      const exponent = value.getInt8(4)
      const temp =
        mantissa * Math.pow(10, exponent)
      return parseFloat(temp.toFixed(1))
    } catch { return null }
  }

  // ── Connect to real Bluetooth device ────────
  const connectBluetooth =
    useCallback(async () => {
      if (!isSupported) {
        setStatus('unsupported')
        setError(
          'Web Bluetooth is not supported. ' +
          'Please use Chrome on Android or desktop.'
        )
        return
      }

      try {
        setStatus('scanning')
        setError(null)

        // Request device — shows browser picker
        const btDevice = await (navigator as any)
          .bluetooth.requestDevice({
            // Accept ALL devices
            acceptAllDevices: true,
            // Request all health services
            optionalServices: [
              HEART_RATE_SERVICE,
              BATTERY_SERVICE,
              HEALTH_THERMOMETER_SERVICE,
              PULSE_OXIMETER_SERVICE,
              // Common fitness tracker services
              '0000fee0-0000-1000-8000-00805f9b34fb',
              '0000fee1-0000-1000-8000-00805f9b34fb',
              '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            ],
          })

        setStatus('connecting')
        deviceRef.current = btDevice

        // Handle disconnect
        btDevice.addEventListener(
          'gattserverdisconnected',
          () => {
            setStatus('disconnected')
            setDevice(null)
            setError(
              'Device disconnected. ' +
              'Tap connect to reconnect.'
            )
          }
        )

        // Connect to GATT server
        const server =
          await btDevice.gatt.connect()
        serverRef.current = server

        const connectedDevice: ConnectedDevice = {
          id:           btDevice.id,
          name:         btDevice.name ||
                        'Unknown Device',
          batteryLevel: null,
          rssi:         null,
        }

        // ── Try heart rate service ────────────
        try {
          const hrService =
            await server.getPrimaryService(
              HEART_RATE_SERVICE
            )
          const hrChar =
            await hrService.getCharacteristic(
              HEART_RATE_MEASUREMENT
            )
          await hrChar.startNotifications()
          characteristicsRef.current.push(hrChar)

          hrChar.addEventListener(
            'characteristicvaluechanged',
            (e: any) => {
              const hr = parseHeartRate(
                e.target.value
              )
              setVitals(prev => {
                const updated: LiveVitals = {
                  ...prev,
                  heartRate: hr,
                  source:    'bluetooth',
                  timestamp: new Date()
                                .toISOString(),
                }
                addToHistory(updated)
                return updated
              })
            }
          )
        } catch {
          // Device doesn't support heart rate
        }

        // ── Try battery level ─────────────────
        try {
          const batService =
            await server.getPrimaryService(
              BATTERY_SERVICE
            )
          const batChar =
            await batService.getCharacteristic(
              BATTERY_LEVEL
            )
          const batValue = await batChar.readValue()
          connectedDevice.batteryLevel =
            batValue.getUint8(0)
        } catch {
          // No battery service
        }

        // ── Try SpO2 service ──────────────────
        try {
          const spo2Service =
            await server.getPrimaryService(
              PULSE_OXIMETER_SERVICE
            )
          const spo2Char =
            await spo2Service.getCharacteristic(
              PLX_CONTINUOUS_MEASUREMENT
            )
          await spo2Char.startNotifications()
          characteristicsRef.current.push(spo2Char)

          spo2Char.addEventListener(
            'characteristicvaluechanged',
            (e: any) => {
              const spo2 = parseSpO2(
                e.target.value
              )
              if (spo2) {
                setVitals(prev => ({
                  ...prev,
                  spO2:      spo2,
                  source:    'bluetooth',
                  timestamp: new Date()
                               .toISOString(),
                }))
              }
            }
          )
        } catch {
          // No SpO2 service
        }

        // ── Try temperature service ───────────
        try {
          const tempService =
            await server.getPrimaryService(
              HEALTH_THERMOMETER_SERVICE
            )
          const tempChar =
            await tempService.getCharacteristic(
              TEMPERATURE_MEASUREMENT
            )
          await tempChar.startNotifications()
          characteristicsRef.current.push(
            tempChar
          )

          tempChar.addEventListener(
            'characteristicvaluechanged',
            (e: any) => {
              const temp = parseTemperature(
                e.target.value
              )
              if (temp) {
                setVitals(prev => ({
                  ...prev,
                  bodyTemperature: temp,
                  source:          'bluetooth',
                  timestamp:       new Date()
                                     .toISOString(),
                }))
              }
            }
          )
        } catch {
          // No temperature service
        }

        setDevice(connectedDevice)
        setStatus('connected')

        // Set initial vitals if nothing received
        setTimeout(() => {
          setVitals(prev => {
            if (!prev) {
              return {
                source:    'bluetooth',
                timestamp: new Date().toISOString(),
              }
            }
            return prev
          })
        }, 2000)

      } catch (err: any) {
        if (err.name === 'NotFoundError' ||
            err.name === 'NotAllowedError') {
          setStatus('idle')
          setError(null)
        } else {
          setStatus('error')
          setError(
            'Connection failed: ' +
            (err.message || 'Unknown error') +
            '. Make sure Bluetooth is on and ' +
            'the device is nearby.'
          )
        }
      }
    }, [isSupported, addToHistory])

  // ── Simulation mode ─────────────────────────
  const connectSimulation =
    useCallback(() => {
      setStatus('simulating')
      setError(null)

      const simulatedDevice: ConnectedDevice = {
        id:           'sim-001',
        name:         'HealSync Demo Watch',
        batteryLevel: 78,
        rssi:         -62,
      }
      setDevice(simulatedDevice)

      // Realistic baseline values
      let baseHR     = 72
      let baseSteps  = 3200
      let baseCal    = 180
      let hrTrend    = 0

      const generateReading = ():
        LiveVitals => {
        // Simulate gradual HR changes
        hrTrend += (Math.random() - 0.5) * 2
        hrTrend  = Math.max(
          -10, Math.min(10, hrTrend)
        )
        baseHR   = Math.max(
          58,
          Math.min(
            95,
            baseHR + hrTrend * 0.3
          )
        )

        // Steps increase over time
        baseSteps += Math.floor(
          Math.random() * 15
        )
        baseCal   += Math.floor(
          Math.random() * 3
        )

        const r = (n: number, d = 0) =>
          parseFloat(
            (n + (Math.random() - 0.5) * d * 2)
              .toFixed(1)
          )

        return {
          heartRate:
            Math.round(baseHR),
          systolicBP:
            Math.round(r(118, 4)),
          diastolicBP:
            Math.round(r(76, 3)),
          spO2:
            Math.min(
              100,
              Math.round(r(97.5, 1))
            ),
          steps:
            baseSteps,
          caloriesBurned:
            baseCal,
          bodyTemperature:
            parseFloat(r(36.6, 0.2)
              .toFixed(1)),
          source:    'simulated',
          timestamp: new Date().toISOString(),
        }
      }

      // First reading immediately
      const first = generateReading()
      setVitals(first)
      addToHistory(first)

      // Update every 3 seconds
      simIntervalRef.current = setInterval(
        () => {
          const reading = generateReading()
          setVitals(reading)
          addToHistory(reading)
        }, 3000
      )
    }, [addToHistory])

  // ── Disconnect ───────────────────────────────
  const disconnectDevice =
    useCallback(async () => {
      // Stop simulation
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current)
        simIntervalRef.current = null
      }

      // Stop Bluetooth notifications
      for (const char of
           characteristicsRef.current) {
        try {
          await char.stopNotifications()
        } catch {}
      }
      characteristicsRef.current = []

      // Disconnect GATT
      if (serverRef.current?.connected) {
        try {
          serverRef.current.disconnect()
        } catch {}
      }
      serverRef.current  = null
      deviceRef.current  = null

      setStatus('idle')
      setDevice(null)
      setVitals(null)
      setError(null)
    }, [])

  // ── Refresh simulation reading ───────────────
  const refreshSimulation =
    useCallback(() => {
      if (status !== 'simulating') return
      // Trigger a new reading immediately
      connectSimulation()
    }, [status, connectSimulation])

  // ── Save vitals to localStorage ──────────────
  const saveCurrentVitals =
    useCallback(() => {
      if (!vitals) return
      localStorage.setItem(
        'healsync_vitals_latest',
        JSON.stringify({
          ...vitals,
          createdAt: new Date().toISOString(),
        })
      )
    }, [vitals])

  return {
    // State
    status,
    device,
    vitals,
    error,
    history,
    isSupported,

    // Actions
    connectBluetooth,
    connectSimulation,
    disconnectDevice,
    refreshSimulation,
    saveCurrentVitals,

    // Computed
    isConnected:
      status === 'connected' ||
      status === 'simulating',
    isConnecting:
      status === 'scanning' ||
      status === 'connecting',
  }
}
