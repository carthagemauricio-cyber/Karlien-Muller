import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './store';
import { Sidebar, MobileNav } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ClientBooking } from './pages/ClientBooking';
import { ClientAppointments } from './pages/ClientAppointments';
import { Professionals } from './pages/Professionals';
import { ServicesPage } from './pages/Services';
import { CalendarView } from './pages/CalendarView';
import { Landing } from './pages/Landing';
import { TeamLogin } from './pages/TeamLogin';
import { ArrowLeft } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

function AppContent() {
  const [appMode, setAppMode] = useState<'landing' | 'client' | 'admin'>('landing');
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
    });
    return () => unsub();
  }, []);

  if (appMode === 'landing') {
    return <Landing onSelectMode={setAppMode} />;
  }

  if (appMode === 'client') {

    return (
      <div className="flex flex-col min-h-screen bg-charcoal-900 font-sans text-charcoal-100">
        <header className="bg-charcoal-800/80 backdrop-blur-xl border-b border-charcoal-700 p-4 md:px-8 sticky top-0 z-10 flex justify-between items-center shadow-2xl">
           <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-400/30 bg-charcoal-700 text-primary-400 shadow-lg">
               <span className="text-xl font-serif font-light -tracking-widest">KM</span>
             </div>
             <div className="hidden sm:block">
               <h1 className="text-lg font-serif font-medium text-white tracking-widest uppercase leading-tight">Karlien Muller</h1>
               <p className="text-[9px] font-bold text-secondary-400/60 tracking-[0.3em] uppercase leading-tight">Hair Studio</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
             <button 
               onClick={() => setCurrentView('book')}
               className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-4 py-3 rounded-xl border font-ui ${currentView === 'book' ? 'text-primary-400 border-primary-400/30 bg-primary-400/10' : 'text-charcoal-400 border-transparent hover:text-primary-400 hover:bg-charcoal-700'}`}
             >
               Agendar
             </button>
             <button 
               onClick={() => setCurrentView('my-appointments')}
               className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-4 py-3 rounded-xl border font-ui ${currentView === 'my-appointments' ? 'text-primary-400 border-primary-400/30 bg-primary-400/10' : 'text-charcoal-400 border-transparent hover:text-primary-400 hover:bg-charcoal-700'}`}
             >
               Consultar
             </button>

             <div className="w-px h-6 bg-charcoal-700 mx-1 md:mx-2 hidden sm:block"></div>

             <button 
               onClick={() => setAppMode('landing')}
               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal-400 hover:text-secondary-400 transition-all bg-charcoal-800 px-6 py-3 rounded-full border border-charcoal-700 shadow-lg font-ui"
             >
               <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar</span>
             </button>
           </div>
        </header>

        <main className="flex-1 w-full relative">
          {currentView === 'my-appointments' ? <ClientAppointments /> : <ClientBooking onGoToAppointments={() => setCurrentView('my-appointments')} />}
        </main>
      </div>
    );
  }

  if (appMode === 'admin' && authChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-charcoal-900 border-charcoal-800">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (appMode === 'admin' && !user) {
    return <TeamLogin onBack={() => setAppMode('landing')} onLoginSuccess={() => {}} />;
  }

  const handleSignOut = () => {
    auth.signOut();
    setAppMode('landing');
  };

  return (
    <div className="flex h-screen bg-charcoal-900 overflow-hidden font-sans text-charcoal-100">
      <Sidebar 

        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onBackToLanding={handleSignOut}
      />
      
      <main className="flex-1 overflow-y-auto w-full relative h-[100dvh]">
        <div className="pb-32 md:pb-10">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'book' && <ClientBooking />}
          {currentView === 'professionals' && <Professionals />}
          {currentView === 'services' && <ServicesPage />}
        </div>
      </main>

      <MobileNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onBackToLanding={handleSignOut}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '24px',
            background: '#1a1a1a',
            color: '#ff4fa3',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 79, 163, 0.2)',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            padding: '16px 24px',
          },
        }}
      />
    </AppProvider>
  );
}
