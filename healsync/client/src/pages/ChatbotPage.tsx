import { useState, useRef, useEffect } from 'react';
import { PageHeader, DisclaimerBanner } from '../components/ui';
import { Send, Bot, Sparkles, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const SUGGESTED_PROMPTS = [
  "How is my wellness trending this week?",
  "Give me a tip to sleep better",
  "I am feeling stressed, what should I do?",
  "What breathing exercise is best for anxiety?",
  "How much water should I be drinking?",
];

function getMockResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('sleep') || msg.includes('tired')) {
    return `Getting good sleep is so important! Here are
      a few evidence-based tips:\n\n• Stick to a consistent
      bedtime — even on weekends\n• Avoid screens 30 minutes
      before bed\n• Keep your room cool (around 18°C)\n•
      Try the 4-7-8 breathing technique to fall asleep
      faster\n\nWould you like to try a breathing exercise
      right now?`;
  }
  if (msg.includes('stress') || msg.includes('anxious') || msg.includes('anxiety')) {
    return `I hear you — stress can feel overwhelming.
      A few things that can help right now:\n\n•
      Take 5 slow deep breaths — inhale 4s, hold 4s,
      exhale 4s\n• Write down what is on your mind
      in your journal\n• Go for a short 10-minute walk\n\n
      Remember: it is okay to not be okay. If stress
      persists, talking to a professional can really help.`;
  }
  if (msg.includes('water') || msg.includes('hydrat')) {
    return `Great question! The general recommendation is
      2–2.5 litres of water per day, but this varies
      based on your weight, activity level, and climate.
      \n\nA good rule: drink a glass of water when you
      wake up, before each meal, and before bed. Your
      HealSync goal is set to 2.5L — you can track your
      intake in your daily check-in! 💧`;
  }
  if (msg.includes('breath') || msg.includes('calm')) {
    return `Breathing exercises are one of the fastest
      ways to calm your nervous system. I recommend
      starting with Box Breathing:\n\n• Inhale for 4s\n•
      Hold for 4s\n• Exhale for 4s\n• Hold for 4s\n\n
      Repeat 4 times. It only takes 2 minutes and the
      effects are immediate. Want me to take you to
      the breathing exercise now?`;
  }
  if (msg.includes('mood') || msg.includes('feeling') || msg.includes('depress') || msg.includes('sad')) {
    return `Thank you for sharing that with me. Your
      feelings are valid.\n\nBased on your recent
      check-ins, your mood has been in the moderate
      range. A few things that can help:\n\n• Journaling
      — writing can help process emotions\n• Physical
      movement — even a short walk lifts mood\n• Social
      connection — reaching out to someone you trust\n\n
      If you have been feeling low for more than two
      weeks, please consider speaking to a mental health
      professional. 💙`;
  }
  if (msg.includes('wellness') || msg.includes('score') || msg.includes('progress') || msg.includes('trend')) {
    return `Your current wellness score is 67/100 —
      which puts you in the "needs attention" zone.
      The main areas pulling your score down are sleep
      and stress levels.\n\nHere is what I suggest:\n\n
      1. Prioritise 7–8 hours of sleep tonight\n
      2. Try a 5-minute breathing exercise today\n
      3. Drink at least 2 glasses more water today\n\n
      Small consistent actions add up! 🌿`;
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! 😊 Great to hear from you. How are
      you feeling today? You can ask me anything about
      your health, get wellness tips, or just chat
      about how your day is going.`;
  }

  return `That is a great question. While I am still
    learning to give fully personalised answers, here
    is what I can suggest:\n\n• Log your daily check-in
    to help me understand your patterns\n• Check your
    analytics page to see your trends\n• Browse the
    self-care section for evidence-based tips\n\nIs
    there something specific I can help you with? 🌿`;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  
  const INITIAL_MESSAGES: Message[] = [
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${user?.name || 'there'}! 👋 I am HealSync AI, your personal
wellness companion. I am here to help you with
health tips, answer questions about your progress,
and support your mental wellbeing.\n\nWhat would
you like to talk about today?`,
      timestamp: new Date(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;
    await new Promise(r => setTimeout(r, delay));

    const response = getMockResponse(content);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto page-enter pb-10 mt-6 px-1">
      <PageHeader
        title="AI Wellness Assistant"
        subtitle="Powered by HealSync AI · Beta"
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 border border-amber-200 dark:border-amber-800 flex gap-3 items-start">
        <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            AI features coming soon
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            This is a preview with rule-based responses. Full AI integration with Claude will be available in the next update.
          </span>
        </div>
      </div>

      <div className="card flex flex-col p-0 overflow-hidden h-[500px] md:h-[560px]">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-mint-50 to-calm-50 dark:from-mint-900/10 dark:to-calm-900/10">
          <div className="w-9 h-9 rounded-xl bg-mint-500 flex items-center justify-center shrink-0">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">HealSync AI</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-mint-400" />
              <span className="text-xs text-gray-400">Online · Beta</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2.5'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-mint-600 dark:text-mint-400" />
                </div>
              )}
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`text-sm px-4 py-2.5 ${m.role === 'user' ? 'bg-mint-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl rounded-tl-sm whitespace-pre-wrap'}`}>
                  {m.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

        {messages.length <= 2 && !isTyping && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-xl cursor-pointer hover:border-mint-300 hover:text-mint-600 dark:hover:text-mint-400 dark:hover:border-mint-600 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

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
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="btn-ghost text-xs text-gray-400 flex items-center gap-1"
        >
          <RefreshCw size={12} />
          Clear chat
        </button>
      </div>

      <div className="mt-4">
        <DisclaimerBanner />
        <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
          <Lock size={10} />
          Conversations are not stored or sent to any server
        </div>
      </div>
    </div>
  );
}
