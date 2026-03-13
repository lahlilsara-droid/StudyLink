
export type ViewState = 'home' | 'login' | 'dashboard' | 'apply';
export type UserRole = 'student' | 'admin' | 'professor';
export type CourseStatus = 'To Do' | 'In Progress' | 'Completed' | 'Inactive';
export type MissionStatus = 'Pending' | 'Submitted' | 'Validated' | 'Returned';

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  content: string;
  resources: Resource[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: MissionStatus;
  courseId: string;
  points: number;
  studentId?: string;
}

export interface Thematic {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Course {
  id: string;
  thematicId: string;
  title: string;
  image: string;
  status: CourseStatus;
  duration: string;
  category: string;
  description: string;
  lessons: Lesson[];
  assignedLecturerId?: string; // L'intervenant assigné par le Directeur
}

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  activeModuleIds: string[]; // Modules activés pour cette promo
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
  specialty: string;
  avatar: string;
  joinedDate: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  track: string;
  progress: number;
  status: 'active' | 'pending' | 'rejected';
  absences: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'feedback' | 'system' | 'alert';
  read: boolean;
}
