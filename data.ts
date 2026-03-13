
import { Course, Mission, Notification, Student, Thematic, Session, Lecturer } from './types';

export const THEMATICS: Thematic[] = [
  { id: 'th1', name: 'Intelligence Artificielle', icon: 'BrainCircuit', description: 'Deep Learning, NLP et vision par ordinateur.' },
  { id: 'th2', name: 'Robotique', icon: 'Cpu', description: 'Arduino, IOT et mécatronique.' },
  { id: 'th3', name: 'Audiovisuel', icon: 'Video', description: 'Réalisation, montage et storytelling.' },
  { id: 'th4', name: 'Développement Web', icon: 'Code', description: 'Fullstack React & Node.js.' }
];

export const LECTURERS: Lecturer[] = [
  { id: 'prof1', name: 'Dr. Karimi', email: 'karimi@expert.ma', specialty: 'IA & Data', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karimi', joinedDate: '12/01/2025' },
  { id: 'prof2', name: 'Mme. Tazi', email: 'tazi@cinema.ma', specialty: 'Réalisation', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tazi', joinedDate: '15/02/2025' }
];

export const SESSIONS: Session[] = [
  { id: 'sess2025', name: 'Promotion Excellence 2025', startDate: '2025-01-01', endDate: '2025-06-30', isActive: true, activeModuleIds: ['1', '2'] }
];

export const COURSES: Course[] = [
  { 
    id: '1', 
    thematicId: 'th4',
    title: 'Fondamentaux du Web & HTML5', 
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800', 
    status: 'In Progress',
    duration: '12h',
    category: 'Code',
    description: "Structure sémantique et accessibilité.",
    lessons: [],
    assignedLecturerId: 'prof1'
  },
  { 
    id: '2', 
    thematicId: 'th1',
    title: 'Introduction au Machine Learning', 
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=800', 
    status: 'To Do',
    duration: '24h',
    category: 'IA',
    description: "Apprentissage supervisé et non supervisé.",
    lessons: [],
    assignedLecturerId: 'prof1'
  }
];

export const MISSIONS: Mission[] = [
  { id: 'm1', title: 'Landing Page Responsive', description: 'Design mobile-first.', deadline: '25 Mars 2025', status: 'Validated', courseId: '1', points: 500 },
  { id: 'm2', title: 'Modèle de classification', description: 'Prédire les prix immobiliers.', deadline: '05 Avril 2025', status: 'Pending', courseId: '2', points: 800 }
];

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Amine Alami', email: 'amine@alami.com', track: 'Code & IA', progress: 75, status: 'active', absences: 1 },
  { id: 's2', name: 'Sara Bennani', email: 'sara@bennani.com', track: 'Audiovisuel', progress: 40, status: 'active', absences: 4 }
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Alerte Absence', message: 'Sara Bennani a dépassé le seuil autorité.', time: '12m', type: 'alert', read: false }
];
