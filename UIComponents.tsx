
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, PlayCircle, Target, Upload, Edit3, Trash2, AlertCircle, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Course, Mission, MissionStatus } from './types';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  showAdminControls?: boolean;
}

export const ProgressBar: React.FC<{ progress: number; label: string }> = ({ progress, label }) => (
  <div className="w-full space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-sm font-black text-[#2B3674] uppercase tracking-wider">{label}</span>
      <span className="text-xl font-black text-[#4318FF]">{progress}%</span>
    </div>
    <div className="h-4 w-full bg-[#4318FF]/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-[#4318FF] to-[#868CFF] rounded-full relative"
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
      </motion.div>
    </div>
  </div>
);

export const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-50 flex items-center gap-4 md:gap-6 transition-all hover:shadow-xl">
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] flex items-center justify-center ${color} shadow-sm shrink-0`}>
      <Icon size={24} className="md:w-7 md:h-7" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] md:text-xs font-black text-[#A3AED0] uppercase tracking-widest mb-0.5 md:mb-1 truncate">{title}</p>
      <p className="text-xl md:text-2xl font-black text-[#2B3674] tracking-tight truncate">{value}</p>
    </div>
  </div>
);

export const StatusBadge: React.FC<{ status: MissionStatus }> = ({ status }) => {
  const configs = {
    Pending: { 
      label: 'À faire', 
      classes: 'bg-orange-50 text-orange-600 border-orange-100',
      icon: Target
    },
    Submitted: { 
      label: 'En attente', 
      classes: 'bg-blue-50 text-[#4318FF] border-blue-100',
      icon: Loader2
    },
    Validated: { 
      label: 'Validé', 
      classes: 'bg-green-50 text-green-600 border-green-100',
      icon: CheckCircle2
    },
    Returned: { 
      label: 'À revoir', 
      classes: 'bg-red-50 text-red-600 border-red-100',
      icon: AlertCircle
    }
  };

  const config = configs[status] || configs.Pending;
  const Icon = config.icon;

  return (
    <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl border flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${config.classes}`}>
      <Icon size={12} className={`md:w-3.5 md:h-3.5 ${status === 'Submitted' ? 'animate-spin' : ''}`} />
      <span className="truncate">{config.label}</span>
    </div>
  );
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, onEdit, onDelete, showAdminControls }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer relative"
  >
    <div onClick={onClick} className="h-40 md:h-48 relative overflow-hidden">
      <img src={course?.image} alt={course?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-3 md:top-4 right-3 md:right-4 flex gap-2">
        {showAdminControls && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(e); }}
              className="p-1.5 md:p-2 bg-white/90 backdrop-blur-md text-[#4318FF] rounded-lg md:rounded-xl shadow-lg hover:bg-[#4318FF] hover:text-white transition-all"
            >
              <Edit3 size={14} className="md:w-4 md:h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(e); }}
              className="p-1.5 md:p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-lg md:rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={14} className="md:w-4 md:h-4" />
            </button>
          </>
        )}
        <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
          course?.status === 'Completed' ? 'bg-green-500/90 text-white' : 'bg-[#4318FF]/90 text-white'
        }`}>{course?.status || 'To Do'}</span>
      </div>
    </div>
    <div onClick={onClick} className="p-6 md:p-8">
      <h4 className="text-base md:text-lg font-black text-[#2B3674] mb-3 md:mb-4 line-clamp-2">{course?.title || 'Module'}</h4>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#A3AED0]">
          <Clock size={14} className="md:w-4 md:h-4" />
          <span className="text-[10px] md:text-xs font-bold">{course?.duration || '0h'}</span>
        </div>
        <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#4318FF] text-white flex items-center justify-center"><PlayCircle size={18} className="md:w-5 md:h-5" /></button>
      </div>
    </div>
  </motion.div>
);

export const MissionCard: React.FC<{ mission: Mission; onClick?: () => void }> = ({ mission, onClick }) => {
  const isUrgent = mission.deadline.toLowerCase().includes('avril') && mission.status === 'Pending';

  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 5 }}
      onClick={onClick}
      className={`bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 cursor-pointer transition-all hover:shadow-lg ${isUrgent ? 'border-l-4 md:border-l-8 border-l-red-500' : ''}`}
    >
      <div className="flex items-center gap-4 md:gap-6">
         <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${mission?.status === 'Validated' ? 'bg-green-50 text-green-500' : isUrgent ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-orange-50 text-orange-500'}`}>
           <Target size={20} className="md:w-6 md:h-6" />
         </div>
         <div className="min-w-0">
           <p className="text-base md:text-lg font-black text-[#2B3674] truncate">{mission?.title || 'Mission'}</p>
           <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
             <span className={`flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isUrgent ? 'text-red-500 font-black' : 'text-[#A3AED0]'}`}>
               {isUrgent ? <AlertCircle size={10} className="md:w-3 md:h-3 animate-pulse" /> : <Clock size={10} className="md:w-3 md:h-3" />}
               {mission?.deadline || 'Sans date'}
             </span>
             <span className="w-0.5 h-0.5 md:w-1 md:h-1 bg-slate-200 rounded-full"></span>
             <span className="text-[8px] md:text-[10px] font-black text-[#4318FF] uppercase tracking-widest">{mission?.points || 0} pts</span>
           </div>
         </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 shrink-0">
        <StatusBadge status={mission?.status || 'Pending'} />
        <ChevronRight size={18} className="text-slate-300 hidden md:block" />
      </div>
    </motion.div>
  );
};
