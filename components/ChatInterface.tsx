
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, CpuChipIcon } from './Icons';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSendMessage, isTyping, isLoading }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 flex flex-col h-[70vh] animate-fade-in" role="log">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-center text-slate-100">Follow-up Questions</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <CpuChipIcon className="w-8 h-8 p-1.5 rounded-full bg-cyan-500 text-slate-900 flex-shrink-0" role="img" aria-label="AI Assistant" />}
            <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-500 text-slate-900 rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-3 justify-start" role="status" aria-label="AI assistant is typing">
             <CpuChipIcon className="w-8 h-8 p-1.5 rounded-full bg-cyan-500 text-slate-900 flex-shrink-0" aria-hidden="true" />
            <div className="max-w-lg px-4 py-3 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-slate-700 flex items-center gap-4" aria-busy={isTyping}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about specs, use cases, or anything else..."
          disabled={isLoading || isTyping}
          aria-label="Your follow-up question"
          className="flex-1 bg-slate-700 text-slate-100 rounded-lg px-4 py-2 border-2 border-slate-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition duration-200"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isTyping}
          aria-label="Send message"
          className="p-2 bg-cyan-500 text-slate-900 rounded-full hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-6 h-6" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;