import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Button } from './ui/Button';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const QUICK_PROMPTS = [
  'What are the top threats right now?',
  'Why is INC-001 critical?',
  'Which assets are most affected?',
  'Summarise today\'s threat activity.',
  'Which MITRE techniques are appearing most frequently?',
  'Generate a commander briefing.',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  aiMode = 'DEMO',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Greetings, Analyst. I am Clarion\'s operational SOC AI assistant. I am continuously grounded in the live alert database, correlation clusters, and threat telemetry. How can I assist your investigation?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chatAI(query);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.response,
        sources: res.sources_cited,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error retrieving grounded intelligence: ${err.message || 'Check backend connection'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#091124] border border-slate-200 dark:border-cyan-500/40 rounded-2xl shadow-2xl w-full max-w-xl h-[92vh] flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-cyan-950 border border-blue-200 dark:border-cyan-500/60 flex items-center justify-center text-blue-700 dark:text-cyan-400 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                CLARION INTEL COPILOT
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-800 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/40 font-bold">
                  AI MODE: {aiMode}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Grounded in live operations database & multi-INT sensor feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {m.content}
              </div>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Grounding: {m.sources.join(', ')}</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-slate-900/60 p-3 rounded-xl border border-blue-200 dark:border-slate-800 max-w-[70%]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing live correlation clusters & threat feeds...</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 flex items-center gap-1 font-semibold">
            <Terminal className="w-3 h-3 text-blue-600 dark:text-cyan-400" /> Suggested Analyst Queries:
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="text-[11px] font-sans px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 shadow-sm dark:bg-slate-900 dark:hover:bg-cyan-950 dark:hover:text-cyan-300 dark:text-slate-300 dark:border-slate-800 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask question about active threats, assets, MITRE mapping..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
