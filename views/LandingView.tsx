
import React from 'react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props { onSetView: (v: ViewState) => void; }

const LandingView: React.FC<Props> = ({ onSetView }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 lg:p-12 text-center relative overflow-hidden">
    {/* Éléments de design en arrière-plan pour dynamiser la page */}
    <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-[#4318FF]/5 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-[#4318FF]/5 rounded-full blur-[120px]"></div>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="z-10 max-w-4xl"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4318FF]/5 text-[#4318FF] rounded-full mb-8">
        <Sparkles size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Inscriptions Ouvertes - Session 2025</span>
      </div>

      <div className="w-24 h-24 bg-[#4318FF] rounded-[40px] flex items-center justify-center text-white text-5xl font-black shadow-2xl mb-10 mx-auto transform hover:rotate-6 transition-transform cursor-default">
        S
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black text-[#2B3674] mb-6 sm:mb-8 tracking-tighter leading-[0.9]">
        <span className="text-[#4318FF]">StudyLink.</span>
      </h1>

      <p className="text-lg sm:text-xl lg:text-2xl text-[#A3AED0] font-bold mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
        Propulsez votre carrière avec une formation d'élite aux métiers du futur. 
        Un écosystème d'innovation soutenu par l'INDH.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
        <button 
          onClick={() => onSetView('apply')} 
          className="group w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 bg-[#4318FF] text-white rounded-[24px] sm:rounded-[32px] font-black text-lg sm:text-xl shadow-[0_20px_50px_rgba(67,24,255,0.3)] hover:shadow-[0_25px_60px_rgba(67,24,255,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-4"
        >
          Postuler maintenant
          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
        </button>
        
        <button 
          onClick={() => onSetView('login')} 
          className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-7 bg-white text-[#2B3674] border border-slate-200 rounded-[24px] sm:rounded-[32px] font-black text-lg sm:text-xl shadow-sm hover:bg-[#F4F7FE] transition-all"
        >
          Se Connecter
        </button>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
         <div className="font-black text-xl tracking-tighter">INDH</div>
         <div className="font-black text-xl tracking-tighter">FONDATION</div>
         <div className="font-black text-xl tracking-tighter">STUDYLINK HUB</div>
      </div>
    </motion.div>
  </div>
);

export default LandingView;
