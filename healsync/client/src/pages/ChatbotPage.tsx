import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, Sparkles, Lock, RefreshCw, MapPin } from 'lucide-react';
import { chatApi } from '../api';

interface Message {
  _id?: string;
  role: 'user' | 'model' | 'assistant' | 'system';
  text: string;
  timestamp?: string;
  isTyping?: boolean;
}


type Coords = { latitude: number; longitude: number } | null

function getLocation(): Promise<Coords> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      ()    => resolve(null),
      { timeout: 5000, maximumAge: 30000 }
    )
  })
}

export default function ChatbotPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build a context string from the user's profile to personalise AI responses
  function buildUserContext(): string {
    const parts: string[] = [];
    if (user?.name) parts.push(`User name: ${user.name}`);
    if (profile) {
      if (profile.age)               parts.push(`Age: ${profile.age}`);
      if (profile.gender)            parts.push(`Gender: ${profile.gender}`);
      if (profile.heightCm)          parts.push(`Height: ${profile.heightCm}cm`);
      if (profile.weightKg)          parts.push(`Weight: ${profile.weightKg}kg`);
      if (profile.sleepHours)        parts.push(`Sleep target: ${profile.sleepHours} hrs/night`);
      if (profile.activityLevel)     parts.push(`Activity level: ${profile.activityLevel}`);
      if (profile.waterIntakeLiters) parts.push(`Water intake goal: ${profile.waterIntakeLiters}L/day`);
      if (profile.dietPreference)    parts.push(`Diet: ${profile.dietPreference}`);
      if (profile.stressLevel)       parts.push(`Stress level: ${profile.stressLevel}/10`);
      if (profile.moodBaseline)      parts.push(`Mood baseline: ${profile.moodBaseline}/10`);
      if (profile.workStudyHours)    parts.push(`Work/study: ${profile.workStudyHours} hrs/day`);
      if (profile.mainGoal)          parts.push(`Main health goal: ${profile.mainGoal}`);
      if (profile.existingConditions?.length) {
        parts.push(`Health conditions: ${Array.isArray(profile.existingConditions)
          ? profile.existingConditions.join(', ')
          : profile.existingConditions}`);
      }
    }
    return parts.join('\n');
  }

  useEffect(() => {
    loadHistory()
  }, []);

  const loadHistory = async () => {
    try {
      setIsTyping(true)
      const historyRes = await chatApi.getHistory()
      if (historyRes && Array.isArray(historyRes)) {
        setMessages(historyRes)
      }
    } catch (err) {
      console.error("Failed to load chat history:", err)
    } finally {
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      text: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Grab live GPS coords silently before every send (used in emergency SMS)
    const coords = await getLocation()
    if (coords) setLocationShared(true)

    try {
      const userContext = buildUserContext();
      const response = await chatApi.sendMessage(content, coords ?? undefined, userContext || undefined)
      if (response?.emergencyDispatched) setEmergencyActive(true)
      if (response?.data) setMessages(prev => [...prev, response.data])
    } catch (err: any) {
      console.error("Failed to send message:", err)
      const isQuota = err?.response?.status === 503 || err?.response?.data?.error === 'AI quota exceeded'
      setMessages(prev => [...prev, {
        role: 'model',
        text: isQuota
          ? "⏳ The Gemini AI free-tier quota has been exhausted for today. It automatically resets every 24 hours. Please try again later!"
          : "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
      }])
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    // We could add a clear chat API if needed, for now we just clear the local state
    setMessages([]);
    loadHistory(); // this will generate a new greeting if history was cleared on server, else it just reloads
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl px-3 py-2 mb-2 border border-mint-200 dark:border-mint-800 flex gap-2 items-center">
        <Sparkles size={13} className="text-mint-500 shrink-0" />
        <span className="text-xs text-mint-700 dark:text-mint-400">
          Powered by <strong>Gemini 3.0</strong> · Personalized to your health profile
        </span>
      </div>

      {emergencyActive && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-xl p-3 mb-4 flex gap-3 items-start">
          <span className="text-red-500 text-lg shrink-0">🚨</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-red-700 dark:text-red-300">Emergency SMS Dispatched Automatically</span>
            <span className="text-xs text-red-600 dark:text-red-400">
              Your full medical profile {locationShared ? '+ live location' : ''} has been sent directly to <strong>Dr Sharan (+918856853522)</strong>. No action required — help has been alerted.
            </span>
            {locationShared && (
              <span className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> Live GPS coordinates included in the alert
              </span>
            )}
          </div>
        </div>
      )}

      <div className="card flex flex-col p-0 overflow-hidden flex-1 min-h-0">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-mint-50 to-calm-50 dark:from-mint-900/10 dark:to-calm-900/10">
          <div className="w-9 h-9 rounded-xl bg-mint-500 flex items-center justify-center shrink-0">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">HealSync AI</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mint-400" />
              <span className="text-xs text-gray-400">Online</span>
              {locationShared && (
                <span className="flex items-center gap-0.5 text-xs text-mint-500">
                  <MapPin size={9} /> Location active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div key={m._id || idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2.5'}`}>
              {(m.role === 'assistant' || m.role === 'model') && (
                <div className="w-7 h-7 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-mint-600 dark:text-mint-400" />
                </div>
              )}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} ${m.role === 'user' ? 'max-w-[75%]' : 'max-w-[92%]'}`}>
                <div className={`text-sm px-4 py-2.5 ${m.role === 'user' ? 'bg-mint-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl rounded-tl-sm whitespace-pre-wrap'}`}>
                  {m.text?.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-mint-600 dark:text-mint-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>


        <div className="flex items-end gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <textarea
            className="flex-1 input resize-none"
            rows={1}
            style={{ maxHeight: '96px' }}
            placeholder="Ask me anything about your health..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-mint-500 flex items-center justify-center shrink-0 hover:bg-mint-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={clearChat}
          className="btn-ghost text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          <RefreshCw size={12} />
          Reload chat history
        </button>
      </div>

      <div className="mt-4">

        <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
          <Lock size={10} />
          Conversations are processed strictly using secure AI models to provide insights
        </div>
      </div>
    </div>
  );
}
