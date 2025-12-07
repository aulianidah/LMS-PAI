export type UserRole = 'student' | 'teacher';
export type ClassName = '7A' | '7B' | '7C' | '7D' | '7E' | '7F';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username?: string; // For teachers
  password?: string; // For teachers
  className?: ClassName; // For students
  bio?: string;
  avatar?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'text' | 'link';
  content: string; // URL or text content
  uploadedBy: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetClass: ClassName | 'All';
  date: string;
  authorName: string;
}

export type AssignmentType = 'multiple_choice' | 'essay' | 'upload' | 'manual';

export interface Question {
  id: string;
  text: string;
  options?: string[]; // For multiple choice
  correctOptionIndex?: number; // For auto-grading PG (optional usage)
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  questions: Question[]; // For PG and Essay
  targetClass: ClassName | 'All';
  dueDate: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  className: ClassName;
  answers: Record<string, any>; // Keyed by Question ID, value is answer
  fileUrl?: string; // For upload type
  status: 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  assignments: Assignment[];
  submissions: Submission[];
  resources: Resource[];
  announcements: Announcement[];
}