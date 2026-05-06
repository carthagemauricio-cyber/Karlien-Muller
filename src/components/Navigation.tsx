import React from 'react';
import { Home, Users, Scissors, CalendarPlus, CalendarDays, LogOut, Settings as SettingsIcon, CalendarCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 group",
        isActive 
          ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-200" 
          : "text-gray-600 hover:bg-gray-100 hover:text-primary-700"
      )}
    >
      <div className={cn("p-1.5 rounded-xl transition-colors", isActive ? "bg-primary-100 text-primary-600" : "group-hover:bg-gray-200")}>
        {icon}
      </div>
      <span className={cn("font-medium tracking-wide", isActive ? "font-bold" : "")}>{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-4 bg-primary-500 rounded-full"></div>}
    </button>
  );
};

export const Sidebar = ({ 
  currentView, 
  setCurrentView,
  onBackToLanding
}: { 
  currentView: string; 
  setCurrentView: (view: string) => void;
  onBackToLanding: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-gray-200 bg-gray-50 p-6 glass-panel md:flex sticky top-0">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-100 bg-primary-50 text-primary-600 shadow-md shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-900 tracking-tight leading-tight">Marca<span className="text-secondary-500">Já</span></h1>
            <p className="text-[10px] font-medium text-gray-500 tracking-[0.2em] uppercase leading-tight mt-0.5">Agendamentos</p>
          </div>
        </div>
        <div className="px-2">
          <LanguageSwitcher className="w-full justify-center bg-gray-100 text-secondary-100 border-gray-300" />
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1 pt-4">
        <NavItem 
          icon={<Home size={20} />} 
          label={t('navigation.dashboard')} 
          isActive={currentView === 'dashboard'} 
          onClick={() => setCurrentView('dashboard')} 
        />
        <NavItem 
          icon={<CalendarDays size={20} />} 
          label={t('navigation.agenda')} 
          isActive={currentView === 'calendar'} 
          onClick={() => setCurrentView('calendar')} 
        />
        <NavItem 
          icon={<CalendarPlus size={20} />} 
          label={t('navigation.book')} 
          isActive={currentView === 'book'} 
          onClick={() => setCurrentView('book')} 
        />
        
        <div className="mt-8 mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          {t('navigation.management', 'Gestão')}
        </div>
        <NavItem 
          icon={<Users size={20} />} 
          label={t('navigation.professionals')} 
          isActive={currentView === 'professionals'} 
          onClick={() => setCurrentView('professionals')} 
        />
        <NavItem 
          icon={<Scissors size={20} />} 
          label={t('navigation.services')} 
          isActive={currentView === 'services'} 
          onClick={() => setCurrentView('services')} 
        />
        <div className="mt-4 mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          {t('navigation.system', 'Sistema')}
        </div>
        <NavItem 
          icon={<SettingsIcon size={20} />} 
          label={t('navigation.settings', 'Configurações')} 
          isActive={currentView === 'settings'} 
          onClick={() => setCurrentView('settings')} 
        />
      </nav>

      <div className="pt-6 border-t border-gray-200 mt-auto">
        <button
          onClick={onBackToLanding}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-gray-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-rose-500/20 transition-colors">
            <LogOut size={20} />
          </div>
          <span className="font-medium tracking-wide">{t('navigation.exit', 'Sair')}</span>
        </button>
      </div>
    </aside>
  );
};

export const MobileNav = ({ 
  currentView, 
  setCurrentView,
  onBackToLanding
}: { 
  currentView: string; 
  setCurrentView: (view: string) => void;
  onBackToLanding: () => void;
}) => {
  const { t } = useTranslation();
  const navItems = [
    { id: 'dashboard', icon: Home, label: t('navigation.home') },
    { id: 'calendar', icon: CalendarDays, label: t('navigation.agenda') },
    { id: 'book', icon: CalendarPlus, label: t('navigation.book_mobile', 'Agendar') },
    { id: 'professionals', icon: Users, label: t('navigation.team') },
    { id: 'settings', icon: SettingsIcon, label: t('navigation.settings', 'Configurações') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-gray-200 bg-gray-50/90 p-2 pb-safe md:hidden backdrop-blur-md overflow-x-auto no-scrollbar">
      <div className="flex justify-start min-w-max px-2 sm:justify-around items-center relative gap-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-16 flex-1",
                isActive ? "text-primary-700" : "text-gray-500 hover:text-primary-600"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl mb-1 transition-all",
                isActive ? "bg-primary-100 text-primary-600 shadow-sm border border-primary-200" : "bg-transparent"
              )}>
                <Icon size={20} className={isActive ? "" : ""} />
              </div>
              <span className={cn("text-[10px] font-medium tracking-tight", isActive ? "font-bold" : "")}>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onBackToLanding}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 text-rose-500/60"
        >
          <div className="p-1.5 rounded-full mb-1 transition-all bg-transparent">
            <LogOut size={20} />
          </div>
          <span className="text-[10px] font-medium tracking-tight">{t('navigation.exit', 'Sair')}</span>
        </button>
      </div>
    </div>
  );
};
