import { FormEvent, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import apiClient from '@/api/client';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!input.trim()) {
      setError('Please type a message first.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: input.trim(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chat', { message: userMessage.text });
      const replyText = response.data?.reply ?? 'No response from AI.';

      addMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: replyText,
      });
    } catch (err) {
      console.error(err);
      setError('Chat failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 page-enter">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="card p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-mint-500 p-3 text-white">
              <MessageSquare size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">AI Chat</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Type your question and continue the conversation in this page.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6 space-y-4 bg-white dark:bg-gray-900">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                Start the conversation by sending a message below.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === 'user'
                        ? 'rounded-3xl bg-mint-50 p-4 text-right text-gray-900 dark:bg-mint-900/10 dark:text-gray-100'
                        : 'rounded-3xl bg-gray-100 p-4 text-left text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    }
                  >
                    <p className="text-sm leading-6">{message.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card p-6 grid gap-4 bg-white dark:bg-gray-900">
            <Textarea
              label="Send a message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="How can I support your wellbeing today?"
              required
              maxLength={600}
              className="min-h-[120px]"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="self-end" rightIcon={<Send size={16} />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
