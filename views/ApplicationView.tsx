
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  CheckCircle2, 
  User, 
  FileCheck, 
  Send, 
  X, 
  Code, 
  Palette, 
  TrendingUp,
  FileIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Props {
  onCancel: () => void;
  onComplete: () => void;
}

type Step = 'info' | 'docs' | 'confirm';

const ApplicationView: React.FC<Props> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    track: '',
    cinFile: null as File | null,
    diplomaFile: null as File | null,
  });

  const [isDragging, setIsDragging] = useState<'cin' | 'diploma' | null>(null);

  // Validation renforcée avec trim() pour éviter les espaces seuls
  const isInfoValid = 
    formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.phone.trim() !== '' && 
    formData.track !== '';

  const isDocsValid = formData.cinFile !== null && formData.diplomaFile !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'cinFile' | 'diplomaFile') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleDrop = (e: React.DragEvent, field: 'cinFile' | 'diplomaFile') => {
    e.preventDefault();
    setIsDragging(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, [field]: e.dataTransfer.files[0] });
    }
  };

  const handleDragOver = (e: React.DragEvent, field: 'cin' | 'diploma') => {
    e.preventDefault();
    setIsDragging(field);
  };

  const removeFile = (field: 'cinFile' | 'diplomaFile') => {
    setFormData({ ...formData, [field]: null });
  };

  const formatFileSize = (size: number) => {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!isInfoValid || !isDocsValid) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Upload Files to Storage
      const cinRef = ref(storage, `applications/${formData.email}/cin_${Date.now()}_${formData.cinFile!.name}`);
      const diplomaRef = ref(storage, `applications/${formData.email}/diploma_${Date.now()}_${formData.diplomaFile!.name}`);

      const [cinSnapshot, diplomaSnapshot] = await Promise.all([
        uploadBytes(cinRef, formData.cinFile!),
        uploadBytes(diplomaRef, formData.diplomaFile!)
      ]);

      const [cinUrl, diplomaUrl] = await Promise.all([
        getDownloadURL(cinSnapshot.ref),
        getDownloadURL(diplomaSnapshot.ref)
      ]);

      // 2. Save Data to Firestore
      await addDoc(collection(db, 'applications'), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        track: formData.track,
        cinUrl,
        diplomaUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setStep('confirm');
    } catch (err: any) {
      console.error("Application submission error:", err);
      setError("Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'info' as Step, label: 'Informations', icon: User },
    { id: 'docs' as Step, label: 'Documents', icon: FileCheck },
    { id: 'confirm' as Step, label: 'Confirmation', icon: Send },
  ];

  const tracks = [
    { 
      id: 'code', 
      title: 'Fullstack & IA', 
      desc: 'Maîtrisez le développement web moderne et l\'IA.', 
      icon: Code,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'design', 
      title: 'UI/UX Design', 
      desc: 'Créez des interfaces sublimes et intuitives.', 
      icon: Palette,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'marketing', 
      title: 'Digital Marketing', 
      desc: 'Devenez expert en croissance et stratégie digitale.', 
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="h-screen bg-[#F4F7FE] flex flex-col items-center p-2 sm:p-4 md:p-8 lg:p-12 overflow-y-auto pt-4 md:pt-12">
      <button 
        onClick={onCancel} 
        disabled={loading}
        className="self-start mb-4 md:mb-8 flex items-center gap-2 text-[#A3AED0] font-black text-[9px] md:text-sm uppercase tracking-widest hover:text-[#4318FF] transition-all bg-white px-3 md:px-4 py-2 rounded-xl shadow-sm disabled:opacity-50"
      >
        <ChevronLeft size={16} className="md:w-5 md:h-5" /> Annuler
      </button>

      <div className="w-full max-w-5xl space-y-6 md:space-y-12 mb-12">
        {/* Stepper Component */}
        <div className="flex justify-between items-center relative max-w-3xl mx-auto mb-6 md:mb-20 px-2 sm:px-4">
          <div className="absolute top-[24px] md:top-[28px] left-[10%] w-[80%] h-[2px] bg-slate-200 z-0">
            <motion.div 
              className="h-full bg-[#4318FF]"
              initial={{ width: 0 }}
              animate={{ width: step === 'info' ? '0%' : step === 'docs' ? '50%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = steps.findIndex(st => st.id === step) > idx;
            
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 md:gap-4 min-w-[80px] md:min-w-[100px]">
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                  isActive ? 'bg-[#4318FF] text-white scale-110 ring-4 md:ring-8 ring-[#4318FF]/10' : 
                  isCompleted ? 'bg-green-500 text-white' : 'bg-white text-[#A3AED0]'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} className="md:w-6 md:h-6" /> : <Icon size={18} className="md:w-6 md:h-6" />}
                </div>
                <div className="text-center hidden sm:block">
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${isActive ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`}>
                    {s.label}
                  </span>
                  <span className={`text-[11px] font-bold ${isActive ? 'text-[#2B3674]' : 'text-[#A3AED0]'}`}>
                    {isActive ? 'Étape en cours' : isCompleted ? 'Terminé' : 'À venir'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[24px] md:rounded-[60px] shadow-2xl p-4 md:p-10 lg:p-16 border border-white relative"
        >
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {step === 'info' && (
            <div className="space-y-8">
              <div className="text-center mb-2">
                <h2 className="text-xl md:text-3xl font-black text-[#2B3674] tracking-tight mb-1">Parlez-nous de vous</h2>
                <p className="text-[#A3AED0] font-bold text-[10px] md:text-xs">Sélectionnez votre spécialisation et complétez votre profil.</p>
              </div>

              {/* Track Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {tracks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({...formData, track: t.id})}
                    className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] text-left transition-all duration-500 border-2 flex flex-col gap-2 md:gap-3 group relative overflow-hidden ${
                      formData.track === t.id 
                        ? 'bg-[#4318FF] border-[#4318FF] shadow-2xl scale-102 md:scale-105' 
                        : 'bg-white border-slate-50 hover:border-[#4318FF]/30 hover:shadow-xl'
                    }`}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors ${
                      formData.track === t.id ? 'bg-white/20 text-white' : t.color
                    }`}>
                      <t.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h4 className={`text-sm md:text-lg font-black mb-0.5 tracking-tight transition-colors ${
                        formData.track === t.id ? 'text-white' : 'text-[#2B3674]'
                      }`}>{t.title}</h4>
                      <p className={`text-[9px] md:text-[10px] font-bold leading-relaxed transition-colors ${
                        formData.track === t.id ? 'text-white/80' : 'text-[#A3AED0]'
                      }`}>{t.desc}</p>
                    </div>
                    {formData.track === t.id && (
                       <motion.div layoutId="track-check" className="absolute top-3 right-3 bg-white/20 p-1 rounded-full text-white">
                         <CheckCircle2 size={14} />
                       </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-slate-50">
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Prénom</label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Amine" 
                    className="w-full p-3 md:p-4 bg-[#F4F7FE] border-none rounded-xl md:rounded-2xl outline-none font-bold text-[#2B3674] focus:ring-4 ring-[#4318FF]/5 transition-all text-xs md:text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Nom</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Alami" 
                    className="w-full p-3 md:p-4 bg-[#F4F7FE] border-none rounded-xl md:rounded-2xl outline-none font-bold text-[#2B3674] focus:ring-4 ring-[#4318FF]/5 transition-all text-xs md:text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="amine@example.com" 
                    className="w-full p-3 md:p-4 bg-[#F4F7FE] border-none rounded-xl md:rounded-2xl outline-none font-bold text-[#2B3674] focus:ring-4 ring-[#4318FF]/5 transition-all text-xs md:text-sm" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] md:text-[9px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Téléphone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+212 6..." 
                    className="w-full p-3 md:p-4 bg-[#F4F7FE] border-none rounded-xl md:rounded-2xl outline-none font-bold text-[#2B3674] focus:ring-4 ring-[#4318FF]/5 transition-all text-xs md:text-sm" 
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 pt-2 pb-4">
                {!isInfoValid && (
                  <div className="flex items-center gap-2 text-red-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest animate-pulse">
                    <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> Tous les champs sont obligatoires
                  </div>
                )}
                <button 
                  disabled={!isInfoValid}
                  onClick={() => setStep('docs')}
                  className={`px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center gap-3 transition-all ${
                    isInfoValid ? 'bg-[#4318FF] text-white shadow-xl hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Suivant <ChevronRight size={16} className="md:w-4.5 md:h-4.5" />
                </button>
              </div>
            </div>
          )}

          {step === 'docs' && (
            <div className="space-y-6 md:space-y-12">
              <div className="text-center">
                <h2 className="text-xl md:text-4xl font-black text-[#2B3674] tracking-tight mb-2 md:mb-4">Dossier de Candidature</h2>
                <p className="text-[#A3AED0] font-bold text-[10px] md:text-base">Glissez-déposez vos documents officiels ci-dessous.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* CIN Upload Zone */}
                <div className="space-y-2 md:space-y-4">
                  <label className="text-[8px] md:text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Carte d'Identité Nationale (CIN)</label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'cin')}
                    onDragLeave={() => setIsDragging(null)}
                    onDrop={(e) => handleDrop(e, 'cinFile')}
                    className={`relative group border-2 border-dashed rounded-[24px] md:rounded-[40px] p-6 md:p-12 flex flex-col items-center justify-center transition-all min-h-[160px] md:min-h-[260px] ${
                    formData.cinFile ? 'border-green-500 bg-green-50/20' : 
                    isDragging === 'cin' ? 'border-[#4318FF] bg-[#4318FF]/5 scale-102 ring-8 ring-[#4318FF]/5' :
                    'border-slate-200 hover:border-[#4318FF] hover:bg-[#F4F7FE]'
                  }`}>
                    {formData.cinFile ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 w-full">
                        <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl"><FileIcon size={32} /></div>
                        <div>
                          <p className="font-black text-[#2B3674] truncate px-4 max-w-[200px] mx-auto">{formData.cinFile.name}</p>
                          <p className="text-[10px] font-bold text-[#A3AED0]">{formatFileSize(formData.cinFile.size)}</p>
                        </div>
                        <button onClick={() => removeFile('cinFile')} className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                          <X size={14} /> Supprimer
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div animate={isDragging === 'cin' ? { y: -10 } : { y: 0 }} className={`w-16 h-16 rounded-2xl bg-[#F4F7FE] flex items-center justify-center mb-4 transition-colors ${isDragging === 'cin' ? 'bg-[#4318FF]/10' : ''}`}>
                          <Upload className={`text-[#A3AED0] group-hover:text-[#4318FF] transition-all ${isDragging === 'cin' ? 'text-[#4318FF] scale-125' : ''}`} size={32} />
                        </motion.div>
                        <p className="text-sm font-bold text-[#2B3674] text-center mb-1">
                          {isDragging === 'cin' ? 'Relâchez pour ajouter' : 'Déposez votre CIN ici'}
                        </p>
                        <p className="text-xs font-bold text-[#A3AED0] text-center">Ou <span className="text-[#4318FF] cursor-pointer">cliquez pour choisir</span></p>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileChange(e, 'cinFile')}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Diploma Upload Zone */}
                <div className="space-y-2 md:space-y-4">
                  <label className="text-[8px] md:text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Dernier Diplôme ou Certificat</label>
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'diploma')}
                    onDragLeave={() => setIsDragging(null)}
                    onDrop={(e) => handleDrop(e, 'diplomaFile')}
                    className={`relative group border-2 border-dashed rounded-[24px] md:rounded-[40px] p-6 md:p-12 flex flex-col items-center justify-center transition-all min-h-[160px] md:min-h-[260px] ${
                    formData.diplomaFile ? 'border-green-500 bg-green-50/20' : 
                    isDragging === 'diploma' ? 'border-[#4318FF] bg-[#4318FF]/5 scale-102 ring-8 ring-[#4318FF]/5' :
                    'border-slate-200 hover:border-[#4318FF] hover:bg-[#F4F7FE]'
                  }`}>
                    {formData.diplomaFile ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 w-full">
                        <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl"><FileText size={32} /></div>
                        <div>
                          <p className="font-black text-[#2B3674] truncate px-4 max-w-[200px] mx-auto">{formData.diplomaFile.name}</p>
                          <p className="text-[10px] font-bold text-[#A3AED0]">{formatFileSize(formData.diplomaFile.size)}</p>
                        </div>
                        <button onClick={() => removeFile('diplomaFile')} className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                          <X size={14} /> Supprimer
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div animate={isDragging === 'diploma' ? { y: -10 } : { y: 0 }} className={`w-16 h-16 rounded-2xl bg-[#F4F7FE] flex items-center justify-center mb-4 transition-colors ${isDragging === 'diploma' ? 'bg-[#4318FF]/10' : ''}`}>
                          <Upload className={`text-[#A3AED0] group-hover:text-[#4318FF] transition-all ${isDragging === 'diploma' ? 'text-[#4318FF] scale-125' : ''}`} size={32} />
                        </motion.div>
                        <p className="text-sm font-bold text-[#2B3674] text-center mb-1">
                          {isDragging === 'diploma' ? 'Relâchez pour ajouter' : 'Déposez votre Diplôme'}
                        </p>
                        <p className="text-xs font-bold text-[#A3AED0] text-center">Ou <span className="text-[#4318FF] cursor-pointer">cliquez pour choisir</span></p>
                        <input 
                          type="file" 
                          onChange={(e) => handleFileChange(e, 'diplomaFile')}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4 pt-6 md:pt-10 border-t border-slate-50 pb-6">
                {!isDocsValid && (
                  <div className="flex items-center gap-2 text-red-500 font-bold text-[9px] md:text-[11px] uppercase tracking-widest animate-pulse">
                    <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> Veuillez fournir les deux documents requis
                  </div>
                )}
                <div className="flex justify-between w-full">
                  <button 
                    onClick={() => setStep('info')}
                    disabled={loading}
                    className="px-6 md:px-10 py-4 md:py-6 text-[#A3AED0] font-black uppercase tracking-widest text-[10px] md:text-xs hover:text-[#2B3674] transition-colors disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button 
                    disabled={!isDocsValid || loading}
                    onClick={handleSubmit}
                    className={`px-8 md:px-12 py-4 md:py-6 rounded-xl md:rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-3 transition-all ${
                      isDocsValid && !loading ? 'bg-[#4318FF] text-white shadow-xl hover:shadow-[#4318FF]/30 hover:scale-105 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin md:w-4.5 md:h-4.5" /> : <Send size={16} className="md:w-4.5 md:h-4.5" />}
                    {loading ? "Envoi en cours..." : "Finaliser & Envoyer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'confirm' && (
              <div className="space-y-6 md:space-y-10 py-8 md:py-16">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 100 }}
                  className="w-24 h-24 md:w-32 md:h-32 bg-green-500 text-white rounded-[32px] md:rounded-[40px] flex items-center justify-center mx-auto shadow-2xl relative"
                >
                  <CheckCircle2 size={48} className="md:w-16 md:h-16" />
                  <motion.div 
                    className="absolute inset-0 rounded-[32px] md:rounded-[40px] bg-green-500"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black text-[#2B3674] tracking-tight">Candidature Reçue !</h2>
                  <p className="text-lg md:text-xl text-[#A3AED0] font-bold max-w-lg mx-auto leading-relaxed px-4">
                    Merci <span className="text-[#4318FF]">{formData.firstName}</span>. Votre dossier est maintenant entre les mains de nos coachs. Surveillez votre boîte email !
                  </p>
                </div>
                <div className="pt-6 md:pt-10">
                  <button 
                    onClick={onComplete}
                    className="px-12 md:px-16 py-5 md:py-6 bg-[#2B3674] text-white rounded-[24px] md:rounded-[32px] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl active:scale-95 transition-all hover:bg-[#1a214d]"
                  >
                    Fermer
                  </button>
                </div>
              </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ApplicationView;
