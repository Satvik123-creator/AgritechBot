import React, { useState } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

export default function Chatbot() {
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: 'Namaste! I am Anaaj.ai your personal farming assistant. How can I help you regarding crop health, soil preparation, or weather forecasts today?' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: 'user', text: inputMsg }]);
    setInputMsg('');
    setIsTyping(true);
    
    // Mock response delay
    setTimeout(() => {
      setMessages(m => [
        ...m, 
        { 
          role: 'assistant', 
          text: 'I am analyzing local satellite data relative to your request... It appears you have heavy rain scheduled for the coming week. Have you prepared proper bed drainage?' 
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 bg-surface flex flex-col md:flex-row pb-10">
      
      {/* Sidebar History Menu (Hidden on mobile) */}
      <div className="hidden md:flex flex-col w-80 bg-surface-container-low border-r border-outline-variant/20 p-6 min-h-[calc(100vh-5rem)] shadow-inner">
        <button className="flex items-center justify-center gap-2 bg-primary text-on-primary w-full px-4 py-4 rounded-xl font-bold hover:scale-[1.02] shadow-xl transition-all mb-8">
          <span className="material-symbols-outlined text-tertiary-fixed">add</span>
          New Diagnosis
        </button>
        
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 font-label">Recent History</p>
        <div className="space-y-3 overflow-y-auto flex-1 no-scrollbar">
          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors shadow-sm">
            <p className="text-sm font-bold text-on-surface truncate">Wheat Leaf Yellowing</p>
            <p className="text-xs text-on-surface-variant mt-1 font-label">2 days ago</p>
          </div>
          <div className="p-4 rounded-2xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <p className="text-sm font-bold text-on-surface truncate">Soil Moisture Check</p>
            <p className="text-xs text-on-surface-variant mt-1 font-label">5 days ago</p>
          </div>
          <div className="p-4 rounded-2xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <p className="text-sm font-bold text-on-surface truncate">Tomato Blight Symptoms</p>
            <p className="text-xs text-on-surface-variant mt-1 font-label">Last week</p>
          </div>
        </div>
      </div>
      
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 h-[calc(100vh-5rem-40px)]">
         
         {/* Chat Feed */}
         <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6 pr-2">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'assistant' ? 'bg-tertiary-container' : 'bg-surface-container-highest'}`}>
                 {msg.role === 'assistant' ? (
                   <span className="material-symbols-outlined text-tertiary-fixed font-bold text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                 ) : (
                   <span className="material-symbols-outlined text-on-surface-variant">person</span>
                 )}
               </div>
               
               <div className={`p-5 rounded-[1.5rem] shadow-sm max-w-[85%] text-[15px] leading-relaxed ${
                 msg.role === 'assistant' 
                  ? 'bg-surface-container-lowest border border-outline-variant/10 text-on-surface rounded-tl-none' 
                  : 'bg-primary text-on-primary rounded-tr-none'
               }`}>
                 {msg.text}
               </div>
             </div>
           ))}
           
           {isTyping && (
             <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-tertiary-container shadow-sm">
                 <span className="material-symbols-outlined text-tertiary-fixed font-bold text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
               </div>
               <div className="p-5 rounded-[1.5rem] bg-surface-container-lowest border border-outline-variant/10 text-on-surface flex gap-2 items-center rounded-tl-none">
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
           )}
         </div>

         {/* Chat Input Bar */}
         <div className="pt-4">
           <form onSubmit={handleSend} className="relative flex items-center">
              <button type="button" className="absolute left-4 text-on-surface-variant hover:text-primary transition-colors">
                <Paperclip size={22} strokeWidth={2.5} />
              </button>
              
              <input 
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Message AgriBot AI..."
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl py-5 pl-14 pr-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-on-surface transition-all shadow-inner font-body"
              />
              
              <div className="absolute right-2 flex items-center gap-1">
                <button type="button" className="p-3 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-full">
                  <Mic size={22} strokeWidth={2.5} />
                </button>
                <button 
                  type="submit" 
                  disabled={!inputMsg.trim()}
                  className="p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                >
                  <Send size={20} className="ml-1 mt-[2px]" strokeWidth={2.5} />
                </button>
              </div>
           </form>
           <p className="text-center font-label text-[10px] text-on-surface-variant mt-4 tracking-widest uppercase">
             AgriBot AI can make mistakes. Always physically verify crop conditions.
           </p>
         </div>

      </div>
    </div>
  );
}
