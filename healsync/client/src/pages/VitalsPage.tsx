import { useState, useEffect } from 'react'
import { useSmartwatch } from '../hooks/useSmartwatch'
import { vitalsApi } from '../api'
import { useBackend } from '../context/BackendContext'
import { useToastContext } from '../components/ui'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { EmptyState, SkeletonCard } from '../components/ui'
import { MOCK_VITALS_READINGS } from '../mock/data'
import { Input } from '../components/ui'
import {
  Heart, Activity, Thermometer, Droplets,
  Bluetooth, BluetoothOff, BluetoothSearching,
  RefreshCw, Save,
  AlertTriangle, CheckCircle, Info, Zap,
  Watch, Plus, ChevronDown, ChevronUp, Footprints
} from 'lucide-react'
import type {
  VitalsPayload,
  VitalsSuggestion,
  VitalsReading,
} from '../../../shared/types'

function generateLocalSuggestions(
  vitals: Partial<VitalsPayload>
): VitalsSuggestion[] {
  const suggestions: VitalsSuggestion[] = []

  if (vitals.heartRate) {
    const hr = vitals.heartRate
    suggestions.push({
      id: '1',
      category: 'heart',
      severity: hr < 50 || hr > 100
        ? hr > 120 ? 'alert' : 'warning'
        : 'normal',
      title: hr >= 50 && hr <= 100
        ? 'Heart rate is normal'
        : hr > 100
        ? 'Elevated heart rate'
        : 'Low heart rate detected',
      message: hr >= 50 && hr <= 100
        ? `Your heart rate of ${hr} bpm is healthy.`
        : hr > 100
        ? `Your heart rate of ${hr} bpm is elevated. Try a breathing exercise to calm down.`
        : `Your heart rate of ${hr} bpm is low. If you feel unwell please see a doctor.`,
      action: hr > 100 ? 'Try breathing exercise' : '',
    })
  }

  if (vitals.systolicBP && vitals.diastolicBP) {
    const sys = vitals.systolicBP
    const dia = vitals.diastolicBP
    const isHigh = sys >= 140 || dia >= 90
    const isLow  = sys < 90  || dia < 60
    suggestions.push({
      id: '2',
      category: 'blood_pressure',
      severity: isHigh ? 'alert'
              : isLow  ? 'warning'
              : 'normal',
      title: isHigh ? 'High blood pressure'
           : isLow  ? 'Low blood pressure'
           : 'Blood pressure is healthy',
      message: `Your reading of ${sys}/${dia} mmHg is ${isHigh ? 'high — consult a doctor.' : isLow ? 'low — stay hydrated.' : 'within normal range.'}`,
      action: isHigh ? 'Consult a doctor' : '',
    })
  }

  if (vitals.spO2) {
    const spo2 = vitals.spO2
    suggestions.push({
      id: '3',
      category: 'oxygen',
      severity: spo2 < 90 ? 'alert'
              : spo2 < 95 ? 'warning'
              : 'normal',
      title: spo2 >= 95
        ? 'Oxygen saturation is normal'
        : 'Low oxygen saturation',
      message: `Your SpO2 of ${spo2}% is ${spo2 >= 95 ? 'healthy.' : spo2 >= 90 ? 'slightly low. Try deep breathing.' : 'dangerously low — seek help immediately.'}`,
      action: spo2 < 95 ? 'Practice deep breathing' : '',
    })
  }

  return suggestions
}

