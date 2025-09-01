
import React from 'react';
import { useState } from 'react';
import { getDeviceComparison, startChatSession } from './services/geminiService';
import DeviceInputForm from './components/DeviceInputForm';
import ComparisonResultDisplay from './components/ComparisonResult';
import ChatInterface from './components/ChatInterface';
import Loader from './components/Loader';
import { CpuChipIcon } from './components/Icons';
import type { ComparisonResult, ChatState, ChatMessage } from './types';
import type { Chat } from '@google/genai';

const App: React.FC = () => {
  const [deviceOne, setDeviceOne] = useState<string>('');
  const [deviceTwo, setDeviceTwo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [chatState, setChatState] = useState<ChatState>({ instance: null, history: [], isTyping: false });

  const handleCompare = async () => {
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);
    setChatState({ instance: null, history: [], isTyping: false });

    try {
      const result = await getDeviceComparison(deviceOne, deviceTwo);
      setComparisonResult(result);

      const chatInstance = startChatSession(result.deviceOne.name, result.deviceTwo.name);
      setChatState({
        instance: chatInstance,
        history: [{ role: 'assistant', content: `Hi there! I've just compared the ${result.deviceOne.name} and ${result.deviceTwo.name}. Feel free to ask me any questions.` }],
        isTyping: false,
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!chatState.instance) return;

    const updatedHistory: ChatMessage[] = [...chatState.history, { role: 'user', content: message }];
    setChatState(prev => ({ ...prev, history: updatedHistory, isTyping: true }));

    try {
        const stream = await chatState.instance.sendMessageStream({ message });
        
        let assistantResponse = '';
        for await (const chunk of stream) {
            assistantResponse += chunk.text;
            // To avoid too many re-renders, you might update less frequently
            // For this app, updating per chunk is fine for a live effect.
            setChatState(prev => ({
                ...prev,
                history: [...updatedHistory, { role: 'assistant', content: assistantResponse }]
            }));
        }

    } catch (err) {
        console.error("Chat error:", err);
        const errorMsg = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." } as ChatMessage;
        setChatState(prev => ({ ...prev, history: [...updatedHistory, errorMsg] }));
    } finally {
        setChatState(prev => ({...prev, isTyping: false}));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto">
        <header className="text-center my-8">
            <div className="inline-flex items-center gap-3">
                <CpuChipIcon className="w-10 h-10 text-cyan-400"/>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
                    Device Duel
                </h1>
            </div>
            <p className="mt-2 text-lg text-slate-400">Instant Tech Comparisons</p>
        </header>

        <DeviceInputForm
          deviceOne={deviceOne}
          setDeviceOne={setDeviceOne}
          deviceTwo={deviceTwo}
          setDeviceTwo={setDeviceTwo}
          onCompare={handleCompare}
          isLoading={isLoading}
        />
        
        <div className="mt-10">
          {isLoading && !comparisonResult && <Loader message="Analyzing devices..." />}
          {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
          {comparisonResult && (
            <>
              <ComparisonResultDisplay result={comparisonResult} />
              <ChatInterface
                history={chatState.history}
                onSendMessage={handleSendMessage}
                isTyping={chatState.isTyping}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;