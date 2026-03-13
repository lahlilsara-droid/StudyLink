import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, Send, X, User, Sparkles, Map, ChevronRight, CheckCircle2, GraduationCap, Trophy } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

interface OrientationResult {
  trackName: string;
  steps: string[];
  description: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', text: "Bonjour ! Je suis StudyLink AI, votre assistant d'excellence. Parlez-moi de vos passions : préférez-vous le code, le design ou le marketing ?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendation, setRecommendation] = useState<OrientationResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => { 
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
    }
  }, [messages, isTyping, recommendation]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input; 
    setInput(''); 
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tu es StudyLink AI, l'assistant intelligent de StudyLink (une école d'excellence au Maroc soutenue par l'INDH). 
        Réponds avec élégance, clarté et bienveillance.
        Si l'utilisateur exprime clairement une préférence pour un domaine (Code, Design, Marketing), termine ta réponse par le mot-clé "[RESULT_TRIGGER]".
        
        Question: ${currentInput}`,
      });
      
      const aiResponse = response.text || "Je n'ai pas pu générer de réponse.";
      
      // Simulation de détection de recommandation
      if (aiResponse.includes('[RESULT_TRIGGER]')) {
        const cleanedText = aiResponse.replace('[RESULT_TRIGGER]', '');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: cleanedText }]);
        
        // Déterminer le track pour la démo
        let track: OrientationResult = {
          trackName: "Fullstack & IA",
          description: "Le parcours d'excellence pour maîtriser le web moderne.",
          steps: ["Bootcamp Fondamentaux", "JavaScript Avancé & React", "IA & Backend Python", "Stage en Start-up"]
        };

        if (currentInput.toLowerCase().includes('design')) {
          track = {
            trackName: "UI/UX Design",
            description: "Créez des expériences utilisateurs sublimes et intuitives.",
            steps: ["Design Thinking", "Figma Expert", "Prototypage Interactif", "Portfolio Pro"]
          };
        } else if (currentInput.toLowerCase().includes('marketing')) {
          track = {
            trackName: "Marketing Digital",
            description: "Devenez le moteur de croissance des entreprises.",
            steps: ["Stratégie de Contenu", "SEO & Performance", "Data Analytics", "Growth Hacking"]
          };
        }

        setTimeout(() => setRecommendation(track), 1000);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: aiResponse }]);
      }
    } catch (e) { 
      console.error(e); 
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Service temporairement indisponible." }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-10 sm:right-10 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }} 
            className="w-full sm:w-[440px] h-[calc(100vh-100px)] sm:h-[700px] max-h-[800px] bg-white rounded-[32px] sm:rounded-[48px] shadow-[0_32px_64px_-16px_rgba(67,24,255,0.2)] border border-slate-100 flex flex-col overflow-hidden mb-4 sm:mb-6"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 bg-[#4318FF] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Bot size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm uppercase tracking-widest leading-none">StudyLink AI</p>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-[10px] font-bold opacity-60 mt-1.5 uppercase tracking-tighter">Votre Orientation Personnalisée</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Zone de Dialogue */}
            <div ref={scrollRef} className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-8 bg-[#F4F7FE]/40 scroll-smooth pb-12">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-[#4318FF] text-white' : 'bg-white text-[#4318FF]'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className={`max-w-[80%] p-5 rounded-[28px] text-sm font-bold shadow-sm leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#4318FF] text-white rounded-br-none' : 'bg-white text-[#2B3674] border border-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-end gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-white text-[#4318FF]">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white p-5 rounded-[28px] rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-[#4318FF] rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-[#4318FF] rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-[#4318FF] rounded-full" />
                  </div>
                </div>
              )}

              {/* RÉSULTAT FINAL: MAP D'ORIENTATION */}
              <AnimatePresence>
                {recommendation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-[40px] shadow-2xl border-4 border-[#4318FF]/10 overflow-hidden">
                      <div className="p-8 bg-gradient-to-br from-[#4318FF] to-[#868CFF] text-white">
                        <div className="flex items-center gap-3 mb-4">
                          <Trophy size={24} className="text-yellow-300" />
                          <h3 className="text-xl font-black uppercase tracking-tight">Votre Parcours Gagnant</h3>
                        </div>
                        <p className="text-4xl font-black mb-2">{recommendation.trackName}</p>
                        <p className="text-sm font-bold text-white/80">{recommendation.description}</p>
                      </div>
                      
                      <div className="p-8 space-y-6">
                        <div className="relative">
                          {recommendation.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-4 mb-6 relative z-10">
                              <div className="w-8 h-8 rounded-full bg-[#4318FF] text-white flex items-center justify-center text-xs font-black shadow-lg">
                                {idx + 1}
                              </div>
                              <p className="text-sm font-black text-[#2B3674]">{step}</p>
                            </div>
                          ))}
                          {/* Ligne pointillée décorative */}
                          <div className="absolute top-4 left-4 w-0.5 h-[calc(100%-32px)] border-l-2 border-dashed border-slate-200 z-0" />
                        </div>

                        <button 
                          className="w-full py-5 bg-[#4318FF] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                          Accepter cette orientation 
                          <CheckCircle2 size={18} className="group-hover:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[#A3AED0] font-bold text-[10px] uppercase tracking-widest">
                      <GraduationCap size={14} /> Une décision d'excellence INDH
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Zone de Saisie */}
            <div className="p-4 sm:p-8 bg-white flex gap-3 sm:gap-4 border-t border-slate-50 shrink-0">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  placeholder="Posez votre question à l'IA..." 
                  className="w-full pl-6 pr-14 py-5 bg-[#F4F7FE] rounded-3xl text-sm font-bold border-none outline-none focus:bg-white focus:ring-4 ring-[#4318FF]/5 transition-all placeholder:text-[#A3AED0] text-[#2B3674]" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none">
                  <Sparkles size={16} />
                </div>
              </div>
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isTyping}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  input.trim() && !isTyping ? 'bg-[#4318FF] text-white shadow-xl hover:scale-105 active:scale-90' : 'bg-slate-100 text-[#A3AED0] cursor-not-allowed'
                }`}
              >
                <Send size={22} className={input.trim() && !isTyping ? 'translate-x-0.5 -translate-y-0.5' : ''} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[32px] shadow-[0_20px_40px_rgba(67,24,255,0.3)] flex items-center justify-center transition-all duration-500 relative overflow-hidden group ${
          isOpen ? 'bg-[#2B3674]' : 'bg-[#4318FF]'
        }`}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X size={24} className="text-white relative z-10 sm:w-8 sm:h-8" /> : <MessageSquare size={24} className="text-white relative z-10 sm:w-8 sm:h-8" />}
      </motion.button>
    </div>
  );
};