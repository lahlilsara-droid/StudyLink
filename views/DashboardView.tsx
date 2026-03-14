
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Target, User as UserIcon, LogOut, Bell, 
  Award, Clock, Star, Play, File, Globe, Check, ChevronLeft,
  Shield, Users, ClipboardList, Settings, TrendingUp, CheckCircle2, MessageSquare,
  Plus, X, Trash2, Edit3, Save, Upload, Zap, Calendar, ArrowRight, Info, Search, Filter, Book, CheckCircle,
  PlayCircle, AlertCircle, FileText, Send, Link as LinkIcon, Github, Trophy, Loader2, Share2, Briefcase, Code2, Sparkles, ExternalLink, FilterX,
  List, LayoutGrid, MoreHorizontal, Download, MessageCircle, StarHalf, Palette, Camera, Phone, Smartphone, Key, ShieldCheck, RefreshCw, Copy, ToggleLeft as Toggle, ChevronDown, UserCheck, Mail, UserPlus, Fingerprint, Microscope, GraduationCap as GradIcon, Globe2, Bot, Database, Layers, ChevronRight
} from 'lucide-react';
import { UserRole, Course, Lesson, Student, Mission, Resource, Notification, CourseStatus, MissionStatus, Lecturer, Session } from '../types';
import { COURSES, MISSIONS, NOTIFICATIONS, STUDENTS, LECTURERS, SESSIONS } from '../data';
import { StatCard, ProgressBar, CourseCard, MissionCard, StatusBadge } from '../UIComponents';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../firestoreUtils';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  setDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

interface Props { role: UserRole; userName: string; onLogout: () => void; onOpenChat: () => void; }

