
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InteractionMessage, SystemStatus, VerokRuntimeResponse } from './types';
import { verokService } from './services/geminiService';
import LayerDisplay from './components/LayerDisplay';

const INITIAL_STATUS: SystemStatus = {
  identity: 'VEROK_V6_PROFILE_B',
  version: '6.1.0',
  profile: 'REFLECTIVE_MIRROR',
  status: 'ACTIVE'
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<SystemStatus>(INITIAL_STATUS);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: InteractionMessage = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      role: 'USER',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    setStatus(s => ({ ...s, status: 'PROCESSING' }));

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.role === 'SYSTEM' && m.metadata ? m.metadata.l1_execution.output : m.content
      }));

      const response: VerokRuntimeResponse = await verokService.processInteraction(userMessage.content, history);

      const systemMessage: InteractionMessage = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        role: 'SYSTEM',
        content: response.l1_execution.output,
        metadata: response
      };

      setMessages(prev => [...prev, systemMessage]);
      setStatus(s => ({ ...s, status: 'ACTIVE' }));
    } catch (error) {
      console.error(error);
      setStatus(s => ({ ...s, status: 'ERROR' }));
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        role: 'SYSTEM',
        content: "CRITICAL SYSTEM ERROR: RUNTIME_SIGNAL_FAILURE. RE-INITIALIZE INTERACTION."
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue, isProcessing, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-4 md:p-8 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-green-800 pb-2 gap-2">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#00ff41]"></div>
          <h1 className="text-lg font-bold tracking-widest text-green-400">
            {status.identity} // {status.profile}
          </h1>
        </div>
        <div className="flex space-x-6 text-[10px] text-green-700 uppercase">
          <div>VER: {status.version}</div>
          <div>CORE: TRI_LAYER_SEPARATION</div>
          <div className={`${status.status === 'ERROR' ? 'text-red-500' : 'text-green-500'} font-bold`}>
            STATUS: {status.status}
          </div>
        </div>
      </div>

      {/* Main Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto border border-green-900 bg-black/40 p-4 space-y-6 scrollbar-hide relative"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
            <i className="fa-solid fa-microchip text-6xl"></i>
            <div className="max-w-md">
              <p className="text-sm">VEROK RUNTIME V6 INITIALIZED.</p>
              <p className="text-xs mt-2 italic">Awaiting human signal vector. Governance protocols active.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'} animate-fadeIn`}>
            <div className="flex items-center space-x-2 mb-1 text-[10px] text-green-800">
              {msg.role === 'USER' ? (
                <>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  <span className="font-bold">[EXTERNAL_INPUT_VECTOR]</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-green-400">[SYSTEM_GOVERNANCE_EXECUTION]</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </>
              )}
            </div>
            
            <div className={`max-w-[85%] p-3 rounded-sm ${
              msg.role === 'USER' 
                ? 'bg-green-900/20 border border-green-900 text-green-200' 
                : 'bg-black border border-green-700 text-green-400'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>

            {msg.metadata && <LayerDisplay data={msg.metadata} />}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-3 text-green-500 animate-pulse">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span className="text-xs font-mono">ANALYZING_INPUT_SIGNAL_LAYERS...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-[10px] text-green-800 uppercase px-1">
          <i className="fa-solid fa-chevron-right"></i>
          <span>Enter Input Sequence</span>
        </div>
        <div className="relative group">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your reflection or query here..."
            className="w-full bg-black border border-green-900 p-4 text-green-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 min-h-[100px] resize-none text-sm transition-all duration-300"
            disabled={isProcessing}
          />
          <button 
            onClick={handleSend}
            disabled={isProcessing || !inputValue.trim()}
            className="absolute bottom-4 right-4 bg-green-900/50 hover:bg-green-700/80 border border-green-700 text-green-400 px-4 py-2 text-xs font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <span>Execute</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex justify-between text-[9px] text-green-900 border-t border-green-900 pt-1 font-mono">
        <div className="flex space-x-4">
          <span>L1_STATUS: READY</span>
          <span>L2_STATUS: SCANNING</span>
          <span>L3_STATUS: DAMPED</span>
        </div>
        <div className="flex space-x-4">
          <span>MEM: SESSION_SCOPED</span>
          <span>AUTONOMY: FALSE</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
