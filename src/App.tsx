import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppStore } from './store';
import { Sidebar, MobileNav } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ClientBooking } from './pages/ClientBooking';
import { ClientAppointments } from './pages/ClientAppointments';
import { Professionals } from './pages/Professionals';
import { ServicesPage } from './pages/Services';
import { CalendarView } from './pages/CalendarView';
import { Landing } from './pages/Landing';
import { Settings } from './pages/Settings';
import { ArrowLeft, CalendarCheck } from 'lucide-react';

function AppContent() {
  const [appMode, setAppMode] = useState<'landing' | 'client' | 'admin'>('landing');
  const [currentView, setCurrentView] = useState('dashboard');
  const { setAdminMode } = useAppStore();

  useEffect(() => {
    setAdminMode(appMode === 'admin');
  }, [appMode, setAdminMode]);

  if (appMode === 'landing') {
    return (
       <>
         <Landing onSelectMode={setAppMode} />
       </>
    );
  }

  if (appMode === 'client') {

    return (
      <div className="flex flex-col min-h-screen bg-gray-50/50 font-sans text-gray-900">
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 p-4 md:px-8 sticky top-0 z-10 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-600 shadow-sm">
               <CalendarCheck className="w-6 h-6" />
             </div>
             <div className="hidden sm:block">
               <h1 className="text-xl font-bold text-primary-900 tracking-tight leading-tight">Marca<span className="text-secondary-500">Já</span></h1>
               <p className="text-[10px] font-medium text-gray-500 tracking-widest uppercase leading-tight mt-0.5">Agendamentos</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4">
             <button 
               onClick={() => setCurrentView('book')}
               className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-4 py-3 rounded-xl border ${currentView === 'book' ? 'text-primary-700 border-primary-200 bg-primary-50 shadow-sm' : 'text-gray-600 border-transparent hover:text-primary-600 hover:bg-gray-50 hover:border-gray-200'}`}
             >
               Agendar
             </button>
             <button 
               onClick={() => setCurrentView('my-appointments')}
               className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-4 py-3 rounded-xl border ${currentView === 'my-appointments' ? 'text-primary-700 border-primary-200 bg-primary-50 shadow-sm' : 'text-gray-600 border-transparent hover:text-primary-600 hover:bg-gray-50 hover:border-gray-200'}`}
             >
               Consultar
             </button>

             <div className="w-px h-6 bg-gray-100 mx-1 md:mx-2 hidden sm:block"></div>

             <button 
               onClick={() => setAppMode('landing')}
               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-secondary-400 transition-all bg-gray-50 px-4 md:px-6 py-3 rounded-full border border-gray-200 shadow-lg font-sans"
             >
               <ArrowLeft size={16} /> <span>Voltar</span>
             </button>
           </div>
        </header>

        <main className="flex-1 w-full relative">
          {currentView === 'my-appointments' ? <ClientAppointments /> : <ClientBooking onGoToAppointments={() => setCurrentView('my-appointments')} />}
        </main>
      </div>
    );
  }

  const handleSignOut = () => {
    setAppMode('landing');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-gray-900">
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
          {currentView === 'settings' && <Settings />}
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
