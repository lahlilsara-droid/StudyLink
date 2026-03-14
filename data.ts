
import { Course, Mission, Notification, Student, Thematic, Session, Lecturer } from './types';

export const THEMATICS: Thematic[] = [
  { id: 'th1', name: 'Intelligence Artificielle', icon: 'BrainCircuit', description: 'Deep Learning, NLP et vision par ordinateur.' },
  { id: 'th2', name: 'Robotique', icon: 'Cpu', description: 'Arduino, IOT et mécatronique.' },
  { id: 'th3', name: 'Audiovisuel', icon: 'Video', description: 'Réalisation, montage et storytelling.' },
  { id: 'th4', name: 'Développement Web', icon: 'Code', description: 'Fullstack React & Node.js.' }
];

export const LECTURERS: Lecturer[] = [
  { id: 'prof1', name: 'Dr. Karimi', email: 'karimi@expert.ma', specialty: 'IA & Data', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karimi', joinedDate: '12/01/2025' },
  { id: 'prof2', name: 'Mme. Tazi', email: 'tazi@cinema.ma', specialty: 'Réalisation', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tazi', joinedDate: '15/02/2025' },
  { id: 'prof3', name: 'M. Bennani', email: 'bennani@robot.ma', specialty: 'Systèmes Embarqués', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bennani', joinedDate: '01/03/2025' },
  { id: 'prof4', name: 'Dr. Alami', email: 'alami@web.ma', specialty: 'Fullstack Dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alami', joinedDate: '10/03/2025' },
  { id: 'prof5', name: 'Mme. Mansouri', email: 'mansouri@design.ma', specialty: 'UX/UI Design', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mansouri', joinedDate: '20/03/2025' },
  { id: 'prof6', name: 'M. Jabri', email: 'jabri@cyber.ma', specialty: 'Cybersécurité', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jabri', joinedDate: '25/03/2025' }
];

export const SESSIONS: Session[] = [
  { id: 'sess2025', name: 'Promotion Excellence 2025', startDate: '2025-01-01', endDate: '2025-06-30', isActive: true, activeModuleIds: ['1', '2'] },
  { id: 'sess2026', name: 'Promotion Innovation 2026', startDate: '2026-01-01', endDate: '2026-12-31', isActive: false, activeModuleIds: [] }
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
    description: "Maîtrisez la structure sémantique du web moderne et l'accessibilité numérique.",
    lessons: [
      { id: 'l1', title: 'Introduction au HTML5', duration: '45m', isCompleted: true, content: 'Découvrez les bases du HTML5, les balises sémantiques et la structure globale d\'un document.', resources: [] },
      { id: 'l2', title: 'Formulaires et Validation', duration: '1h 15m', isCompleted: false, content: 'Apprenez à créer des formulaires interactifs et à valider les données côté client.', resources: [] },
      { id: 'l3', title: 'Accessibilité Web (A11y)', duration: '1h', isCompleted: false, content: 'Rendre vos sites utilisables par tous grâce aux normes ARIA et aux bonnes pratiques.', resources: [] }
    ],
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
    description: "Explorez les algorithmes d'apprentissage supervisé et non supervisé avec Python.",
    lessons: [
      { id: 'ml1', title: 'Régression Linéaire', duration: '2h', isCompleted: false, content: 'Comprendre les bases de la prédiction numérique avec Scikit-Learn.', resources: [] },
      { id: 'ml2', title: 'Classification avec K-NN', duration: '1h 30m', isCompleted: false, content: 'Implémenter votre premier algorithme de classification.', resources: [] }
    ],
    assignedLecturerId: 'prof1'
  },
  { 
    id: '3', 
    thematicId: 'th3',
    title: 'Storytelling & Scénarisation', 
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800', 
    status: 'To Do',
    duration: '15h',
    category: 'Audiovisuel',
    description: "L'art de raconter des histoires captivantes pour le cinéma et le web.",
    lessons: [
      { id: 'st1', title: 'La Structure en 3 Actes', duration: '1h', isCompleted: false, content: 'Maîtriser le rythme narratif classique.', resources: [] },
      { id: 'st2', title: 'Développement de Personnages', duration: '1h 30m', isCompleted: false, content: 'Créer des protagonistes profonds et mémorables.', resources: [] }
    ],
    assignedLecturerId: 'prof2'
  },
  { 
    id: '4', 
    thematicId: 'th2',
    title: 'Arduino & IoT Avancé', 
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', 
    status: 'To Do',
    duration: '30h',
    category: 'Robotique',
    description: "Connectez vos objets au cloud et créez des systèmes intelligents.",
    lessons: [
      { id: 'iot1', title: 'Protocoles MQTT & HTTP', duration: '2h', isCompleted: false, content: 'Faire communiquer vos capteurs avec un serveur.', resources: [] },
      { id: 'iot2', title: 'Gestion de l\'Énergie', duration: '1h', isCompleted: false, content: 'Optimiser la consommation de vos projets sur batterie.', resources: [] }
    ],
    assignedLecturerId: 'prof1'
  }
];

export const MISSIONS: Mission[] = [
  { id: 'm1', title: 'Landing Page Responsive', description: 'Design mobile-first pour une startup fictive.', deadline: '25 Mars 2025', status: 'Validated', courseId: '1', points: 500 },
  { id: 'm2', title: 'Modèle de classification', description: 'Prédire les prix immobiliers avec Random Forest.', deadline: '05 Avril 2025', status: 'Pending', courseId: '2', points: 800 },
  { id: 'm3', title: 'Court-métrage 2min', description: 'Réaliser un court-métrage muet sur le thème de l\'attente.', deadline: '15 Avril 2025', status: 'Pending', courseId: '3', points: 1200 },
  { id: 'm4', title: 'Station Météo Connectée', description: 'Envoyer des données de température sur un dashboard Adafruit IO.', deadline: '20 Avril 2025', status: 'Pending', courseId: '4', points: 1000 }
];

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Amine Alami', email: 'amine@alami.com', track: 'Code & IA', progress: 75, status: 'active', absences: 1 },
  { id: 's2', name: 'Sara Bennani', email: 'sara@bennani.com', track: 'Audiovisuel', progress: 40, status: 'active', absences: 4 },
  { id: 's3', name: 'Yassine Tazi', email: 'yassine@tazi.com', track: 'Robotique', progress: 90, status: 'active', absences: 0 },
  { id: 's4', name: 'Laila Mansouri', email: 'laila@mansouri.com', track: 'Code & IA', progress: 15, status: 'pending', absences: 6 },
  { id: 's5', name: 'Omar Chraibi', email: 'omar@chraibi.ma', track: 'Robotique', progress: 60, status: 'active', absences: 2 },
  { id: 's6', name: 'Kenza El Amrani', email: 'kenza@amrani.ma', track: 'Audiovisuel', progress: 85, status: 'active', absences: 1 },
  { id: 's7', name: 'Mehdi Filali', email: 'mehdi@filali.ma', track: 'Code & IA', progress: 50, status: 'active', absences: 3 },
  { id: 's8', name: 'Sofia Rahmouni', email: 'sofia@rahmouni.ma', track: 'Robotique', progress: 10, status: 'pending', absences: 8 },
  { id: 's9', name: 'Hassan Idrissi', email: 'hassan@idrissi.ma', track: 'Code & IA', progress: 30, status: 'active', absences: 2 },
  { id: 's10', name: 'Meryem Zahid', email: 'meryem@zahid.ma', track: 'Audiovisuel', progress: 95, status: 'active', absences: 0 },
  { id: 's11', name: 'Anas Belkhayat', email: 'anas@belkhayat.ma', track: 'Robotique', progress: 45, status: 'active', absences: 5 },
  { id: 's12', name: 'Salma Oudghiri', email: 'salma@oudghiri.ma', track: 'Code & IA', progress: 20, status: 'pending', absences: 7 },
  { id: 's13', name: 'Youssef Slaoui', email: 'youssef@slaoui.ma', track: 'Robotique', progress: 70, status: 'active', absences: 1 },
  { id: 's14', name: 'Nadia Guessous', email: 'nadia@guessous.ma', track: 'Audiovisuel', progress: 55, status: 'active', absences: 2 },
  { id: 's15', name: 'Tariq Berrada', email: 'tariq@berrada.ma', track: 'Code & IA', progress: 80, status: 'active', absences: 0 },
  { id: 's16', name: 'Zineb Lahlou', email: 'zineb@lahlou.ma', track: 'Robotique', progress: 35, status: 'active', absences: 4 }
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Alerte Absence', message: 'Sara Bennani a dépassé le seuil autorisé.', time: '12m', type: 'alert', read: false },
  { id: '2', title: 'Nouveau Module', message: 'Le module "Arduino & IoT Avancé" est maintenant disponible.', time: '1h', type: 'system', read: false },
  { id: '3', title: 'Mission Validée', message: 'Votre mission "Landing Page Responsive" a été validée avec succès.', time: '2h', type: 'feedback', read: true },
  { id: '4', title: 'Rappel Échéance', message: 'La mission "Modèle de classification" arrive à échéance dans 2 jours.', time: '5h', type: 'alert', read: false },
  { id: '5', title: 'Message Intervenant', message: 'Dr. Karimi a laissé un commentaire sur votre dernier rendu.', time: '1j', type: 'feedback', read: true }
];
