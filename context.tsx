import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Assignment, Submission, Resource, Announcement, ClassName } from './types';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  { id: 't1', name: 'Mr. Clarke', role: 'teacher', username: 'admin', password: 'password', bio: 'Curiosity is the key to unlocking the world.' },
  { id: 's1', name: 'Mike Wheeler', role: 'student', className: '7A', bio: 'Leader of the party.' },
  { id: 's2', name: 'Dustin Henderson', role: 'student', className: '7A', bio: 'Compass genius.' },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Selamat Datang', content: 'Selamat datang di Hawkins Learning Lab. Persiapkan diri kalian.', targetClass: 'All', date: new Date().toISOString(), authorName: 'Mr. Clarke' }
];

interface LMSContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  updateUserBio: (bio: string) => void;
  updateUserAvatar: (avatar: string) => void;
  updateTeacherCredentials: (username: string, password?: string) => void;
  deleteUser: (userId: string) => void;
  addAssignment: (assignment: Assignment) => void;
  addResource: (resource: Resource) => void;
  addAnnouncement: (announcement: Announcement) => void;
  addSubmission: (submission: Submission) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  registerStudent: (name: string, className: ClassName) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('hawkins_lms_data_v1');
    return saved ? JSON.parse(saved) : {
      currentUser: null,
      users: INITIAL_USERS,
      assignments: [],
      submissions: [],
      resources: [],
      announcements: INITIAL_ANNOUNCEMENTS,
    };
  });

  useEffect(() => {
    localStorage.setItem('hawkins_lms_data_v1', JSON.stringify(state));
  }, [state]);

  const login = (user: User) => setState(prev => ({ ...prev, currentUser: user }));
  
  const logout = () => setState(prev => ({ ...prev, currentUser: null }));

  const updateUserBio = (bio: string) => {
    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, bio } : null,
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, bio } : u)
    }));
  };

  const updateUserAvatar = (avatar: string) => {
    setState(prev => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, avatar } : null,
      users: prev.users.map(u => u.id === prev.currentUser?.id ? { ...u, avatar } : u)
    }));
  };

  const updateTeacherCredentials = (username: string, password?: string) => {
    setState(prev => {
        if (!prev.currentUser) return prev;
        const updatedUser = { ...prev.currentUser, username, ...(password ? { password } : {}) };
        return {
            ...prev,
            currentUser: updatedUser,
            users: prev.users.map(u => u.id === prev.currentUser?.id ? updatedUser : u)
        };
    });
  };

  const deleteUser = (userId: string) => {
      setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== userId)
      }));
  };

  const addAssignment = (assignment: Assignment) => {
    setState(prev => ({ ...prev, assignments: [assignment, ...prev.assignments] }));
  };

  const addResource = (resource: Resource) => {
    setState(prev => ({ ...prev, resources: [resource, ...prev.resources] }));
  };

  const addAnnouncement = (announcement: Announcement) => {
    setState(prev => ({ ...prev, announcements: [announcement, ...prev.announcements] }));
  };

  const addSubmission = (submission: Submission) => {
    setState(prev => ({
      ...prev,
      submissions: [...prev.submissions.filter(s => s.assignmentId !== submission.assignmentId || s.studentId !== submission.studentId), submission]
    }));
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    setState(prev => ({
      ...prev,
      submissions: prev.submissions.map(s => s.id === submissionId ? { ...s, status: 'graded', grade, feedback } : s)
    }));
  };

  const registerStudent = (name: string, className: ClassName) => {
    const newUser: User = {
      id: `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      className,
      role: 'student',
      bio: 'Ready to learn.'
    };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  return (
    <LMSContext.Provider value={{
      ...state,
      login,
      logout,
      updateUserBio,
      updateUserAvatar,
      updateTeacherCredentials,
      deleteUser,
      addAssignment,
      addResource,
      addAnnouncement,
      addSubmission,
      gradeSubmission,
      registerStudent
    }}>
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) throw new Error('useLMS must be used within LMSProvider');
  return context;
};