const DashboardView: React.FC<Props> = ({ role, userName, onLogout, onOpenChat }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [correctingMissionId, setCorrectingMissionId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'All'>('All');
  
  // Firestore State
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [localMissions, setLocalMissions] = useState<Mission[]>([]);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [localLecturers, setLocalLecturers] = useState<Lecturer[]>([]);
  const [localStudents, setLocalStudents] = useState<Student[]>([]);
  const [localSessions, setLocalSessions] = useState<Session[]>([]);
  const [localApplications, setLocalApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingCourse, setIsEditingCourse] = useState<Course | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [managingAccessLecturer, setManagingAccessLecturer] = useState<Lecturer | null>(null);
  const [isEditingMission, setIsEditingMission] = useState<Mission | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Real-time Sync
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setLocalCourses(data.length > 0 ? data : COURSES);
    }, (error) => {
      console.error("Courses listener error:", error);
      // Only report if it's not a permission error during logout/demo
      if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'courses');
    });

    const unsubMissions = onSnapshot(collection(db, 'missions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
      setLocalMissions(data.length > 0 ? data : MISSIONS);
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'missions');
    });

    const unsubNotifications = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Notification));
      setLocalNotifications(data.length > 0 ? data : NOTIFICATIONS);
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    let unsubUsers = () => {};
    if (role === 'admin') {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const students = allUsers.filter((u: any) => u.role === 'student').map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          track: u.track || 'N/A',
          progress: u.progress || 0,
          status: u.status || 'active',
          absences: u.absences || 0
        } as Student));
        const lecturers = allUsers.filter((u: any) => u.role === 'professor').map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          specialty: u.specialty || 'Expert',
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
          joinedDate: u.joinedDate || 'N/A'
        } as Lecturer));
        
        setLocalStudents(students.length > 0 ? students : STUDENTS);
        setLocalLecturers(lecturers.length > 0 ? lecturers : LECTURERS);
      }, (error) => {
        if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'users');
      });
    }

    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setLocalSessions(data.length > 0 ? data : SESSIONS);
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'sessions');
    });

    let unsubApplications = () => {};
    if (role === 'admin') {
      unsubApplications = onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocalApplications(data);
      }, (error) => {
        if (auth.currentUser) handleFirestoreError(error, OperationType.GET, 'applications');
      });
    }

    setLoading(false);

    return () => {
      unsubCourses();
      unsubMissions();
      unsubNotifications();
      unsubUsers();
      unsubSessions();
      unsubApplications();
    };
  }, [role, auth.currentUser?.uid]);

  const selectedCourse = localCourses.find(c => c.id === selectedCourseId);
  const selectedMission = localMissions.find(m => m.id === selectedMissionId);
  const correctingMission = localMissions.find(m => m.id === correctingMissionId);
  const unreadCount = localNotifications.filter(n => !n.read).length;

  const navigation = useMemo(() => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Pilotage', icon: TrendingUp },
          { id: 'admissions', label: 'Admissions', icon: ClipboardList },
          { id: 'users', label: 'Utilisateurs', icon: Users },
          { id: 'settings', label: 'Paramètres', icon: Settings },
        ];
      case 'professor':
        return [
          { id: 'dashboard', label: 'Mes Classes', icon: Users },
          { id: 'modules', label: 'Mes Modules', icon: BookOpen },
          { id: 'validations', label: 'Gestion Missions', icon: CheckCircle2 },
          { id: 'chat', label: 'Support', icon: MessageSquare },
        ];
      default: // student
        return [
          { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
          { id: 'modules', label: 'LMS / Modules', icon: BookOpen },
          { id: 'missions', label: 'Mes Missions', icon: Target },
          { id: 'portfolio', label: 'Mon Portfolio', icon: Briefcase },
        ];
    }
  }, [role]);

  const filteredCourses = useMemo(() => {
    return localCourses.filter(course => {
      const matchesSearch = course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [localCourses, searchQuery, statusFilter]);

  const toggleLessonCompletion = async (courseId: string, lessonId: string) => {
    const course = localCourses.find(c => c.id === courseId);
    if (!course) return;

    const updatedLessons = course.lessons.map(lesson => 
      lesson.id === lessonId ? { ...lesson, isCompleted: !lesson.isCompleted } : lesson
    );
    
    const allCompleted = updatedLessons.every(l => l.isCompleted);
    const someCompleted = updatedLessons.some(l => l.isCompleted);
    let newStatus: CourseStatus = 'To Do';
    if (allCompleted) newStatus = 'Completed';
    else if (someCompleted) newStatus = 'In Progress';

    try {
      await updateDoc(doc(db, 'courses', courseId), {
        lessons: updatedLessons,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const handleMissionSubmit = async (missionId: string) => {
    try {
      await updateDoc(doc(db, 'missions', missionId), {
        status: 'Submitted'
      });
      setSelectedMissionId(null);
      
      await addDoc(collection(db, 'notifications'), {
        title: 'Mission Soumise',
        message: 'Votre travail a été envoyé avec succès pour correction.',
        time: 'Maintenant',
        type: 'system',
        read: false,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
    } catch (error) {
      console.error("Error submitting mission:", error);
    }
  };

  const handleSaveMission = async (mission: Mission) => {
    try {
      if (mission.id && localMissions.find(m => m.id === mission.id)) {
        const { id, ...data } = mission;
        await updateDoc(doc(db, 'missions', id), data);
      } else {
        const { id, ...data } = mission;
        await addDoc(collection(db, 'missions'), data);
      }
      setIsEditingMission(null);
    } catch (error) {
      console.error("Error saving mission:", error);
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce défi ?")) {
      try {
        await deleteDoc(doc(db, 'missions', id));
      } catch (error) {
        console.error("Error deleting mission:", error);
      }
    }
  };

  const handleFinishCorrection = async (missionId: string, status: MissionStatus) => {
    try {
      await updateDoc(doc(db, 'missions', missionId), { status });
      setCorrectingMissionId(null);
      
      await addDoc(collection(db, 'notifications'), {
        title: 'Mission Corrigée',
        message: `Une mission vient d'être ${status === 'Validated' ? 'validée' : 'renvoyée'}.`,
        time: 'Maintenant',
        type: 'feedback',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error finishing correction:", error);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      // Note: This only adds to Firestore, not to Firebase Auth.
      // In a real app, you'd use a Cloud Function or Admin SDK to create the Auth user.
      const newUser = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        ...(userData.role === 'student' ? {
          track: userData.track || 'Non spécifié',
          progress: 0,
          status: 'active',
          absences: 0
        } : {
          specialty: userData.specialty || 'Expert',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
          joinedDate: new Date().toLocaleDateString()
        }),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'users'), newUser);
      
      setIsAddingUser(false);
      await addDoc(collection(db, 'notifications'), {
        title: 'Utilisateur Créé',
        message: `L'utilisateur ${userData.name} a été ajouté avec succès.`,
        time: 'Maintenant',
        type: 'system',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Voulez-vous peupler la base de données avec les données de démonstration ?")) return;
    
    try {
      setLoading(true);
      // Seed Students
      for (const student of STUDENTS) {
        await setDoc(doc(db, 'users', student.id), {
          name: student.name,
          email: student.email,
          role: 'student',
          track: student.track,
          progress: student.progress,
          status: student.status,
          absences: student.absences,
          createdAt: serverTimestamp()
        });
      }
      // Seed Lecturers
      for (const lecturer of LECTURERS) {
        await setDoc(doc(db, 'users', lecturer.id), {
          name: lecturer.name,
          email: lecturer.email,
          role: 'professor',
          specialty: lecturer.specialty,
          avatar: lecturer.avatar,
          joinedDate: lecturer.joinedDate,
          createdAt: serverTimestamp()
        });
      }
      alert("Données de démonstration ajoutées avec succès !");
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Erreur lors de l'ajout des données.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FE]">
        <Loader2 className="w-12 h-12 text-[#4318FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FE]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#2B3674]/80 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {!correctingMissionId && (
        <div className={`fixed inset-y-0 left-0 w-72 sidebar-purple text-white flex flex-col shrink-0 z-[110] transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 lg:p-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#4318FF] font-black text-2xl shadow-xl">S</div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tighter text-white leading-none">StudyLink</span>
                <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest mt-1">Espace Excellence</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 mt-4 lg:mt-8 space-y-1 lg:space-y-4 px-4 lg:px-0">
            {navigation.map(item => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); setSelectedCourseId(null); setSelectedMissionId(null); setIsEditingCourse(null); setIsCreatingNew(false); setIsMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-5 px-6 lg:px-10 py-4 lg:py-5 font-bold transition-all rounded-2xl lg:rounded-none ${activeTab === item.id ? 'active-pill text-[#4318FF]' : 'text-white/60 hover:text-white hover:bg-white/5 lg:hover:bg-transparent'}`}
              >
                <item.icon size={20} /> <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-8 lg:p-10 mt-auto">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-white/10 text-white/60 hover:bg-white hover:text-[#4318FF] font-black transition-all text-xs">
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative bg-[#F4F7FE]">
        {!correctingMissionId && (
          <div className="p-4 sm:p-6 md:p-10 lg:p-16">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-12 relative z-[60]">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#2B3674] shadow-sm">
                  <List size={24} />
                </button>
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-4xl font-black text-[#2B3674] tracking-tight uppercase tracking-tighter">
                    {selectedMissionId ? 'Détails de Mission' : selectedCourseId ? 'Détails du Module' : (navigation.find(n => n.id === activeTab)?.label || 'Overview')}
                  </h2>
                  <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] uppercase tracking-widest">
                    {role === 'admin' ? 'Espace Direction & Pilotage' : role === 'professor' ? 'Gestion de vos classes et promotions' : 'Interface d’apprentissage StudyLink'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-[#A3AED0] shadow-sm transition-all hover:scale-105 active:scale-95">
                  <Bell size={20} className="md:w-6 md:h-6" />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 md:top-3 md:right-3 w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>}
                </button>
                <div className="flex items-center gap-3 md:gap-4 cursor-pointer group" onClick={() => setShowProfile(true)}>
                  <div className="text-right">
                    <p className="text-xs md:text-sm font-black text-[#2B3674] group-hover:text-[#4318FF] transition-colors">{userName}</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">{role}</p>
                  </div>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-white shadow-md bg-white transition-transform group-hover:rotate-3" alt="avatar" />
                </div>
              </div>
            </header>

            {/* Notifications Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-4 md:right-16 top-24 md:top-32 w-80 md:w-96 bg-white rounded-[32px] shadow-2xl border border-slate-50 z-[100] overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-[#4318FF] text-white">
                    <h3 className="font-black uppercase tracking-widest text-xs">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="hover:rotate-90 transition-transform"><X size={18} /></button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {localNotifications.length > 0 ? localNotifications.map(n => (
                      <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white border-slate-50' : 'bg-[#F4F7FE] border-[#4318FF]/10'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-black text-[#2B3674] text-[10px] uppercase tracking-tight">{n.title}</p>
                          <span className="text-[8px] font-bold text-[#A3AED0]">{n.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-[#A3AED0] leading-relaxed">{n.message}</p>
                      </div>
                    )) : (
                      <div className="py-10 text-center space-y-2">
                        <Bell size={32} className="text-slate-200 mx-auto" />
                        <p className="text-xs font-bold text-[#A3AED0]">Aucune notification</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Modal */}
            <AnimatePresence>
              {showProfile && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(false)} className="absolute inset-0 bg-[#2B3674]/80 backdrop-blur-md" />
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[60px] shadow-2xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-[#4318FF] to-[#868CFF]" />
                    <div className="px-10 pb-10 -mt-16 text-center space-y-6">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} className="w-32 h-32 rounded-[40px] border-8 border-white bg-white shadow-2xl mx-auto" alt="profile" />
                      <div>
                        <h3 className="text-3xl font-black text-[#2B3674] tracking-tight">{userName}</h3>
                        <p className="text-sm font-bold text-[#A3AED0] uppercase tracking-widest">{role} StudyLink</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#F4F7FE] rounded-3xl border border-white">
                          <p className="text-xl font-black text-[#4318FF]">12</p>
                          <p className="text-[8px] font-bold text-[#A3AED0] uppercase tracking-widest">Badges</p>
                        </div>
                        <div className="p-4 bg-[#F4F7FE] rounded-3xl border border-white">
                          <p className="text-xl font-black text-[#2B3674]">85%</p>
                          <p className="text-[8px] font-bold text-[#A3AED0] uppercase tracking-widest">Score</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => setShowProfile(false)} className="w-full py-5 bg-[#F4F7FE] text-[#2B3674] rounded-[28px] font-black uppercase tracking-widest text-[10px] border border-white shadow-sm hover:bg-white transition-all">Fermer le profil</button>
                        <button 
                          onClick={() => {
                            setShowProfile(false);
                            onLogout();
                          }} 
                          className="w-full py-5 bg-red-50 text-red-600 rounded-[28px] font-black uppercase tracking-widest text-[10px] border border-red-100 shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={14} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && role === 'admin' && (
                <AdminTowerDashboard students={localStudents} sessions={SESSIONS} />
              )}

              {activeTab === 'dashboard' && role === 'professor' && (
                <ProfessorClassesView students={localStudents} sessions={SESSIONS} missions={localMissions} />
              )}

              {activeTab === 'validations' && role === 'professor' && (
                <ProfessorMissionCenter 
                   missions={localMissions} 
                   courses={localCourses}
                   onCorrect={(id) => setCorrectingMissionId(id)}
                   onEditMission={(m) => setIsEditingMission(m)}
                   onDeleteMission={handleDeleteMission}
                   onCreateMission={() => setIsEditingMission({ id: '', title: '', description: '', deadline: '2025-06-30', status: 'Pending', courseId: localCourses[0]?.id || '', points: 500 })}
                />
              )}

              {activeTab === 'chat' && <SupportView role={role} onOpenChat={onOpenChat} />}

              {activeTab === 'users' && role === 'admin' && (
                <AdminUsersView 
                  students={localStudents} 
                  lecturers={localLecturers} 
                  onManageAccess={(l) => setManagingAccessLecturer(l)}
                  onAddUser={() => setIsAddingUser(true)}
                  onSeedData={handleSeedData}
                />
              )}

              {activeTab === 'dashboard' && role === 'student' && !selectedCourseId && !selectedMissionId && (
                <StudentDashboard 
                  userName={userName}
                  courses={localCourses} 
                  missions={localMissions}
                  onResumeCourse={(id) => { setSelectedCourseId(id); setActiveTab('modules'); }} 
                  onSelectMission={(id) => { setSelectedMissionId(id); setActiveTab('missions'); }}
                />
              )}
              
              {activeTab === 'missions' && role === 'student' && !selectedMissionId && (
                <motion.div key="missions-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10 pb-20">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-[#4318FF]/5 text-[#4318FF] flex items-center justify-center">
                            <Target size={24} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-[#2B3674] tracking-tight uppercase">Mes Défis Excellence</h3>
                            <p className="text-xs font-bold text-[#A3AED0]">Construisez votre portfolio à travers ces projets</p>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                     {localMissions.map(mission => (
                         <MissionCard 
                          key={mission.id} 
                          mission={mission} 
                          onClick={() => setSelectedMissionId(mission.id)} 
                         />
                      ))}
                   </div>
                </motion.div>
              )}

              {selectedMissionId && selectedMission && (
                <MissionDetailView 
                  mission={selectedMission} 
                  onBack={() => setSelectedMissionId(null)} 
                  onSubmit={() => handleMissionSubmit(selectedMission.id)}
                />
              )}

              {activeTab === 'modules' && !selectedCourseId && (
                <div className="space-y-10">
                  {role === 'professor' && (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setIsEditingCourse({ id: '', title: '', description: '', lessons: [], status: 'Draft', points: 1000 })}
                        className="px-10 py-5 bg-[#4318FF] text-white rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#4318FF]/20 flex items-center gap-3 hover:scale-105 transition-all"
                      >
                        <Plus size={18} /> Créer un nouveau module
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                     {filteredCourses.length > 0 ? filteredCourses.map(course => (
                       <CourseCard 
                         key={course.id} 
                         course={course} 
                         onClick={() => setSelectedCourseId(course.id)} 
                         showAdminControls={role === 'professor'}
                       />
                     )) : (
                       <div className="col-span-full py-20 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                          <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
                          <h4 className="text-xl font-black text-[#2B3674] uppercase">Aucun module trouvé</h4>
                          <p className="text-sm font-bold text-[#A3AED0]">Commencez par ajouter des modules ou changez vos filtres.</p>
                       </div>
                     )}
                  </div>
                </div>
              )}

              {selectedCourseId && selectedCourse && (
                <CourseDetailView 
                  course={selectedCourse} 
                  onBack={() => setSelectedCourseId(null)} 
                  onToggleCompletion={(lessonId) => toggleLessonCompletion(selectedCourse.id, lessonId)}
                />
              )}

              {activeTab === 'portfolio' && role === 'student' && (
                <StudentPortfolioView 
                  userName={userName}
                  missions={localMissions} 
                  onShare={() => setCopyFeedback(true)} 
                  onViewProject={(id) => { setSelectedMissionId(id); setActiveTab('missions'); }}
                />
              )}

              {activeTab === 'admissions' && role === 'admin' && <AdminAdmissions applications={localApplications} />}
              
              {activeTab === 'settings' && <GlobalSettings role={role} />}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
               {managingAccessLecturer && (
                 <ManageAccessModal 
                   lecturer={managingAccessLecturer}
                   onClose={() => setManagingAccessLecturer(null)}
                 />
               )}
               {isEditingMission && (
                 <MissionEditorModal 
                    mission={isEditingMission}
                    courses={localCourses}
                    onClose={() => setIsEditingMission(null)}
                    onSave={handleSaveMission}
                 />
               )}
               {isAddingUser && (
                 <AddUserModal 
                    onClose={() => setIsAddingUser(false)}
                    onSave={handleAddUser}
                 />
               )}
            </AnimatePresence>
          </div>
        )}

        {correctingMissionId && correctingMission && (
          <ProfessorCorrectionView 
            mission={correctingMission} 
            onCancel={() => setCorrectingMissionId(null)}
            onFinish={(status) => handleFinishCorrection(correctingMission.id, status)}
          />
        )}
      </main>
    </div>
  );
};

// --- MODAL : AJOUTER UN UTILISATEUR ---

const AddUserModal: React.FC<{ onClose: () => void, onSave: (u: any) => void }> = ({ onClose, onSave }) => {
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [extra, setExtra] = useState('');

  const isValid = name.trim() !== '' && email.trim() !== '' && email.includes('@');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2B3674]/80 backdrop-blur-md" />
       <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-full">
          <div className="p-10 bg-[#4318FF] text-white flex justify-between items-center shrink-0">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10"><UserPlus size={28} /></div>
                <div>
                   <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Nouvel Utilisateur</h3>
                   <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-2">Expansion de l'écosystème Excellence</p>
                </div>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"><X size={28} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
             <div className="flex bg-[#F4F7FE] p-1.5 rounded-[32px] max-w-fit mx-auto mb-4">
                <button 
                  onClick={() => setRole('student')}
                  className={`px-10 py-4 rounded-[26px] text-xs font-black uppercase tracking-widest transition-all ${role === 'student' ? 'bg-white text-[#4318FF] shadow-xl' : 'text-[#A3AED0]'}`}
                >
                   Apprenant
                </button>
                <button 
                  onClick={() => setRole('professor')}
                  className={`px-10 py-4 rounded-[26px] text-xs font-black uppercase tracking-widest transition-all ${role === 'professor' ? 'bg-white text-[#4318FF] shadow-xl' : 'text-[#A3AED0]'}`}
                >
                   Intervenant
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Nom Complet</label>
                   <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none focus:ring-4 ring-[#4318FF]/5" 
                      placeholder="Ex: Yasmine Alami"
                   />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Email Institutionnel</label>
                   <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none focus:ring-4 ring-[#4318FF]/5" 
                      placeholder="y.alami@studylink.ma"
                   />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">
                   {role === 'student' ? 'Parcours / Track' : 'Spécialité Expertise'}
                </label>
                <input 
                   type="text" 
                   value={extra}
                   onChange={e => setExtra(e.target.value)}
                   className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none focus:ring-4 ring-[#4318FF]/5" 
                   placeholder={role === 'student' ? "Ex: Code & Intelligence Artificielle" : "Ex: Architecture Cloud & DevOps"}
                />
             </div>
          </div>
          
          <div className="p-10 bg-slate-50 flex justify-end gap-4 shrink-0 border-t border-white">
             <button onClick={onClose} className="px-10 py-5 text-[#A3AED0] font-black uppercase tracking-widest text-[10px] hover:text-[#2B3674]">Annuler</button>
             <button 
                disabled={!isValid}
                onClick={() => onSave({ name, email, role, [role === 'student' ? 'track' : 'specialty']: extra })} 
                className={`px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all ${isValid ? 'bg-[#4318FF] text-white hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
             >
                <Save size={18} className="inline mr-2" /> Créer l'accès
             </button>
          </div>
       </motion.div>
    </div>
  );
};

// --- COMPOSANT SUPPORT : AI & GESTION ---

const SupportView: React.FC<{ role: UserRole; onOpenChat: () => void }> = ({ role, onOpenChat }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 pb-32">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* AI Assistance Card */}
          <div className="bg-white p-12 rounded-[60px] shadow-sm border border-slate-50 space-y-8 flex flex-col justify-between group hover:shadow-2xl transition-all">
             <div className="space-y-8">
               <div className="w-20 h-20 bg-[#4318FF]/5 text-[#4318FF] rounded-[32px] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot size={40} />
               </div>
               <div>
                  <h3 className="text-3xl font-black text-[#2B3674] uppercase tracking-tight leading-none">Assistant StudyLink AI</h3>
                  <p className="text-sm font-bold text-[#A3AED0] mt-4 leading-relaxed italic">"Comment puis-je vous aider aujourd'hui ? Je peux vous assister sur la pédagogie ou l'utilisation de la plateforme."</p>
               </div>
             </div>
             <button 
               onClick={onOpenChat}
               className="w-full py-6 bg-[#4318FF] text-white rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#4318FF]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               Démarrer la discussion <MessageCircle size={20} />
             </button>
          </div>

          {/* Teacher Specific Management Section */}
          {role === 'professor' && (
            <div className="bg-[#2B3674] p-12 rounded-[60px] shadow-2xl text-white space-y-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[160px] -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
               <div className="space-y-8 relative z-10">
                  <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center">
                    <Users size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Gestion des Classes & Promotions</h3>
                    <p className="text-sm font-bold text-white/60 mt-4 leading-relaxed">
                       Outils d'administration rapide pour piloter vos effectifs et vos promotions actives au sein du StudyLink.
                    </p>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-4 relative z-10">
                  <button onClick={() => alert("Gestion des effectifs en cours de déploiement")} className="flex items-center justify-between p-7 bg-white/10 hover:bg-white/20 rounded-[32px] transition-all group/btn border border-white/5">
                     <span className="font-black text-xs uppercase tracking-[0.2em]">Effectifs par Promotion</span>
                     <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => alert("Statistiques en cours de génération")} className="flex items-center justify-between p-7 bg-white/10 hover:bg-white/20 rounded-[32px] transition-all group/btn border border-white/5">
                     <span className="font-black text-xs uppercase tracking-[0.2em]">Statistiques de Réussite</span>
                     <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => alert("Ouverture du canal de communication direct")} className="flex items-center justify-between p-7 bg-white/10 hover:bg-white/20 rounded-[32px] transition-all group/btn border border-white/5">
                     <span className="font-black text-xs uppercase tracking-[0.2em]">Contact Direction Pédagogique</span>
                     <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          )}

          {/* Student Specific Section */}
          {role === 'student' && (
             <div className="bg-white p-12 rounded-[60px] shadow-sm border border-slate-50 space-y-8 group hover:shadow-2xl transition-all">
                <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-[32px] flex items-center justify-center">
                   <Zap size={40} />
                </div>
                <div>
                   <h3 className="text-3xl font-black text-[#2B3674] uppercase tracking-tight leading-none">Guide de l'Excellence</h3>
                   <p className="text-sm font-bold text-[#A3AED0] mt-4 leading-relaxed">Apprenez à maximiser vos points XP et à construire un portfolio qui attire les recruteurs du futur.</p>
                </div>
                <button className="w-full py-6 border-4 border-dashed border-slate-100 text-[#2B3674] rounded-[32px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                   Consulter le guide <FileText size={18} />
                </button>
             </div>
          )}
       </div>
    </motion.div>
  );
};

// --- COMPOSANT PROFESSEUR : CENTRE DE GESTION DES MISSIONS ---

const ProfessorMissionCenter: React.FC<{ 
  missions: Mission[], 
  courses: Course[],
  onCorrect: (id: string) => void,
  onEditMission: (m: Mission) => void,
  onDeleteMission: (id: string) => void,
  onCreateMission: () => void
}> = ({ missions, courses, onCorrect, onEditMission, onDeleteMission, onCreateMission }) => {
  const [subTab, setSubTab] = useState<'corrections' | 'catalog'>('corrections');
  const pendingSubmissions = missions.filter(m => m.status === 'Submitted');

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-[#4318FF] text-white flex items-center justify-center shadow-xl shadow-[#4318FF]/20">
                <CheckCircle2 size={28} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-[#2B3674] tracking-tighter uppercase leading-none">Gestion des Missions</h3>
                <p className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest mt-2">Suivi des rendus et définition des défis</p>
             </div>
          </div>
          <button 
            onClick={onCreateMission}
            className="px-10 py-5 bg-[#4318FF] text-white rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
             <Plus size={18} /> Nouveau Défi
          </button>
       </div>

       <div className="bg-white p-2 rounded-[32px] shadow-sm border border-slate-50 flex max-w-fit">
          <button 
            onClick={() => setSubTab('corrections')}
            className={`px-10 py-4 rounded-[26px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${subTab === 'corrections' ? 'bg-[#4318FF] text-white shadow-xl shadow-[#4318FF]/20' : 'text-[#A3AED0] hover:bg-slate-50'}`}
          >
             <Loader2 size={18} className={subTab === 'corrections' && pendingSubmissions.length > 0 ? 'animate-spin' : ''} /> 
             À corriger ({pendingSubmissions.length})
          </button>
          <button 
            onClick={() => setSubTab('catalog')}
            className={`px-10 py-4 rounded-[26px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${subTab === 'catalog' ? 'bg-[#4318FF] text-white shadow-xl shadow-[#4318FF]/20' : 'text-[#A3AED0] hover:bg-slate-50'}`}
          >
             <List size={18} /> Catalogue Défis ({missions.length})
          </button>
       </div>

       {subTab === 'corrections' ? (
          <div className="grid grid-cols-1 gap-6">
             {pendingSubmissions.length > 0 ? (
                pendingSubmissions.map(m => (
                  <div key={m.id} className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#4318FF] flex items-center justify-center">
                           <Target size={24} />
                        </div>
                        <div>
                           <p className="text-lg font-black text-[#2B3674]">{m?.title || 'Mission'}</p>
                           <p className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest mt-1">Étudiant: Amine Alami • Reçu le {m.deadline}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => onCorrect(m.id)}
                        className="px-8 py-4 bg-[#4318FF] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#4318FF]/20 hover:scale-105 transition-all"
                     >
                        Corriger maintenant
                     </button>
                  </div>
                ))
             ) : (
                <div className="py-24 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                   <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                   <h4 className="text-xl font-black text-[#2B3674] uppercase">Tout est à jour !</h4>
                   <p className="text-sm font-bold text-[#A3AED0]">Aucune soumission en attente de correction.</p>
                </div>
             )}
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {missions.length > 0 ? missions.map(m => (
                <div key={m.id} className="bg-white p-10 rounded-[60px] shadow-sm border border-slate-50 space-y-6 group hover:shadow-xl transition-all">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-[#F4F7FE] text-[#4318FF] flex items-center justify-center">
                         <Target size={22} />
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => onEditMission(m)} className="p-3 bg-slate-50 text-[#A3AED0] rounded-xl hover:text-[#4318FF] transition-all"><Edit3 size={18} /></button>
                         <button onClick={() => onDeleteMission(m.id)} className="p-3 bg-slate-50 text-[#A3AED0] rounded-xl hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                      </div>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-[#2B3674] tracking-tight">{m?.title || 'Mission'}</h4>
                      <p className="text-xs font-bold text-[#A3AED0] uppercase tracking-widest mt-1">Module: {courses.find(c => c.id === m.courseId)?.title || 'Général'}</p>
                   </div>
                   <p className="text-sm font-bold text-[#2B3674]/70 line-clamp-2 leading-relaxed">{m.description}</p>
                   <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black text-[#4318FF] uppercase tracking-[0.2em]">{m.points} XP Excellence</span>
                      <span className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">Échéance: {m.deadline}</span>
                   </div>
                </div>
             )) : (
                <div className="col-span-full py-24 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                   <Target size={48} className="text-slate-200 mx-auto mb-4" />
                   <h4 className="text-xl font-black text-[#2B3674] uppercase">Aucune mission créée</h4>
                   <p className="text-sm font-bold text-[#A3AED0]">Commencez par créer une mission pour vos étudiants.</p>
                </div>
             )}
          </div>
       )}
    </motion.div>
  );
};

// --- MODAL : ÉDITEUR DE MISSION ---

const MissionEditorModal: React.FC<{ mission: Mission, courses: Course[], onClose: () => void, onSave: (m: Mission) => void }> = ({ mission, courses, onClose, onSave }) => {
   const [formData, setFormData] = useState<Mission>({ ...mission });

   return (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2B3674]/80 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-full">
           <div className="p-10 bg-[#4318FF] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10"><Target size={28} /></div>
                 <div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{mission.id ? 'Éditer le Défi' : 'Nouveau Défi'}</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-2">Définition du projet pédagogique</p>
                 </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"><X size={28} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Titre du Défi</label>
                    <input 
                       type="text" 
                       value={formData.title} 
                       onChange={e => setFormData({ ...formData, title: e.target.value })}
                       className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none" 
                       placeholder="Ex: Landing Page Masterclass"
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Module Associé</label>
                    <select 
                       value={formData.courseId} 
                       onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                       className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none"
                    >
                       {courses.map(c => <option key={c.id} value={c.id}>{c?.title || 'Module'}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Description & Brief</label>
                 <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-8 bg-[#F4F7FE] border-none rounded-[40px] font-bold text-[#2B3674] h-40 outline-none resize-none" 
                    placeholder="Détaillez les attentes et livrables..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Points XP</label>
                    <input 
                       type="number" 
                       value={formData.points} 
                       onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) })}
                       className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-4">Échéance finale</label>
                    <input 
                       type="date" 
                       value={formData.deadline} 
                       onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                       className="w-full p-6 bg-[#F4F7FE] border-none rounded-3xl font-bold text-[#2B3674] outline-none" 
                    />
                 </div>
              </div>
           </div>
           
           <div className="p-10 bg-slate-50 flex justify-end gap-4 shrink-0 border-t border-white">
              <button onClick={onClose} className="px-10 py-5 text-[#A3AED0] font-black uppercase tracking-widest text-[10px] hover:text-[#2B3674]">Annuler</button>
              <button 
                 disabled={!formData.title || !formData.description}
                 onClick={() => onSave({ ...formData, id: formData.id || Date.now().toString() })} 
                 className={`px-12 py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all ${formData.title && formData.description ? 'bg-[#4318FF] text-white hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                 <Save size={18} className="inline mr-2" /> {mission.id ? 'Mettre à jour' : 'Créer le défi'}
              </button>
           </div>
        </motion.div>
     </div>
   );
};

// --- COMPOSANT PROFESSEUR : MES CLASSES ---

const ProfessorClassesView: React.FC<{ students: Student[], sessions: Session[], missions: Mission[] }> = ({ students, sessions, missions }) => {
  const activeSessions = sessions.filter(s => s.isActive);
  const pendingMissionsCount = missions.filter(m => m.status === 'Submitted').length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 md:space-y-12 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <StatCard title="Étudiants total" value={students.length.toString()} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard title="Promotions actives" value={activeSessions.length.toString()} icon={Layers} color="bg-purple-50 text-purple-600" />
        <StatCard title="Corrections en attente" value={pendingMissionsCount.toString()} icon={CheckCircle2} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2 md:px-4">
           <h3 className="text-xl md:text-2xl font-black text-[#2B3674] tracking-tight uppercase">Mes Promotions d'Excellence</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {activeSessions.map(session => (
            <div key={session.id} className="bg-white p-6 md:p-10 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 space-y-6 md:space-y-8 group hover:shadow-xl transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-[#4318FF]/5 rounded-bl-[120px] md:rounded-bl-[160px] -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform" />
               <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                     <div>
                        <h4 className="text-2xl md:text-3xl font-black text-[#2B3674] tracking-tight leading-none mb-2">{session?.name || 'Session'}</h4>
                        <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={12} className="text-[#4318FF]" /> Fin prévue : {session.endDate}
                        </p>
                     </div>
                     <span className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-green-100">Actif</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                     <div className="p-3 md:p-4 bg-[#F4F7FE] rounded-2xl md:rounded-3xl text-center border border-white">
                        <p className="text-xl md:text-2xl font-black text-[#4318FF]">{students.length}</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-[#A3AED0] uppercase">Élèves</p>
                     </div>
                     <div className="p-3 md:p-4 bg-[#F4F7FE] rounded-2xl md:rounded-3xl text-center border border-white">
                        <p className="text-xl md:text-2xl font-black text-[#2B3674]">88%</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-[#A3AED0] uppercase">Moyenne</p>
                     </div>
                     <div className="p-3 md:p-4 bg-[#F4F7FE] rounded-2xl md:rounded-3xl text-center border border-white">
                        <p className="text-xl md:text-2xl font-black text-green-500">96%</p>
                        <p className="text-[8px] md:text-[10px] font-bold text-[#A3AED0] uppercase">Assiduité</p>
                     </div>
                  </div>
                  <div className="space-y-4 md:space-y-6">
                     <div className="flex justify-between items-center">
                        <p className="text-[9px] md:text-[10px] font-black text-[#2B3674] uppercase tracking-widest">Progression du Cursus</p>
                        <span className="text-[10px] md:text-xs font-black text-[#4318FF]">64%</span>
                     </div>
                     <div className="h-2.5 md:h-3 bg-slate-50 rounded-full overflow-hidden border border-white shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: '64%' }} className="h-full bg-[#4318FF] rounded-full" />
                     </div>
                  </div>
               </div>
               <button 
                 onClick={() => {
                   const element = document.getElementById('student-table');
                   element?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="w-full py-4 md:py-5 bg-[#2B3674] text-white rounded-[24px] md:rounded-[28px] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-[#4318FF] transition-all shadow-xl shadow-[#2B3674]/20 flex items-center justify-center gap-3 relative z-10"
               >
                  <List size={16} /> Voir la liste des étudiants
               </button>
            </div>
          ))}
        </div>
      </div>

      <div id="student-table" className="bg-white rounded-[32px] md:rounded-[60px] shadow-sm border border-slate-50 overflow-hidden">
         <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
            <div>
               <h3 className="text-lg md:text-xl font-black text-[#2B3674] uppercase tracking-tighter">Registre d'Excellence</h3>
               <p className="text-xs md:text-sm font-bold text-[#A3AED0]">Suivi individuel des apprenants de la Promotion 2025</p>
            </div>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[600px]">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="p-6 md:p-8 table-header">Apprenant</th>
                    <th className="p-6 md:p-8 table-header">Module suivi</th>
                    <th className="p-6 md:p-8 table-header">Dernier projet</th>
                    <th className="p-6 md:p-8 table-header">Progression</th>
                    <th className="p-6 md:p-8 table-header">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {students.map(student => (
                    <tr key={student.id} className="hover:bg-[#F4F7FE] transition-all group">
                       <td className="p-6 md:p-8">
                          <div className="flex items-center gap-3 md:gap-4">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'student'}`} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100" alt="avatar" />
                             <div>
                                <p className="text-sm font-black text-[#2B3674]">{student?.name || 'Étudiant'}</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-[#A3AED0] uppercase">{student?.track || 'Track'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6 md:p-8"><span className="text-xs md:text-sm font-bold text-[#2B3674]">IA & Machine Learning</span></td>
                       <td className="p-6 md:p-8">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${student.progress > 70 ? 'bg-green-500' : 'bg-orange-500'}`} />
                             <span className="text-[10px] md:text-xs font-bold text-slate-600">Classification ML</span>
                          </div>
                       </td>
                       <td className="p-6 md:p-8">
                          <div className="w-24 md:w-32">
                             <div className="h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#4318FF]" style={{ width: `${student.progress}%` }} />
                             </div>
                             <p className="text-[9px] md:text-[10px] font-black text-[#2B3674] mt-1.5 md:mt-2 text-right">{student.progress}%</p>
                          </div>
                       </td>
                       <td className="p-6 md:p-8">
                          <button className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-[#4318FF] rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest border border-[#4318FF]/10 shadow-sm hover:bg-[#4318FF] hover:text-white transition-all">Consulter</button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>
    </motion.div>
  );
};

// --- COMPOSANT ADMIN : TOUR DE CONTRÔLE ---

const AdminTowerDashboard: React.FC<{ students: Student[], sessions: Session[] }> = ({ students, sessions }) => {
  const alerts = students.filter(s => s.absences >= 3);
  const activeSession = sessions.find(s => s.isActive);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 md:space-y-12 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <div onClick={() => alert("Détails des candidatures")} className="cursor-pointer transition-transform hover:scale-105"><StatCard title="Candidatures" value="156" icon={ClipboardList} color="bg-blue-50 text-blue-600" /></div>
        <div onClick={() => alert("Détails des étudiants actifs")} className="cursor-pointer transition-transform hover:scale-105"><StatCard title="Étudiants Actifs" value={students.length.toString()} icon={Users} color="bg-green-50 text-green-600" /></div>
        <div onClick={() => alert("Détails des experts guests")} className="cursor-pointer transition-transform hover:scale-105"><StatCard title="Experts Guests" value="8" icon={Award} color="bg-purple-50 text-purple-600" /></div>
        <div onClick={() => alert("Détails du taux de réussite")} className="cursor-pointer transition-transform hover:scale-105"><StatCard title="Taux de Réussite" value="94%" icon={TrendingUp} color="bg-orange-50 text-orange-600" /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
         <div className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg md:text-xl font-black text-[#2B3674] flex items-center gap-3 tracking-tighter uppercase">
                 <AlertCircle className="text-red-500" /> Alertes Critiques
              </h3>
              <span className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse">{alerts.length} Cas à traiter</span>
            </div>
            <div className="space-y-4">
               {alerts.length > 0 ? alerts.map(s => (
                 <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-red-50/50 rounded-3xl border border-red-100 group hover:bg-red-50 transition-all gap-4">
                    <div className="flex items-center gap-4">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s?.name || 'student'}`} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-red-100" alt="student" />
                       <div>
                          <p className="font-black text-[#2B3674] text-xs md:text-sm uppercase tracking-tight">{s?.name || 'Étudiant'}</p>
                          <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase tracking-widest">{s.absences} Absences injustifiées</p>
                       </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all">Alerter Parents</button>
                 </div>
               )) : (
                 <div className="py-16 md:py-20 text-center space-y-4">
                    <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                    <p className="text-xs md:text-sm font-bold text-[#A3AED0]">Assiduité exemplaire : aucune alerte.</p>
                 </div>
               )}
            </div>
         </div>

         <div className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 space-y-8 md:space-y-10">
            <h3 className="text-lg md:text-xl font-black text-[#2B3674] flex items-center gap-3 tracking-tighter uppercase">
               <Zap className="text-[#4318FF]" /> Promotions en cours
            </h3>
            {activeSession ? (
              <div className="space-y-6 md:space-y-8">
                <div className="p-6 md:p-8 bg-[#F4F7FE] rounded-[32px] md:rounded-[40px] border border-white space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl md:text-2xl font-black text-[#2B3674] tracking-tight">{activeSession.name}</h4>
                        <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] uppercase tracking-widest mt-1">Clôture le {activeSession.endDate}</p>
                      </div>
                      <span className="px-3 py-1.5 md:px-4 md:py-2 bg-green-500 text-white rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest">Actif</span>
                   </div>
                   <ProgressBar progress={68} label="Progression globale du cursus" />
                </div>
              </div>
            ) : (
              <p className="text-xs md:text-sm font-bold text-[#A3AED0] text-center py-10">Aucune promotion active pour le moment.</p>
            )}
            <button 
              onClick={() => alert("Ouverture du formulaire de création de session")}
              className="w-full py-4 md:py-5 border-4 border-dashed border-[#4318FF]/20 text-[#4318FF] rounded-[24px] md:rounded-[28px] font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-[#4318FF]/5 transition-all flex items-center justify-center gap-3"
            >
               <Zap size={16} /> Ouvrir une nouvelle session excellence
            </button>
         </div>
      </div>
    </motion.div>
  );
};

// --- COMPOSANT ADMIN : GESTION DES UTILISATEURS ---

const AdminUsersView: React.FC<{ students: Student[], lecturers: Lecturer[], onManageAccess: (l: Lecturer) => void, onAddUser: () => void, onSeedData: () => void }> = ({ students, lecturers, onManageAccess, onAddUser, onSeedData }) => {
  const [subTab, setSubTab] = useState<'students' | 'lecturers'>('students');

  const handleExportCSV = () => {
    let csvContent = "";
    if (subTab === 'students') {
      csvContent = "ID,Nom,Email,Track,Progrès,Absences\n";
      students.forEach(s => {
        csvContent += `${s.id},"${s?.name || ''}",${s.email},"${s.track}",${s.progress},${s.absences}\n`;
      });
    } else {
      csvContent = "ID,Nom,Email,Spécialité,Date d'adhésion\n";
      lecturers.forEach(l => {
        csvContent += `${l.id},"${l.name}",${l.email},"${l.specialty}","${l.joinedDate}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `studylink_${subTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 md:space-y-12 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#4318FF] text-white flex items-center justify-center shadow-xl shadow-[#4318FF]/20">
                <Users size={24} className="md:w-7 md:h-7" />
             </div>
             <div>
                <h3 className="text-2xl md:text-3xl font-black text-[#2B3674] tracking-tighter uppercase leading-none">Gestion des Utilisateurs</h3>
                <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] uppercase tracking-widest mt-1 md:mt-2">Gouvernance de l'écosystème Excellence</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
             <button 
                onClick={onSeedData}
                className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border border-amber-100 shadow-sm flex items-center justify-center gap-2 md:gap-3 hover:bg-amber-100 transition-all"
             >
                <Database size={16} className="md:w-[18px] md:h-[18px]" /> Demo Data
             </button>
             <button 
                onClick={handleExportCSV}
                className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-white text-[#2B3674] rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border border-slate-100 shadow-sm flex items-center justify-center gap-2 md:gap-3 hover:bg-slate-50 transition-all"
             >
                <Download size={16} className="md:w-[18px] md:h-[18px]" /> Export CSV
             </button>
             <button 
                onClick={onAddUser}
                className="flex-1 md:flex-none px-6 md:px-8 py-3 md:py-4 bg-[#4318FF] text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 md:gap-3 hover:scale-105 transition-all"
             >
                <UserPlus size={16} className="md:w-[18px] md:h-[18px]" /> Ajouter
             </button>
          </div>
       </div>

       <div className="bg-white p-1.5 rounded-[24px] md:rounded-[32px] shadow-sm border border-slate-50 flex w-full md:max-w-fit overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setSubTab('students')}
            className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-[20px] md:rounded-[26px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap ${subTab === 'students' ? 'bg-[#4318FF] text-white shadow-xl shadow-[#4318FF]/20' : 'text-[#A3AED0] hover:bg-slate-50'}`}
          >
             <UserCheck size={16} className="md:w-[18px] md:h-[18px]" /> Apprenants ({students.length})
          </button>
          <button 
            onClick={() => setSubTab('lecturers')}
            className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-[20px] md:rounded-[26px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 whitespace-nowrap ${subTab === 'lecturers' ? 'bg-[#4318FF] text-white shadow-xl shadow-[#4318FF]/20' : 'text-[#A3AED0] hover:bg-slate-50'}`}
          >
             <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" /> Intervenants ({lecturers.length})
          </button>
       </div>

       {subTab === 'students' ? (
         <div className="bg-white rounded-[32px] md:rounded-[50px] shadow-sm border border-slate-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="p-6 md:p-8 table-header">Apprenant</th>
                       <th className="p-6 md:p-8 table-header">Track</th>
                       <th className="p-6 md:p-8 table-header">Assiduité</th>
                       <th className="p-6 md:p-8 table-header">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-[#F4F7FE] transition-all group">
                         <td className="p-6 md:p-8">
                            <div className="flex items-center gap-3 md:gap-4">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.name || 'student'}`} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50" alt="avatar" />
                               <div>
                                  <p className="text-sm font-black text-[#2B3674]">{student?.name || 'Étudiant'}</p>
                                  <p className="text-[9px] md:text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest">{student.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-6 md:p-8"><span className="px-3 md:px-4 py-1.5 md:py-2 bg-[#F4F7FE] text-[#4318FF] rounded-xl text-[9px] md:text-[10px] font-black uppercase">{student.track}</span></td>
                         <td className="p-6 md:p-8"><span className={`text-[10px] md:text-xs font-bold ${student.absences >= 3 ? 'text-red-500' : 'text-green-500'}`}>{student.absences} Absences</span></td>
                         <td className="p-6 md:p-8"><button className="p-2.5 md:p-3 bg-white text-[#A3AED0] rounded-xl border border-slate-50 hover:bg-[#4318FF] hover:text-white transition-all shadow-sm"><Edit3 size={16} className="md:w-[18px] md:h-[18px]" /></button></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
         </div>
       ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {lecturers.map(prof => (
               <div key={prof.id} className="bg-white p-8 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 text-center space-y-6 md:space-y-8 group hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-4 md:space-y-6">
                     <img src={prof.avatar} className="w-24 h-24 md:w-28 md:h-28 rounded-[36px] md:rounded-[44px] bg-slate-50 mx-auto border-4 border-white shadow-2xl group-hover:scale-105 transition-transform" alt="avatar" />
                     <div>
                        <h4 className="text-xl md:text-2xl font-black text-[#2B3674] tracking-tight uppercase">{prof?.name || 'Professeur'}</h4>
                        <p className="text-[10px] md:text-xs font-bold text-[#4318FF] uppercase mt-1.5 md:mt-2">Expert {prof.specialty}</p>
                     </div>
                  </div>
                  <button onClick={() => onManageAccess(prof)} className="w-full py-4 md:py-5 bg-[#2B3674] text-white rounded-[24px] md:rounded-[28px] font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-[#4318FF] transition-all">Gérer Accès</button>
               </div>
            ))}
         </div>
       )}
    </motion.div>
  );
};

// --- PROFESSOR CORRECTION VIEW (SPLIT VIEW) ---

const ProfessorCorrectionView: React.FC<{ mission: Mission, onCancel: () => void, onFinish: (status: MissionStatus) => void }> = ({ mission, onCancel, onFinish }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen flex flex-col bg-white overflow-hidden" >
      <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-6">
            <button onClick={onCancel} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-[#A3AED0] transition-all"><ChevronLeft size={24} /></button>
            <h2 className="text-sm font-black text-[#2B3674] uppercase tracking-widest">Correction: {mission?.title || 'Mission'}</h2>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => onFinish('Returned')} className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100">À revoir</button>
            <button onClick={() => onFinish('Validated')} className="px-8 py-3 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 transition-all">Valider</button>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 bg-[#F4F7FE] overflow-y-auto p-12 lg:p-16 custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[48px] shadow-sm border border-white space-y-8 text-center py-20">
               <div className="w-24 h-24 bg-[#4318FF]/5 text-[#4318FF] flex items-center justify-center mx-auto rounded-[32px] mb-8"><Code2 size={48} /></div>
               <h3 className="text-3xl font-black text-[#2B3674]">Soumission de l'élève</h3>
               <p className="text-lg text-[#A3AED0] font-bold max-w-md mx-auto">Visualisez ici le code source ou le rendu interactif du projet Excellence.</p>
               <div className="pt-10 flex justify-center gap-4">
                  <button className="px-10 py-5 bg-[#2B3674] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3"><Github size={18} /> Voir le Repo</button>
                  <button className="px-10 py-5 bg-white text-[#4318FF] border border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm">Démo live</button>
               </div>
            </div>
         </div>
         <div className="w-[420px] bg-white border-l border-slate-100 overflow-y-auto p-10 space-y-12 custom-scrollbar shrink-0">
            <section className="space-y-6">
               <h3 className="text-sm font-black text-[#2B3674] uppercase tracking-widest flex items-center gap-3"><Star size={20} className="text-[#4318FF]" /> Score Excellence</h3>
               <div className="grid grid-cols-3 gap-3">
                  {['A+', 'A', 'B+', 'B', 'C', 'R'].map(g => (
                    <button key={g} className={`h-16 rounded-2xl font-black text-xl border-2 transition-all ${g === 'A+' ? 'bg-[#4318FF] text-white border-[#4318FF]' : 'bg-white text-[#A3AED0] border-slate-50 hover:border-slate-200'}`}>{g}</button>
                  ))}
               </div>
            </section>
            <section className="space-y-6">
               <h3 className="text-sm font-black text-[#2B3674] uppercase tracking-widest flex items-center gap-3"><MessageCircle size={20} className="text-[#4318FF]" /> Feedback</h3>
               <textarea placeholder="Écrivez vos conseils d'amélioration..." className="w-full h-48 p-6 bg-[#F4F7FE] border-none rounded-[32px] text-sm font-bold text-[#2B3674] outline-none" />
            </section>
         </div>
      </div>
    </motion.div>
  );
};

// --- MODAL: GÉRER LES ACCÈS PRIVÉS ---

const ManageAccessModal: React.FC<{ lecturer: Lecturer, onClose: () => void }> = ({ lecturer, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#2B3674]/80 backdrop-blur-md" />
       <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[60px] shadow-2xl overflow-hidden flex flex-col">
          <div className="p-10 bg-[#2B3674] text-white flex justify-between items-center">
             <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Console d'Accès Intervenant</h3>
             <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"><X size={24} /></button>
          </div>
          <div className="p-12 space-y-10 text-center">
             <div className="p-10 bg-[#F4F7FE] rounded-[48px] border-4 border-dashed border-[#4318FF]/10 space-y-4">
                <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Code Temporaire</p>
                <p className="text-4xl font-black text-[#4318FF] tracking-[0.2em]">CONNECT-7G2K</p>
                <button className="text-[10px] font-black text-[#4318FF] uppercase tracking-widest flex items-center gap-2 mx-auto hover:underline"><RefreshCw size={12} /> Régénérer</button>
             </div>
             <button onClick={onClose} className="w-full py-6 bg-[#2B3674] text-white rounded-[32px] font-black uppercase text-xs tracking-widest shadow-xl">Valider les Accès</button>
          </div>
       </motion.div>
    </div>
  );
};

// --- StudentDashboard ---
const StudentDashboard: React.FC<{ 
  userName: string;
  courses: Course[]; 
  missions: Mission[];
  onResumeCourse: (id: string) => void;
  onSelectMission: (id: string) => void;
}> = ({ userName, courses, missions, onResumeCourse, onSelectMission }) => {
  const lastActiveCourse = courses.find(c => c.status === 'In Progress') || courses[0];
  const pendingMissions = missions.filter(m => m.status === 'Pending').slice(0, 2);
  const totalXP = missions
    .filter(m => m.status === 'Validated')
    .reduce((acc, m) => acc + m.points, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 md:space-y-12 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <StatCard title="Total XP StudyLink" value={totalXP.toLocaleString()} icon={Award} color="bg-orange-50 text-orange-600" />
        <StatCard title="Heures Formées" value="142h" icon={Clock} color="bg-blue-50 text-blue-600" />
        <StatCard title="Missions Finies" value={missions.filter(m => m.status === 'Validated').length.toString()} icon={Target} color="bg-green-50 text-green-600" />
      </div>

      <div className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl md:text-3xl font-black text-[#2B3674] tracking-tight uppercase">Continuez sur votre lancée</h3>
            <ProgressBar progress={70} label={`En cours : ${lastActiveCourse?.title || 'Aucun module'}`} />
            <button onClick={() => lastActiveCourse && onResumeCourse(lastActiveCourse.id)} className="w-full sm:w-auto px-10 py-4 md:py-5 bg-[#4318FF] text-white rounded-[24px] md:rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-[#4318FF]/20 flex items-center justify-center gap-3 transition-all hover:scale-105"><Play size={18} /> Reprendre</button>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 md:px-4 gap-4">
           <h3 className="text-xl md:text-2xl font-black text-[#2B3674] tracking-tighter uppercase">Défis Immédiats</h3>
           <button onClick={() => onSelectMission('')} className="text-[10px] md:text-xs font-black text-[#4318FF] uppercase tracking-widest hover:underline">Accéder à mes missions</button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {pendingMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} onClick={() => onSelectMission(mission.id)} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- MissionDetailView Component definition to fix line 296 error ---
const MissionDetailView: React.FC<{ mission: Mission; onBack: () => void; onSubmit: () => void }> = ({ mission, onBack, onSubmit }) => {
  const isUrgent = mission.deadline.toLowerCase().includes('avril') && mission.status === 'Pending';
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionType, setSubmissionType] = useState<'link' | 'file'>('link');

  const canSubmit = (submissionType === 'link' && submissionUrl.trim().length > 5) || (submissionType === 'file' && fileSelected);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, _field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8 md:space-y-12 pb-20 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-3 text-[#A3AED0] hover:text-[#2B3674] font-black text-[10px] md:text-sm uppercase tracking-widest transition-all group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour aux missions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          <div className="bg-white p-8 md:p-12 lg:p-16 rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 relative overflow-hidden">
             {isUrgent && (
               <div className="absolute top-0 right-0 px-6 md:px-10 py-2 md:py-3 bg-red-500 text-white font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] rounded-bl-2xl md:rounded-bl-3xl flex items-center gap-2 shadow-lg animate-pulse">
                 <AlertCircle size={12} className="md:w-3.5 md:h-3.5" /> Échéance Proche
               </div>
             )}
             
             <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 mb-10 md:mb-16">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[36px] flex items-center justify-center shrink-0 shadow-inner ${isUrgent ? 'bg-red-50 text-red-500' : 'bg-[#4318FF]/5 text-[#4318FF]'}`}>
                   <Target size={32} className="md:w-10 md:h-10" />
                </div>
                <div className="flex-1">
                   <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2B3674] tracking-tight mb-2 md:mb-3 leading-tight">{mission?.title}</h1>
                   <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <span className="px-3 md:px-4 py-1 md:py-1.5 bg-slate-100 text-[#2B3674] rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest">PROJET #{mission.id.toUpperCase()}</span>
                      <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-200 rounded-full"></span>
                      <div className="flex items-center gap-2 text-[#4318FF]">
                         <Trophy size={14} className="md:w-4 md:h-4" />
                         <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{mission.points} XP à gagner</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-10 md:space-y-12">
                <div>
                   <h3 className="text-lg md:text-xl font-black text-[#2B3674] mb-4 md:mb-6 flex items-center gap-3">
                     <Info size={18} className="text-[#4318FF] md:w-5 md:h-5" /> 
                     Brief de la mission
                   </h3>
                   <p className="text-base md:text-lg text-[#2B3674]/70 font-bold leading-relaxed">{mission.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 md:p-8 bg-[#F4F7FE] rounded-[32px] md:rounded-[40px] border border-white/50 space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-[#4318FF] uppercase tracking-[0.2em]">Exigences</h4>
                      <ul className="space-y-3 md:space-y-4">
                         {['Code documenté et propre', 'Responsive Web Design', 'Optimisation Performance'].map((req, i) => (
                           <li key={i} className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-[#2B3674]">
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#4318FF] rounded-full" /> {req}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="p-6 md:p-8 bg-slate-50 rounded-[32px] md:rounded-[40px] border border-white/50 space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-[#A3AED0] uppercase tracking-[0.2em]">Livrables attendus</h4>
                      <p className="text-[10px] md:text-xs font-bold text-[#2B3674] leading-relaxed">
                        Un lien vers votre dépôt GitHub ou un fichier .zip contenant l'ensemble de vos sources et une capture d'écran du résultat final.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
           <div className="bg-white p-8 md:p-10 rounded-[40px] md:rounded-[50px] shadow-2xl border border-slate-50 space-y-8 md:space-y-10 lg:sticky lg:top-8">
              <div className="space-y-4 text-center">
                 <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isUrgent ? 'text-red-500' : 'text-[#A3AED0]'}`}>Date de clôture</p>
                 <div className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center gap-3 md:gap-4 border-2 ${isUrgent ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <Calendar size={24} className={`md:w-8 md:h-8 ${isUrgent ? 'text-red-500' : 'text-[#4318FF]'}`} />
                    <p className={`text-xl md:text-2xl font-black tracking-tight ${isUrgent ? 'text-red-600' : 'text-[#2B3674]'}`}>{mission.deadline}</p>
                 </div>
              </div>

              {mission.status !== 'Validated' && mission.status !== 'Submitted' && (
                <div className="space-y-6 md:space-y-8">
                   <div className="flex bg-[#F4F7FE] p-1.5 rounded-[20px] md:rounded-[24px]">
                      <button 
                        onClick={() => setSubmissionType('link')}
                        className={`flex-1 py-3 md:py-3.5 rounded-[16px] md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${submissionType === 'link' ? 'bg-white text-[#4318FF] shadow-sm' : 'text-[#A3AED0] hover:text-[#2B3674]'}`}
                      >
                         Lien GitHub
                      </button>
                      <button 
                        onClick={() => setSubmissionType('file')}
                        className={`flex-1 py-3 md:py-3.5 rounded-[16px] md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${submissionType === 'file' ? 'bg-white text-[#4318FF] shadow-sm' : 'text-[#A3AED0] hover:text-[#2B3674]'}`}
                      >
                         Archive ZIP
                      </button>
                   </div>

                   {submissionType === 'link' ? (
                     <div className="space-y-3 md:space-y-4">
                        <label className="text-[9px] md:text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Lien du projet (GitHub / Behance)</label>
                        <div className="relative group">
                           <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-[#4318FF] transition-colors">
                              <Github size={18} className="md:w-5 md:h-5" />
                           </div>
                           <input 
                              type="url" 
                              value={submissionUrl}
                              onChange={(e) => setSubmissionUrl(e.target.value)}
                              placeholder="https://github.com/votre-projet"
                              className="w-full pl-14 md:pl-16 pr-5 md:pr-6 py-4 md:py-6 bg-slate-50 border-none rounded-[24px] md:rounded-[28px] text-xs md:text-sm font-bold text-[#2B3674] focus:ring-4 ring-[#4318FF]/5 transition-all"
                           />
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-3 md:space-y-4">
                        <label className="text-[9px] md:text-[10px] font-black text-[#A3AED0] uppercase tracking-widest ml-2">Fichier source</label>
                        <div className="relative group">
                           <input 
                              type="file" 
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                           />
                           <div className={`p-8 md:p-10 border-2 border-dashed rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center gap-3 md:gap-4 transition-all ${fileSelected ? 'border-green-500 bg-green-50' : 'border-slate-100 group-hover:border-[#4318FF] group-hover:bg-slate-50'}`}>
                              <Upload size={24} className={`md:w-8 md:h-8 ${fileSelected ? 'text-green-500' : 'text-[#A3AED0] group-hover:text-[#4318FF]'}`} />
                              <p className="text-[8px] md:text-[9px] font-black text-center text-[#2B3674] uppercase tracking-widest leading-relaxed">
                                 {fileSelected ? fileSelected.name : 'Déposez votre ZIP ici'}
                              </p>
                           </div>
                        </div>
                     </div>
                   )}

                   <button 
                    disabled={!canSubmit}
                    onClick={onSubmit}
                    className={`w-full py-5 md:py-6 rounded-[24px] md:rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all ${
                      canSubmit ? 'bg-[#4318FF] text-white shadow-2xl hover:scale-[1.02] shadow-[#4318FF]/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                   >
                     Envoyer pour correction <Send size={16} className="md:w-[18px] md:h-[18px]" />
                   </button>
                </div>
              )}

              {mission.status === 'Submitted' && (
                <div className="text-center p-6 md:p-8 space-y-4 md:space-y-6">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-[#4318FF] rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <Loader2 size={28} className="md:w-9 md:h-9 animate-spin" />
                   </div>
                   <div className="space-y-2">
                      <StatusBadge status="Submitted" />
                      <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] mt-3 md:mt-4">Nous analysons votre projet avec le plus grand soin. Temps de réponse moyen : 48h.</p>
                   </div>
                </div>
              )}

              {mission.status === 'Validated' && (
                <div className="text-center p-6 md:p-8 space-y-4 md:space-y-6">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <Award size={32} className="md:w-10 md:h-10" />
                   </div>
                   <div className="space-y-2">
                      <StatusBadge status="Validated" />
                      <p className="text-[10px] md:text-xs font-bold text-[#A3AED0] mt-3 md:mt-4">Vos points XP ont été crédités sur votre compte d'excellence.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- StudentPortfolioView ---
const StudentPortfolioView: React.FC<{ userName: string; missions: Mission[]; onShare: () => void; onViewProject: (id: string) => void }> = ({ userName, missions, onShare, onViewProject }) => {
  const validatedMissions = missions.filter(m => m.status === 'Validated');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12 md:space-y-16 pb-32">
       <div className="bg-white rounded-[40px] md:rounded-[60px] shadow-sm border border-slate-50 relative overflow-hidden">
          <div className="h-40 md:h-60 bg-gradient-to-r from-[#4318FF] to-[#868CFF] relative">
             <div className="absolute -bottom-1 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-white to-transparent"></div>
          </div>
          <div className="px-6 md:px-12 pb-10 md:pb-16 relative -mt-16 md:-mt-24 z-10">
             <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 md:gap-10 text-center lg:text-left">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] md:rounded-[56px] border-4 md:border-8 border-white bg-white shadow-2xl" alt="profile" />
                <div className="flex-1 space-y-2 md:space-y-4 mb-0 md:mb-4">
                   <h1 className="text-3xl md:text-5xl font-black text-[#2B3674] tracking-tight">{userName}</h1>
                   <p className="text-lg md:text-xl text-[#A3AED0] font-bold max-w-2xl mx-auto lg:mx-0">Apprenant Excellence Hub.</p>
                </div>
                <button onClick={onShare} className="w-full lg:w-auto mb-0 md:mb-4 px-8 py-4 md:py-5 bg-[#4318FF] text-white rounded-[24px] md:rounded-[28px] font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-105"><Share2 size={18} /> Partager</button>
             </div>
          </div>
       </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {validatedMissions.length > 0 ? validatedMissions.map(mission => (
                    <motion.div key={mission.id} whileHover={{ y: -10 }} onClick={() => onViewProject(mission.id)} className="bg-white rounded-[32px] md:rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer p-6 md:p-8 space-y-4">
                       <h3 className="text-lg md:text-xl font-black text-[#2B3674] tracking-tight">{mission?.title || 'Mission'}</h3>
                       <p className="text-xs md:text-sm font-bold text-[#A3AED0] line-clamp-2">{mission.description}</p>
                       <div className="pt-4 md:pt-6 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[9px] md:text-[10px] font-black uppercase text-[#4318FF]">Score A+</span>
                          <ExternalLink size={16} className="text-[#A3AED0]" />
                       </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-50">
                        <Briefcase size={48} className="text-slate-200 mx-auto mb-4" />
                        <h4 className="text-xl font-black text-[#2B3674] uppercase">Portfolio vide</h4>
                        <p className="text-sm font-bold text-[#A3AED0]">Validez des missions pour les voir apparaître ici.</p>
                    </div>
                  )}
               </div>
    </motion.div>
  );
};

// --- COMPONENTS ---

const AdminAdmissions: React.FC<{ applications: any[] }> = ({ applications }) => {
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status });
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <motion.div key="admin-admissions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="bg-white rounded-[32px] md:rounded-[50px] shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-6 md:p-8 table-header">Candidat</th>
                <th className="p-6 md:p-8 table-header">Track</th>
                <th className="p-6 md:p-8 table-header">Statut</th>
                <th className="p-6 md:p-8 table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? applications.map(app => (
                <tr key={app.id} className="border-b border-slate-50 hover:bg-[#F4F7FE] transition-colors">
                  <td className="p-6 md:p-8">
                    <div>
                      <p className="text-sm font-black text-[#2B3674]">{app.firstName} {app.lastName}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-[#A3AED0] uppercase">{app.email}</p>
                    </div>
                  </td>
                  <td className="p-6 md:p-8">
                    <span className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase">{app.track}</span>
                  </td>
                  <td className="p-6 md:p-8">
                    <span className={`status-pill ${
                      app.status === 'pending' ? 'status-pending' : 
                      app.status === 'accepted' ? 'status-accepted' : 'status-rejected'
                    }`}>
                      {app.status === 'pending' ? 'En attente' : app.status === 'accepted' ? 'Accepté' : 'Refusé'}
                    </span>
                  </td>
                  <td className="p-6 md:p-8">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-green-500 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase hover:scale-105 transition-all"
                      >
                        Accepter
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500 text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase hover:scale-105 transition-all"
                      >
                        Refuser
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-16 md:p-20 text-center text-[#A3AED0] font-bold">Aucune candidature pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

const GlobalSettings: React.FC<{ role: UserRole }> = ({ role }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'system'>('profile');
  return (
    <div className="space-y-12 pb-32">
       <div className="flex gap-12 border-b border-slate-100 pb-6 px-4">
          <button onClick={() => setActiveSubTab('profile')} className={`text-sm font-black uppercase tracking-[0.2em] pb-6 relative transition-all ${activeSubTab === 'profile' ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`}>Profil Excellence {activeSubTab === 'profile' && <motion.div layoutId="set-tab" className="absolute bottom-[-3px] left-0 right-0 h-[6px] bg-[#4318FF] rounded-full" />}</button>
          {role === 'admin' && <button onClick={() => setActiveSubTab('system')} className={`text-sm font-black uppercase tracking-[0.2em] pb-6 relative transition-all ${activeSubTab === 'system' ? 'text-[#4318FF]' : 'text-[#A3AED0]'}`}>Système {activeSubTab === 'system' && <motion.div layoutId="set-tab" className="absolute bottom-[-3px] left-0 right-0 h-[6px] bg-[#4318FF] rounded-full" />}</button>}
       </div>
        {activeSubTab === 'profile' ? (
          <div className="lg:col-span-2 bg-white p-16 rounded-[60px] shadow-sm border border-slate-50 space-y-12 text-center py-20">
             <Camera size={48} className="mx-auto text-[#A3AED0] mb-8" />
             <p className="text-xl font-black text-[#2B3674]">Paramètres du Profil Excellence</p>
             <p className="text-sm font-bold text-[#A3AED0]">Modifiez vos informations personnelles et identifiants StudyLink Hub.</p>
             <div className="pt-10 border-t border-slate-50">
                <button onClick={() => window.location.reload()} className="px-10 py-5 bg-[#2B3674] text-white rounded-[28px] font-black uppercase tracking-widest text-[10px] hover:bg-[#4318FF] transition-all flex items-center gap-3 mx-auto">
                   <LogOut size={16} /> Se déconnecter de la session
                </button>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-center">
             <div className="bg-white p-12 rounded-[60px] shadow-sm border border-slate-50 py-24"><Fingerprint size={32} className="mx-auto text-[#4318FF] mb-6" /><p className="font-black">Sécurité Infrastructure</p></div>
             <div className="bg-white p-12 rounded-[60px] shadow-sm border border-slate-50 py-24"><ShieldCheck size={32} className="mx-auto text-green-500 mb-6" /><p className="font-black">Gouvernance Système</p></div>
          </div>
       )}
    </div>
  );
};

const CourseDetailView: React.FC<{ course: Course; onBack: () => void; onToggleCompletion: (id: string) => void }> = ({ course, onBack, onToggleCompletion }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.lessons[0] || { id: '0', title: 'Bienvenue', duration: '5m', isCompleted: false, content: 'Sélectionnez une leçon pour commencer.', resources: [] });
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-12 pb-20">
      <button onClick={onBack} className="flex items-center gap-3 text-[#A3AED0] hover:text-[#2B3674] font-black text-sm uppercase tracking-widest transition-all"><ChevronLeft size={20} /> Retour</button>
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 bg-white rounded-[50px] shadow-sm border border-slate-50 p-12 lg:p-16 space-y-12">
          <h1 className="text-4xl font-black text-[#2B3674] tracking-tight">{activeLesson?.title || 'Leçon'}</h1>
          <p className="text-lg text-[#A3AED0] font-bold leading-relaxed">{activeLesson.content}</p>
          <button onClick={() => onToggleCompletion(activeLesson.id)} className={`px-10 py-5 rounded-[24px] font-black uppercase text-[11px] flex items-center gap-3 transition-all ${activeLesson.isCompleted ? 'bg-green-500 text-white' : 'bg-[#4318FF] text-white'}`}><CheckCircle size={18} /> {activeLesson.isCompleted ? 'Terminé' : 'Marquer comme fini'}</button>
        </div>
        <div className="w-full lg:w-96 bg-white p-10 rounded-[50px] shadow-sm border border-slate-50 space-y-4">
           <h3 className="text-xl font-black text-[#2B3674] mb-6">Syllabus</h3>
           {course.lessons.map((l, i) => (
             <button key={l.id} onClick={() => setActiveLesson(l)} className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all ${activeLesson.id === l.id ? 'bg-[#F4F7FE] text-[#4318FF]' : 'text-[#2B3674]'}`}>
                <span className="font-black text-xs">{i+1}.</span>
                <span className="text-sm font-bold flex-1 truncate">{l?.title || 'Leçon'}</span>
                {l.isCompleted && <CheckCircle size={14} className="text-green-500" />}
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardView;