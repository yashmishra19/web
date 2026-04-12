import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { AlertTriangle, Phone, X, Send } from 'lucide-react'

interface EmergencyContact {
  name:         string
  phone:        string
  whatsapp:     string
  relationship: string
}

export default function SOSButton() {
  const { user, profile } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const getContact = (): EmergencyContact | null => {
    try {
      const raw = localStorage.getItem('healsync_emergency_contact')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const getLatestVitals = () => {
    try {
      const raw = localStorage.getItem('healsync_vitals_latest')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  const sendSOS = useCallback(async () => {
    setIsSending(true)
    const contact = getContact()
    const vitals  = getLatestVitals()

    // Build emergency message
    const userName = user?.name ?? 'HealSync User'
    const time = new Date().toLocaleTimeString([], {
      hour:   '2-digit',
      minute: '2-digit',
    })
    const date = new Date().toLocaleDateString('en-GB', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
    })

    let vitalsText = ''
    if (vitals) {
      vitalsText = '\n\nLast recorded vitals:'
      if (vitals.heartRate)
        vitalsText += `\n❤️ Heart rate: ${vitals.heartRate} bpm`
      if (vitals.systolicBP && vitals.diastolicBP)
        vitalsText += `\n💜 Blood pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg`
      if (vitals.spO2)
        vitalsText += `\n💧 SpO2: ${vitals.spO2}%`
    }


    // Try to get location
    let locationText = ''
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            locationText = `\n📍 Location: https://maps.google.com/?q=${lat},${lng}`
            resolve()
          },
          () => resolve(),
          { timeout: 3000 }
        )
      })
    } catch {}

    const fullMessage = encodeURIComponent(
      `🆘 EMERGENCY ALERT 🆘\n\n` +
      `${userName} may need immediate help.\n` +
      `Time: ${time} on ${date}` +
      locationText +
      vitalsText +
      `\n\nThis alert was sent from HealSync health app.\n` +
      `Please check on them immediately.`
    )

    // Open WhatsApp or SMS
    if (contact?.whatsapp) {
      const clean = contact.whatsapp.replace(/\s+/g, '').replace(/^\+/, '')
      window.open(`https://wa.me/${clean}?text=${fullMessage}`, '_blank')
    } else if (contact?.phone) {
      window.location.href = `sms:${contact.phone}?body=${fullMessage}`
    }

    setIsSending(false)
    setSent(true)
    setShowConfirm(false)

    setTimeout(() => setSent(false), 5000)
  }, [user, profile])

  const contact = getContact()

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className={`
          fixed bottom-20 right-4
          md:bottom-6 md:right-6
          flex items-center gap-1.5
          px-3 py-2 rounded-xl
          text-xs font-bold
          shadow-lg transition-all
          active:scale-95 z-40
          border-2
          ${sent
            ? 'bg-mint-500 border-mint-600 text-white'
            : 'bg-red-500 border-red-600 text-white hover:bg-red-600'
          }
        `}>
        {sent ? (
          <>✅ Sent</>
        ) : (
          <>
            <AlertTriangle size={13} />
            SOS
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0
          bg-black/60 z-50 flex items-center
          justify-center p-4">
          <div className="bg-white
            dark:bg-gray-900 rounded-2xl
            w-full max-w-sm p-6 shadow-2xl">

            {/* Header */}
            <div className="flex items-center
              gap-3 mb-4">
              <div className="w-12 h-12
                rounded-2xl bg-red-100
                dark:bg-red-900/30
                flex items-center justify-center">
                <AlertTriangle size={24}
                  className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base
                  font-semibold text-gray-900
                  dark:text-white">
                  Send SOS Alert?
                </h3>
                <p className="text-xs
                  text-gray-500
                  dark:text-gray-400 mt-0.5">
                  This will alert your
                  emergency contact
                </p>
              </div>
            </div>

            {contact ? (
              <>
                {/* Contact info */}
                <div className="bg-red-50
                  dark:bg-red-900/20 rounded-xl
                  p-3 mb-4 border border-red-100
                  dark:border-red-800">
                  <p className="text-sm
                    font-medium text-red-800
                    dark:text-red-300">
                    {contact.name}
                  </p>
                  <p className="text-xs
                    text-red-600
                    dark:text-red-400 mt-0.5">
                    {contact.whatsapp ||
                     contact.phone}
                  </p>
                  <p className="text-xs
                    text-gray-500
                    dark:text-gray-400 mt-1">
                    Will receive your location
                    and latest vitals
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 h-11
                      rounded-xl border
                      border-gray-200
                      dark:border-gray-700
                      text-sm font-medium
                      text-gray-600
                      dark:text-gray-400
                      hover:bg-gray-50
                      dark:hover:bg-gray-800
                      flex items-center
                      justify-center gap-2">
                    <X size={15} />
                    Cancel
                  </button>
                  <button
                    onClick={sendSOS}
                    disabled={isSending}
                    className="flex-1 h-11
                      rounded-xl bg-red-500
                      hover:bg-red-600 text-white
                      text-sm font-medium
                      flex items-center
                      justify-center gap-2
                      disabled:opacity-50">
                    {isSending ? (
                      <div className="w-4 h-4
                        border-2 border-white/30
                        border-t-white
                        rounded-full
                        animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    Send Alert
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-50
                  dark:bg-amber-900/20 rounded-xl
                  p-3 mb-4 text-center">
                  <p className="text-sm
                    text-amber-700
                    dark:text-amber-400">
                    No emergency contact set.
                    Add one in Settings first.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirm(false)
                    window.location.href = '/settings'
                  }}
                  className="btn-primary w-full
                    h-11 text-sm">
                  Go to Settings
                </button>
              </>
            )}

            {/* Call ambulance direct link */}
            <a
              href="tel:112"
              className="flex items-center
                justify-center gap-2 mt-3
                text-xs text-red-500
                dark:text-red-400
                hover:text-red-600 font-medium">
              <Phone size={12} />
              Call Emergency Services (112)
            </a>

          </div>
        </div>
      )}
    </>
  )
}
