/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Member, Transaction, MzungukoItem, Settings, Page, Toast, AppData } from './types';
import { loadFromStorage, saveToStorage, loadCurrentUser } from './lib/storage';
import { T } from './constants';
import { subscribeToData } from './services/firebaseService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import { AnimatePresence, motion } from 'motion/react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { THEMES } from './constants';

// Page components (To be created)
import Dashboard from './pages/Dashboard';
import Wanachama from './pages/Wanachama';
import Mzunguko from './pages/Mzunguko';
import Historia from './pages/Historia';
import Taarifa from './pages/Taarifa';
import WhatsApp from './pages/WhatsApp';
import Mipangilio from './pages/Mipangilio';
import Profile from './pages/Profile';
import PDFReport from './components/PDFReport';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData>(loadFromStorage);
  const [currentUser, setCurrentUser] = useState<Member | null>(loadCurrentUser);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Initial load animation delay
    const timer = setTimeout(() => setIsLoaded(true), 100);

    // Handle Auth Persistence and Silent Anonymous Sign-in
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Ensure we have a clean start if user changes
      if (!firebaseUser) {
        setCurrentUser(null);
        try {
          await signInAnonymously(auth);
        } catch (error: any) {
          if (error.code === 'auth/admin-restricted-operation') {
            console.warn("Firebase: Anonymous auth is disabled. Sync disabled until Login.");
          } else {
            console.error("Firebase Anonymous Login failed", error);
          }
          setIsAuthReady(false);
        }
      } else {
        setIsAuthReady(true);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubAuth();
    };
  }, []);

  /* 
  useEffect(() => {
    if (!isAuthReady) return;

    // Subscribe to Firebase Data ONLY when Auth is confirmed
    const unsubscribe = subscribeToData((newData) => {
      setData((prev) => ({ ...prev, ...newData }));
    });

    return () => unsubscribe();
  }, [isAuthReady]);
  */

  useEffect(() => {
    // Only map if strictly matching local data or hardcoded admin
    if (auth.currentUser && auth.currentUser.email === 'darnixdeveloper@gmail.com') {
      // Admin is already set in onAuthStateChanged
    } else if (auth.currentUser?.email) {
      const matchedMember = data.members.find(m => m.email === auth.currentUser?.email);
      if (matchedMember) {
        setCurrentUser(matchedMember);
      }
    }
  }, [data.members, isAuthReady]);

  useEffect(() => {
    // Save everything to storage whenever data or user changes
    saveToStorage({ ...data, currentUser });
  }, [data, currentUser]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = (user: Member) => {
    setCurrentUser(user);
    addToast(data.language === 'sw' ? `Karibu tena, ${user.name}!` : `Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveToStorage({ ...data, currentUser: null });
    setCurrentPage('Dashboard');
  };

  const updateData = (newData: Partial<AppData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const unpaidCount = useMemo(() => {
    return data.members.filter(m => !m.paid).length;
  }, [data.members]);

  const currentThemeClass = useMemo(() => {
    const theme = THEMES.find(t => t.id === data.settings.theme);
    return theme ? theme.class : 'bg-luxury-dark';
  }, [data.settings.theme]);

  if (!currentUser) {
    return (
      <div className={data.settings.theme === 'white' ? 'theme-white' : ''}>
        <Login 
          members={data.members} 
          onLogin={handleLogin} 
          lang={data.language} 
          settings={data.settings}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  const renderPage = () => {
    if (!currentUser) return null;
    
    if (currentUser.mustChangePassword) {
      return <Profile user={currentUser} data={data} lang={data.language} updateData={updateData} addToast={addToast} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard data={data} user={currentUser} addToast={addToast} />;
      case 'Wanachama':
        return <Wanachama data={data} updateData={updateData} addToast={addToast} user={currentUser} />;
      case 'Mzunguko':
        return <Mzunguko data={data} lang={data.language} />;
      case 'Historia':
        return <Historia data={data} updateData={updateData} addToast={addToast} user={currentUser} />;
      case 'Taarifa':
        return <Taarifa data={data} lang={data.language} addToast={addToast} />;
      case 'WhatsApp':
        return <WhatsApp data={data} lang={data.language} addToast={addToast} />;
      case 'Mipangilio':
        return <Mipangilio data={data} updateData={updateData} addToast={addToast} onReset={() => window.location.reload()} />;
      case 'Profile':
        return <Profile user={currentUser} data={data} lang={data.language} updateData={updateData} addToast={addToast} setCurrentPage={setCurrentPage} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`flex min-h-screen text-luxury-text font-sans selection:bg-gold/30 transition-colors duration-1000 ${currentThemeClass}`}
      style={data.settings.theme === 'custom' && data.settings.customBackground ? {
        backgroundImage: `url(${data.settings.customBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      <div className={`grain-overlay ${data.settings.theme === 'white' ? 'opacity-0' : 'opacity-0.04'}`} />
      <div className={`fixed inset-0 pointer-events-none shimmer-active ${data.settings.theme === 'white' ? 'opacity-10' : 'opacity-30'}`} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <PDFReport data={data} />

      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={(p) => {
          setCurrentPage(p);
          setIsSidebarOpen(false);
        }}
        lang={data.language}
        setLang={(l) => updateData({ language: l })}
        onLogout={handleLogout}
        user={currentUser}
        pendingCount={unpaidCount}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden p-4 border-b border-luxury-border flex justify-between items-center bg-luxury-gray sticky top-0 z-30">
          <h1 className="text-gold font-serif font-bold text-xl">Upendo VICOBA</h1>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gold bg-gold/10 rounded-md"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4 lg:p-10 max-w-7xl mx-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
