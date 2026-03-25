import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của hệ thống HAMS. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await apiClient.post('/ai/chat', {
        message: userMsg,
        history: messages.slice(1) // Don't send initial greeting
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, tôi gặp sự cố khi kết nối với máy chủ AI. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-[380px] h-[550px] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-purple-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">HAMS AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-[10px] uppercase font-black tracking-widest">Trực tuyến</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/20"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-700 text-primary border border-gray-100 dark:border-gray-600'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600 rounded-tl-none font-medium'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm">
                  <Loader2 className="animate-spin text-primary" size={16} />
                  <span className="text-xs font-bold text-gray-400">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white p-2 rounded-xl transition shadow-lg shadow-primary/20"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-3 font-bold uppercase tracking-tighter">Powered by HAMS AI Core & Google Gemini</p>
          </div>
        </div>
      )}

      {/* Bubble Toggle */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all group relative overflow-hidden active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <MessageSquare size={28} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-bounce"></div>
          
          <div className="absolute -left-full group-hover:left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 skew-x-12"></div>
        </button>
      )}
    </div>
  );
};
