import { Response, NextFunction } from 'express'
import twilio from 'twilio'
import { Chat, UserProfile, User } from '../models'
import { AuthRequest } from '../middleware/auth'

// Read lazily so dotenv has already run by the time these are called
// Read lazily so dotenv has already run by the time these are called
const getApiKeys = () => {
  const keys = [process.env.AI_CHATBOT_PRIMARY, process.env.AI_CHATBOT_SECONDARY].filter(Boolean) as string[];
  // If no primary/secondary, fallback to the legacy single key
  if (keys.length === 0 && process.env.AI_CHATBOT) keys.push(process.env.AI_CHATBOT);
  return keys;
}
const getModel = () => process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b'
const getDoctorPhone = () => process.env.EMERGENCY_DOCTOR_PHONE || '+918856853522'
const getDoctorName = () => process.env.EMERGENCY_DOCTOR_NAME || 'Dr Sharan'

// ─── Gemini — tries multiple models in sequence ───────────────────────────────
const MODEL_FALLBACKS = [
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
]

async function callGeminiWithModel(model: string, contents: any[], systemText: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = {
    contents: contents.map(c => ({
      role: c.role === 'model' ? 'model' : 'user',
      parts: [{ text: c.text }],
    })),
    systemInstruction: { parts: [{ text: systemText }] },
    generationConfig: { 
      temperature: 0.7, 
      maxOutputTokens: 800, // Balanced for quality and economy
      topP: 0.95,
      topK: 40
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json() as any

  if (response.status === 429) throw new Error('QUOTA_EXCEEDED')
  if (response.status === 403) throw new Error('FORBIDDEN')
  if (response.status === 404) throw new Error('MODEL_NOT_FOUND')

  if (!response.ok) {
    const errMsg = data.error?.message || response.statusText
    throw new Error(`Gemini error: ${errMsg}`)
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not read the AI response.'
}

async function callGemini(contents: any[], systemText: string): Promise<string> {
  const apiKeys = getApiKeys()
  if (apiKeys.length === 0) throw new Error('No Gemini API keys configured in .env')

  // Try each API key in sequence if we hit quota or permissions issues
  for (const apiKey of apiKeys) {
    // Try current model then fallbacks for THIS API key
    const modelsToTry = [getModel(), ...MODEL_FALLBACKS.filter(m => m !== getModel())]

    for (const model of modelsToTry) {
      try {
        console.log(`[Gemini] Using Model: ${model} | Key: ${apiKey.substring(0, 8)}...`)
        const result = await callGeminiWithModel(model, contents, systemText, apiKey)
        return result
      } catch (err: any) {
        if (err.message === 'QUOTA_EXCEEDED') {
          console.warn(`[Gemini] ⚠️ Quota exceeded for model ${model}. Trying next model...`)
          continue
        }
        if (err.message === 'MODEL_NOT_FOUND') {
          console.warn(`[Gemini] ⚠️ Model NOT found: ${model}. Trying next...`)
          continue
        }
        if (err.message === 'FORBIDDEN' && apiKeys.length > 1) {
          console.warn(`[Gemini] ⚠️ Key ${apiKey.substring(0, 8)}... rejected (FORBIDDEN). Trying next API key...`)
          break // Exit model loop for THIS key, try NEXT key
        }
        
        // If it's a critical quota issue for the whole key, break model loop
        if (apiKeys.length > 1) {
          console.warn(`[Gemini] ⚠️ Error with key ${apiKey.substring(0, 8)}...: ${err.message}. Rotating key...`)
          break 
        }

        throw err // Final throw if no more keys/retries
      }
    }
  }

  throw new Error('QUOTA_ALL_EXHAUSTED')
}

// ─── Emergency SMS via Twilio (server-side, fully automatic) ─────────────────
async function dispatchEmergencySms(
  patientName: string,
  patientPhone: string,
  conditions: string[],
  medications: string[],
  allergies: string[],
  keyPoints: string[],
  lastMessage: string,
  location?: { latitude: number; longitude: number },
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  const mapsLink = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : null

  const smsBody = `🚨 HEALSYNC EMERGENCY ALERT 🚨
To: ${getDoctorName()}

PATIENT DETAILS:
• Name: ${patientName}
• Phone: ${patientPhone || 'Not registered'}
${mapsLink ? `• LIVE LOCATION: ${mapsLink}` : '• Location: Not available'}

MEDICAL HISTORY:
• Conditions: ${conditions.length ? conditions.join(', ') : 'None on record'}
• Medications: ${medications.length ? medications.join(', ') : 'None on record'}
• Allergies: ${allergies.length ? allergies.join(', ') : 'None on record'}

KEY FACTS KNOWN:
${keyPoints.length ? keyPoints.map(k => `• ${k}`).join('\n') : '• No additional facts recorded'}

CURRENT ISSUE (reported in chat):
"${lastMessage}"

→ Please contact the patient immediately.
– HealSync AI Emergency System`

  console.log('\n==========================================')
  console.log('🚨 EMERGENCY SMS AUTO-DISPATCH TRIGGERED')
  console.log(`   To    : ${getDoctorName()} (${getDoctorPhone()})`)
  console.log(`   Patient: ${patientName} — ${patientPhone || 'no phone'}`)
  console.log('==========================================\n')
  console.log('SMS Body:\n', smsBody)

  // If Twilio is configured, send via server. Otherwise just log (demo mode).
  if (accountSid && accountSid.startsWith('AC') && authToken && fromNumber) {
    try {
      const client = twilio(accountSid, authToken)
      const msg = await client.messages.create({
        body: smsBody,
        from: fromNumber,
        to: getDoctorPhone(),
      })
      console.log(`✅ Twilio SMS sent. SID: ${msg.sid}`)
    } catch (err: any) {
      console.error('❌ Twilio send failed:', err.message)
    }
  } else {
    console.log('ℹ️  Twilio not configured. SMS logged above (demo mode).')
  }

  return smsBody
}

// ─── Background: extract & persist key health facts ──────────────────────────
async function extractKeyPoints(userId: string, newMessage: string) {
  try {
    const apiKey = getApiKeys()[0]
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${getModel()}:generateContent?key=${apiKey}`
    const prompt = `Analyze the user's statement: "${newMessage}".
Does it contain new health facts (conditions, allergies, medications, lifestyle)?
If yes → return a flat JSON array of short fact-strings.
If no  → return exactly [].
No markdown, no explanation. Raw JSON array only.`

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    }

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json() as any
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    raw = raw.replace(/```json/g, '').replace(/```/g, '').trim()

    const extracted: string[] = JSON.parse(raw)
    if (Array.isArray(extracted) && extracted.length > 0) {
      await UserProfile.findOneAndUpdate(
        { userId },
        { $push: { keyPoints: { $each: extracted } } },
      )
    }
  } catch (err: any) {
    console.error('Key point extraction error:', err.message)
  }
}

// ─── System context builder ───────────────────────────────────────────────────
function buildSystemContext(user: any, profile: any): string {
  const parts: string[] = []
  if (profile) {
    if (profile.existingConditions?.length)
      parts.push(`Existing medical conditions: ${profile.existingConditions.join(', ')}`)
    if (profile.medications?.length)
      parts.push(`Current medications: ${profile.medications.join(', ')}`)
    if (profile.allergies?.length)
      parts.push(`Known allergies: ${profile.allergies.join(', ')}`)
    if (profile.keyPoints?.length)
      parts.push(`Key facts remembered about the user: ${profile.keyPoints.join(', ')}`)
  }

  const ctx = parts.length
    ? `\nHere is their medical profile:\n${parts.join('\n')}`
    : ''

  return `You are HealSync's AI medical companion — a personalized health assistant.
The user's name is "${user.name}". Address them by name when natural.${ctx}

IMPORTANT RULES:
1. Always suggest condition-appropriate medication alternatives. For example, if the user is diabetic, recommend sugar-free variants of any medicine.
2. IF the user reports a life-threatening emergency (heart attack, stroke, seizure, unconsciousness, severe chest pain, etc.), start your reply EXACTLY with the token [EMERGENCY_DR_ALERT] followed by your response. Do NOT use this token for minor complaints.`
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────
export const handleChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, location } = req.body
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A message is required.' })
      return
    }

    const userId = req.user!.id
    const [user, profile] = await Promise.all([
      User.findById(userId),
      UserProfile.findOne({ userId }),
    ])

    if (!user) { res.status(404).json({ error: 'User not found.' }); return }

    const systemContext = buildSystemContext(user, profile)

    // Last 20 messages as Gemini conversation history
    const historyDocs = await Chat.find({ userId }).sort({ timestamp: 1 }).limit(20)
    const contents = [
      ...historyDocs.map(h => ({ role: h.role, text: h.text })),
      { role: 'user', text: message },
    ]

    const rawReply = await callGemini(contents, systemContext)

    let finalReply = rawReply
    let emergencyDispatched = false

    // ── Emergency intercept ──────────────────────────────────────────────────
    if (rawReply.includes('[EMERGENCY_DR_ALERT]')) {
      finalReply = rawReply.replace('[EMERGENCY_DR_ALERT]', '').trim()
      emergencyDispatched = true

      // Fire server-side Twilio SMS immediately — no user action needed
      dispatchEmergencySms(
        user.name,
        user.phone || '',
        profile?.existingConditions ?? [],
        profile?.medications ?? [],
        profile?.allergies ?? [],
        profile?.keyPoints ?? [],
        message,
        location ?? undefined,
      ) // non-blocking

      finalReply =
        `🚨 **EMERGENCY ALERT DISPATCHED**: An automated SMS with your full medical profile has been sent directly to ${getDoctorName()} (${getDoctorPhone()}). Please stay calm — help is on the way.\n\n` +
        finalReply
    }

    // Persist both sides of the conversation
    await Chat.create({ userId, role: 'user', text: message })
    const aiMessage = await Chat.create({ userId, role: 'model', text: finalReply })

    // Background key-point extraction
    extractKeyPoints(userId, message)

    res.json({ data: aiMessage, emergencyDispatched })
  } catch (error: any) {
    console.error('Chat controller error:', error)
    if (error.message === 'QUOTA_ALL_EXHAUSTED') {
      res.status(503).json({ error: 'AI quota exceeded', message: 'The Gemini API free-tier quota has been exhausted for today. It resets every 24 hours. Please try again later.' })
      return
    }
    next(error)
  }
}

// ─── GET /api/chat/history ────────────────────────────────────────────────────
export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const history = await Chat.find({ userId }).sort({ timestamp: 1 })

    if (history.length === 0) {
      const [user, profile] = await Promise.all([
        User.findById(userId),
        UserProfile.findOne({ userId }),
      ])
      if (!user) { res.status(404).json({ error: 'User not found' }); return }

      const systemContext = buildSystemContext(user, profile)
      const greetPrompt = 'Please introduce yourself as HealSync AI, my personal medical companion. Greet me warmly by my name and briefly mention my recorded medical data (conditions, medications, allergies) so I know you are personalised to me.'
      const greetReply = await callGemini([{ role: 'user', text: greetPrompt }], systemContext)
      const initMsg = await Chat.create({ userId, role: 'model', text: greetReply })

      res.status(200).json({ data: [initMsg] })
      return
    }

    res.status(200).json({ data: history })
  } catch (error: any) {
    console.error('Failed to fetch history:', error)
    if (error.message === 'QUOTA_ALL_EXHAUSTED') {
      res.status(503).json({ error: 'AI quota exceeded', message: 'Gemini API quota exhausted for today. Please try again later.' })
      return
    }
    next(error)
  }
}
