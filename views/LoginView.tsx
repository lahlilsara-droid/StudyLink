
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';
import { Mail, Lock, ChevronLeft, Shield, User, GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface Props { onLogin: (role: UserRole) => void; onCancel: () => void; }

const LoginView: React.FC<Props> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    // Bypass Firebase Auth for demo mode to avoid 'admin-restricted-operation' error
    // if anonymous auth is not enabled in the console.
    onLogin(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        onLogin(userDoc.data().role as UserRole);
      } else {
        // Default to student if no doc exists
        onLogin('student');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4318FF]/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4318FF]/5 rounded-full blur-[100px]"></div>

      <button onClick={onCancel} className="absolute top-6 left-6 md:top-12 md:left-12 flex items-center gap-2 text-[#A3AED0] font-black text-[10px] md:text-sm uppercase tracking-widest hover:text-[#4318FF] transition-colors z-20">
        <ChevronLeft size={20} /> Retour
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-[90%] sm:max-w-md bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-6 md:p-8 text-center border border-white z-10"
      >
        <div className="w-14 h-14 bg-[#4318FF] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-xl shadow-[#4318FF]/20">S</div>
        
        <div className="mb-4">
          <h2 className="text-xl font-black mb-1 tracking-tight text-[#2B3674]">Espace StudyLink</h2>
          <p className="text-[#A3AED0] font-bold text-[9px] uppercase tracking-widest">Entrez vos identifiants</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Email</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: amine@alami.com"
                className="w-full py-3.5 pl-12 pr-6 bg-[#F4F7FE] border-none rounded-xl font-bold text-[#2B3674] focus:ring-2 ring-[#4318FF]/20 outline-none transition-all text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-3.5 pl-12 pr-12 bg-[#F4F7FE] border-none rounded-xl font-bold text-[#2B3674] focus:ring-2 ring-[#4318FF]/20 outline-none transition-all text-sm"
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A3AED0] hover:text-[#2B3674]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={!email || !password || loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              email && password && !loading ? 'bg-[#4318FF] text-white hover:shadow-2xl' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : "Se Connecter"}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-6 pt-4 border-t border-slate-50">
           <p className="text-[8px] font-black text-[#A3AED0] uppercase tracking-widest mb-3">Accès Rapide (Démo)</p>
           <div className="flex justify-center gap-3">
              <button 
                type="button"
                onClick={() => handleDemoLogin('student')} 
                disabled={loading}
                className="w-11 h-11 md:w-10 md:h-10 bg-[#F4F7FE] text-[#4318FF] rounded-xl flex items-center justify-center hover:bg-[#4318FF] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                <GraduationCap size={20} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button 
                type="button"
                onClick={() => handleDemoLogin('professor')} 
                disabled={loading}
                className="w-11 h-11 md:w-10 md:h-10 bg-[#F4F7FE] text-[#4318FF] rounded-xl flex items-center justify-center hover:bg-[#4318FF] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                <User size={20} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button 
                type="button"
                onClick={() => handleDemoLogin('admin')} 
                disabled={loading}
                className="w-11 h-11 md:w-10 md:h-10 bg-[#F4F7FE] text-[#4318FF] rounded-xl flex items-center justify-center hover:bg-[#4318FF] hover:text-white transition-all shadow-sm disabled:opacity-50"
              >
                <Shield size={20} className="md:w-[18px] md:h-[18px]" />
              </button>
           </div>
        </div>

        <p className="text-[9px] font-bold text-[#A3AED0] mt-8">StudyLink © 2025 • Écosystème d'Innovation INDH</p>
      </motion.div>
    </div>
  );
};

export default LoginView;
