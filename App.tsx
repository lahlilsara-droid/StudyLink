
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ViewState, UserRole } from './types';
import LandingView from './views/LandingView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ApplicationView from './views/ApplicationView';
import { ChatWidget } from './ChatWidget';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreUtils';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role as UserRole);
            setUserName(userData.name || user.displayName || user.email?.split('@')[0] || 'Utilisateur');
          } else {
            // Default role if not found in DB
            setUserRole('student');
            setUserName(user.displayName || user.email?.split('@')[0] || 'Utilisateur');
          }
          setView('dashboard');
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          setUserRole('student');
          setUserName(user.email?.split('@')[0] || 'Utilisateur');
          setView('dashboard');
        }
      } else {
        // Only clear if we are not in a demo session (where userRole might be set manually)
        // However, for simplicity in this prototype, we'll just let handleLogout handle the view state
        setUserRole(null);
        setUserName('');
        setView('home');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setUserName('');
      setView('home');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
        <div className="w-12 h-12 border-4 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <AnimatePresence mode="wait">
        {view === 'home' && <LandingView key="home" onSetView={setView} />}
        {view === 'login' && <LoginView key="login" onLogin={handleLogin} onCancel={() => setView('home')} />}
        {view === 'dashboard' && userRole && <DashboardView key="dash" role={userRole} userName={userName} onLogout={handleLogout} onOpenChat={() => setIsChatOpen(true)} />}
        {view === 'apply' && <ApplicationView key="apply" onCancel={() => setView('home')} onComplete={() => setView('home')} />}
      </AnimatePresence>

      <ChatWidget isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default App;
