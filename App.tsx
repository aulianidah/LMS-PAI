import React from 'react';
import { LMSProvider, useLMS } from './context';
import { Landing } from './pages/Landing';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';

const Main: React.FC = () => {
  const { currentUser } = useLMS();

  if (!currentUser) {
    return <Landing />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};

const App: React.FC = () => {
  return (
    <LMSProvider>
      <Main />
    </LMSProvider>
  );
};

export default App;
