import React from 'react';
import { Home, Users, Scissors, CalendarPlus, CalendarDays, LogOut } from 'lucide-react';
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
          ? "bg-primary-400/10 text-primary-400 shadow-sm border border-primary-400/20" 
          : "text-charcoal-400 hover:bg-charcoal-700 hover:text-secondary-200"
      )}
    >
      <div className={cn("p-1.5 rounded-xl transition-colors", isActive ? "bg-primary-400/20" : "group-hover:bg-charcoal-600")}>
        {icon}
      </div>
      <span className={cn("font-medium tracking-wide", isActive ? "font-semibold" : "")}>{label}</span>
      {isActive && <div className="ml-auto w-1 h-4 bg-primary-400 rounded-full"></div>}
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
    <aside className="hidden h-screen w-72 flex-col border-r border-charcoal-700 bg-charcoal-800 p-6 glass-panel md:flex sticky top-0">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-4 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-400/30 bg-charcoal-700 text-primary-400 shadow-lg shadow-black/50 shrink-0">
            <span className="text-xl font-serif font-light -tracking-widest">KM</span>
          </div>
          <div>
            <h1 className="text-[15px] font-serif font-medium text-white tracking-[0.1em] uppercase leading-tight">Karlien Muller</h1>
            <p className="text-[8px] font-bold text-secondary-400/60 tracking-[0.3em] uppercase">Hair Studio</p>
          </div>
        </div>
        <div className="px-2">
          <LanguageSwitcher className="w-full justify-center bg-charcoal-700 text-secondary-100 border-charcoal-600" />
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
        
        <div className="mt-8 mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
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
      </nav>

      <div className="pt-6 border-t border-charcoal-700 mt-auto">
        <button
          onClick={onBackToLanding}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-charcoal-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
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
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-charcoal-700 bg-charcoal-800/90 p-2 pb-safe md:hidden backdrop-blur-md">
      <div className="flex justify-around items-center relative">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16",
                isActive ? "text-primary-400" : "text-charcoal-500"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full mb-1 transition-all",
                isActive ? "bg-primary-400/10" : "bg-transparent"
              )}>
                <Icon size={20} className={isActive ? "text-primary-400" : ""} />
              </div>
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
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