export default function VitalsPage() {
  const {
    status, device, liveVitals,
    error: watchError,
    connectReal, connectSimulated,
    disconnect, refreshSimulated,
  } = useSmartwatch()

  const { isOnline } = useBackend()
  const { showToast } = useToastContext()

  const [heartRate, setHeartRate] = useState<string>('')
  const [systolicBP, setSystolicBP] = useState<string>('')
  const [diastolicBP, setDiastolicBP] = useState<string>('')
  const [spO2, setSpO2] = useState<string>('')
  const [steps, setSteps] = useState<string>('')
  const [caloriesBurned, setCaloriesBurned] = useState<string>('')
  const [bodyTemperature, setBodyTemperature] = useState<string>('')
  
  const [activeTab, setActiveTab] = useState<'connect' | 'manual'>('connect')
  const [suggestions, setSuggestions] = useState<VitalsSuggestion[]>([])
  const [recentReadings, setRecentReadings] = useState<VitalsReading[]>([])
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)
  const [showHistory, setShowHistory] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (isOnline) {
          const data = await vitalsApi.getAll(7)
          setRecentReadings(data)
        } else {
          setRecentReadings(MOCK_VITALS_READINGS)
        }
      } catch {
        setRecentReadings(MOCK_VITALS_READINGS)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    load()
  }, [isOnline])

  useEffect(() => {
    if (!liveVitals) return
    const generateLiveSuggestions = async () => {
      try {
        if (isOnline) {
          const result = await vitalsApi.getSuggestions(liveVitals)
          setSuggestions(result)
        } else {
          setSuggestions(generateLocalSuggestions(liveVitals))
        }
      } catch {
        setSuggestions(generateLocalSuggestions(liveVitals))
      }
    }
    generateLiveSuggestions()
  }, [liveVitals, isOnline])

  const handleSaveVitals = async (payload: VitalsPayload) => {
    try {
      setIsSaving(true)
      if (isOnline) {
        const result = await vitalsApi.save(payload)
        setSuggestions(result.suggestions)
        setRecentReadings(prev => [result.reading, ...prev].slice(0, 10))
        showToast('Vitals saved successfully ✅', 'success')
      } else {
        const localReading: VitalsReading = {
          id: Date.now().toString(),
          userId: 'mock-user-1',
          ...payload,
          createdAt: new Date().toISOString(),
        }
        setSuggestions(generateLocalSuggestions(payload))
        setRecentReadings(prev => [localReading, ...prev].slice(0, 10))
        showToast('Vitals saved locally', 'info')
      }
    } catch {
      showToast('Could not save vitals', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleManualSubmit = () => {
    const hr = parseInt(heartRate)
    const sys = parseInt(systolicBP)
    const dia = parseInt(diastolicBP)
    const spo = parseInt(spO2)
    const stp = parseInt(steps)
    const cal = parseInt(caloriesBurned)
    const temp = parseFloat(bodyTemperature)

    if (isNaN(hr) && isNaN(sys) && isNaN(dia) && isNaN(spo) && isNaN(stp) && isNaN(cal) && isNaN(temp)) {
      showToast('Please enter at least one measurement', 'error')
      return
    }

    const payload: VitalsPayload = {
      source: 'manual'
    }

    if (!isNaN(hr)) payload.heartRate = hr
    if (!isNaN(sys)) payload.systolicBP = sys
    if (!isNaN(dia)) payload.diastolicBP = dia
    if (!isNaN(spo)) payload.spO2 = spo
    if (!isNaN(stp)) payload.steps = stp
    if (!isNaN(cal)) payload.caloriesBurned = cal
    if (!isNaN(temp)) payload.bodyTemperature = temp

    handleSaveVitals(payload)

    // Clear form
    setHeartRate('')
    setSystolicBP('')
    setDiastolicBP('')
    setSpO2('')
    setSteps('')
    setCaloriesBurned('')
    setBodyTemperature('')
  }

  const handleSaveFromWatch = () => {
    if (!liveVitals) return
    const payload: VitalsPayload = {
      ...liveVitals,
      source: liveVitals.source || 'smartwatch'
    }
    handleSaveVitals(payload)
  }

  return (
    <div className="space-y-6 page-enter max-w-3xl mx-auto pb-24 md:pb-6">
      <PageHeader
        title="Vitals & Health Metrics"
        subtitle="Track your health data from a smartwatch or enter manually"
      />

      {/* SECTION 1: TAB SELECTOR */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('connect')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-medium ${
            activeTab === 'connect'
              ? 'bg-mint-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Watch size={18} />
          <span>Smartwatch</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-medium ${
            activeTab === 'manual'
              ? 'bg-mint-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Plus size={18} />
          <span>Manual entry</span>
        </button>
      </div>

      {/* SECTION 2A: SMARTWATCH TAB */}
      {activeTab === 'connect' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Watch className="text-mint-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Smartwatch connection</h2>
            </div>
            <div>
              {status === 'disconnected' && <Badge color="gray">Disconnected</Badge>}
              {status === 'connecting' && <Badge color="blue">Connecting...</Badge>}
              {status === 'connected' && <Badge color="green">Connected</Badge>}
              {status === 'simulating' && <Badge color="amber">Simulating</Badge>}
              {status === 'unsupported' && <Badge color="red">Not supported</Badge>}
            </div>
          </div>

          {(status === 'disconnected' || status === 'unsupported') && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={connectReal}
                    disabled={status === 'unsupported'}
                    leftIcon={<Bluetooth size={18} />}
                  >
                    Connect real device
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2 px-4">
                    Requires Chrome browser with Bluetooth enabled
                  </p>
                </div>
                <div className="flex-1">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={connectSimulated}
                    leftIcon={<RefreshCw size={18} />}
                  >
                    Use demo simulation
                  </Button>
                </div>
              </div>

              {watchError && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mt-4 flex items-start gap-3">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-red-700 dark:text-red-300">{watchError}</p>
                </div>
              )}

              <div className="bg-calm-50 dark:bg-calm-900/20 rounded-xl p-3 mt-4 flex items-start gap-3">
                <Info className="text-calm-500 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-calm-700 dark:text-calm-300">
                  Compatible with most Bluetooth heart rate monitors, fitness bands and smartwatches. For best results use Chrome browser on Android or desktop.
                </p>
              </div>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <BluetoothSearching className="animate-pulse text-mint-500 mb-3" size={32} />
              <p>Searching for devices...</p>
            </div>
          )}

          {(status === 'connected' || status === 'simulating') && device && liveVitals && (
            <div>
              <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Watch className="text-mint-600" size={24} />
                  <div>
                    <p className="font-medium text-mint-800 dark:text-mint-200">{device.name}</p>
                    {device.batteryLevel && (
                      <p className="text-xs text-mint-600 mt-0.5">Battery: {device.batteryLevel}%</p>
                    )}
                  </div>
                </div>
                <Badge color={status === 'simulating' ? 'amber' : 'green'}>
                  {status === 'simulating' ? 'Simulation' : 'Live Data'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"></div>
                  <Heart className="text-red-400 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">Heart Rate</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.heartRate} <span className="text-sm font-normal text-gray-500">bpm</span></p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"></div>
                  <Activity className="text-purple-400 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">Blood Pressure</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.systolicBP}/{liveVitals.diastolicBP} <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"></div>
                  <Droplets className="text-blue-400 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">SpO2</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.spO2}<span className="text-sm font-normal text-gray-500">%</span></p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <Footprints className="text-mint-500 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">Steps</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.steps?.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                  <Zap className="text-amber-400 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">Calories</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.caloriesBurned} <span className="text-sm font-normal text-gray-500">kcal</span></p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400"></div>
                  <Thermometer className="text-orange-400 mb-2" size={24} />
                  <p className="text-xs text-gray-400 mb-1">Temperature</p>
                  <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{liveVitals.bodyTemperature}<span className="text-sm font-normal text-gray-500">°C</span></p>
                </div>
              </div>

              {status === 'simulating' && (
                <div className="mb-4">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={refreshSimulated}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    Get new reading
                  </Button>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                loading={isSaving}
                onClick={handleSaveFromWatch}
              >
                Save this reading
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={disconnect}
                className="mt-2 text-gray-500"
                leftIcon={<BluetoothOff size={16} />}
              >
                Disconnect
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* SECTION 2B: MANUAL ENTRY TAB */}
      {activeTab === 'manual' && (
        <Card className="p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Enter your health metrics</h2>
            <p className="text-sm text-gray-500">Log measurements taken from your home medical devices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Heart rate (bpm)"
              placeholder="e.g. 72"
              type="number"
              min="40" max="200"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              leftIcon={<Heart size={16} className="text-red-400" />}
            />
            <Input
              label="Systolic BP (mmHg)"
              placeholder="e.g. 120"
              type="number"
              min="70" max="200"
              value={systolicBP}
              onChange={(e) => setSystolicBP(e.target.value)}
            />
            <Input
              label="Diastolic BP (mmHg)"
              placeholder="e.g. 80"
              type="number"
              min="40" max="130"
              value={diastolicBP}
              onChange={(e) => setDiastolicBP(e.target.value)}
            />
            <Input
              label="Blood oxygen / SpO2 (%)"
              placeholder="e.g. 98"
              type="number"
              min="85" max="100"
              value={spO2}
              onChange={(e) => setSpO2(e.target.value)}
            />
            <Input
              label="Steps today"
              placeholder="e.g. 6500"
              type="number"
              min="0" max="50000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
            <Input
              label="Calories burned (kcal)"
              placeholder="e.g. 250"
              type="number"
              min="0" max="5000"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
            />
            <Input
              label="Body temperature (°C)"
              placeholder="e.g. 36.6"
              type="number"
              step="0.1"
              min="35" max="42"
              value={bodyTemperature}
              onChange={(e) => setBodyTemperature(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            loading={isSaving}
            onClick={handleManualSubmit}
            leftIcon={<Save size={16} />}
          >
            Save and get suggestions
          </Button>
        </Card>
      )}

      {/* SECTION 3: PERSONALIZED SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 ml-1">Your health insights</h3>
          <div className="space-y-3">
            {suggestions.map((sug) => {
              const styles = {
                normal: { bg: 'bg-mint-50 dark:bg-mint-900/20', border: 'border-mint-200 dark:border-mint-800', icon: CheckCircle, iconColor: 'text-mint-500' },
                warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
                alert: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: AlertTriangle, iconColor: 'text-red-500' },
              }
              const st = styles[sug.severity]
              const Icon = st.icon

              return (
                <div key={sug.category} className={`flex gap-3 p-4 rounded-2xl border ${st.bg} ${st.border}`}>
                  <div className={`w-9 h-9 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 shadow-sm`}>
                    <Icon className={st.iconColor} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{sug.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{sug.message}</p>
                    {sug.action && (
                      <button className={`text-xs font-medium mt-2 hover:underline ${st.iconColor}`}>
                        → {sug.action}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: VITALS HISTORY */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer py-2" 
          onClick={() => setShowHistory(!showHistory)}
        >
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Previous readings</h3>
          {showHistory ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>

        {showHistory && (
          <div className="mt-3 space-y-3">
            {isLoadingHistory ? (
              <>
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </>
            ) : recentReadings.length === 0 ? (
              <EmptyState title="No readings yet" description="Your past vitals will appear here once you save them." />
            ) : (
              recentReadings.map((reading) => {
                const date = new Date(reading.recordedAt || reading.createdAt).toLocaleString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })
                
                return (
                  <div key={reading.id} className="card p-3 flex flex-col sm:flex-row sm:items-center gap-3 w-full overflow-hidden">
                    <div className="flex justify-between sm:flex-col sm:justify-center items-start shrink-0 sm:w-28">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{date}</span>
                      <Badge color={reading.source === 'manual' ? 'gray' : 'green'} className="mt-1 scale-90 origin-left">
                        {reading.source}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 flex-1 w-full">
                      {reading.heartRate && (
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 flex items-center gap-1 rounded-lg border border-gray-100 dark:border-gray-700 shrink-0">
                          <Heart size={10} className="text-red-400 hidden sm:inline" /> HR: {reading.heartRate}bpm
                        </div>
                      )}
                      {reading.systolicBP && reading.diastolicBP && (
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 flex items-center gap-1 rounded-lg border border-gray-100 dark:border-gray-700 shrink-0">
                          <Activity size={10} className="text-purple-400 hidden sm:inline" /> BP: {reading.systolicBP}/{reading.diastolicBP}
                        </div>
                      )}
                      {reading.spO2 && (
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 flex items-center gap-1 rounded-lg border border-gray-100 dark:border-gray-700 shrink-0">
                          <Droplets size={10} className="text-blue-400 hidden sm:inline" /> SpO2: {reading.spO2}%
                        </div>
                      )}
                      {reading.steps && (
                        <div className="text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 flex items-center gap-1 rounded-lg border border-gray-100 dark:border-gray-700 shrink-0">
                          <Footprints size={10} className="text-mint-500 hidden sm:inline" /> Steps: {reading.steps}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* SECTION 5: DISCLAIMER */}
      <div className="pt-4">

        <p className="text-[10px] text-gray-400 text-center mt-3 max-w-md mx-auto">
          Vitals readings from consumer devices are for general wellness tracking only and may not be medically accurate.
        </p>
      </div>
    </div>
  )
}
