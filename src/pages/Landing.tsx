import React, { useState } from 'react';
import { Scissors, CalendarHeart, UserCog, ArrowRight, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const Landing = ({ onSelectMode }: { onSelectMode: (mode: 'client' | 'admin') => void }) => {
  const { t } = useTranslation();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      onSelectMode('admin');
      toast.success(t('auth.success', 'Acesso concedido'));
    } else {
      toast.error(t('auth.error', 'Palavra-passe incorreta'));
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen bg-charcoal-900 relative">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      {/* Left/Top Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-charcoal-900">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" 
          alt="Karlien Muller Hair" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent flex flex-col justify-end p-16">
          <h2 className="text-5xl font-serif text-white mb-4 whitespace-pre-line leading-tight">{t('landing.hero_title')}</h2>
          <div className="h-1 w-24 bg-primary-400 mb-6"></div>
          <p className="text-charcoal-300 text-lg max-w-sm font-light">
            {t('landing.hero_subtitle')}
          </p>
        </div>
      </div>

      {/* Right/Bottom Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-charcoal-900">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10 flex flex-col items-center lg:items-start">
          <div className="flex flex-col items-center group cursor-pointer mb-12">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-primary-400 flex items-center justify-center mb-4 transition-all duration-700 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-950 group-hover:scale-110 shadow-[0_0_50px_rgba(255,79,163,0.1)] group-hover:shadow-[0_0_80px_rgba(200,162,255,0.2)] overflow-hidden">
                <div className="absolute inset-1 rounded-full border border-primary-400/20"></div>
                <span className="text-4xl md:text-6xl font-serif font-light text-primary-400 tracking-tighter z-10">KM</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-serif font-light text-primary-400 tracking-[0.4em] uppercase">Karlien Muller</h2>
              <div className="h-px w-12 bg-primary-400/40 mt-2 group-hover:w-24 transition-all duration-500"></div>
              <p className="text-[10px] text-charcoal-500 tracking-[0.6em] uppercase mt-2 font-bold opacity-70">Hair Studio</p>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-white mb-2 text-center lg:text-left tracking-tight hidden">
            Karlien Muller Hair
          </h1>
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="h-px w-8 bg-secondary-400/50"></div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-secondary-400/80">Hair • Beauty • Confidence</span>
            <div className="h-px w-8 bg-secondary-400/50"></div>
          </div>
          
          <p className="text-charcoal-400 text-center lg:text-left mb-12 text-lg font-light">
            {t('landing.access_prompt')}
          </p>

          <div className="space-y-5 w-full">
            {/* Client Option */}
            <button 
              onClick={() => onSelectMode('client')}
              className="w-full group bg-charcoal-800/50 p-6 rounded-[32px] border border-primary-900/30 hover:border-primary-400/50 shadow-sm hover:shadow-2xl hover:shadow-primary-900/20 transition-all flex items-center gap-6 text-left focus:outline-none backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-full bg-charcoal-700 text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-primary-400/20 shadow-inner">
                <CalendarHeart size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-medium text-primary-100 mb-1">{t('landing.i_am_client')}</h3>
                <p className="text-sm text-charcoal-400 font-light">{t('landing.client_desc')}</p>
              </div>
              <div className="text-primary-400/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all">
                <ArrowRight size={24} />
              </div>
            </button>

            {/* Admin Option */}
            {!showPasswordPrompt ? (
              <button 
                onClick={() => setShowPasswordPrompt(true)}
                className="w-full group bg-charcoal-800/30 p-6 rounded-[32px] border border-transparent hover:border-secondary-600 transition-all flex items-center gap-6 text-left focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full bg-charcoal-700/50 text-secondary-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCog size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-medium text-charcoal-100 mb-1">{t('landing.i_am_team')}</h3>
                  <p className="text-sm text-charcoal-500 font-light">{t('landing.team_desc')}</p>
                </div>
                <div className="text-charcoal-700 group-hover:text-secondary-500 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={24} />
                </div>
              </button>
            ) : (
              <form onSubmit={handleAdminAuth} className="w-full bg-charcoal-800/50 p-6 rounded-[32px] border border-secondary-600 shadow-sm transition-all focus:outline-none backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-charcoal-700/50 text-secondary-300 flex items-center justify-center shrink-0">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-medium text-charcoal-100">{t('auth.admin_access', 'Acesso Restrito')}</h3>
                    <p className="text-xs text-charcoal-500 font-light">{t('auth.enter_password', 'Insira a palavra-passe para continuar')}</p>
                  </div>
                </div>
                
                <div className="relative mb-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Palavra-passe"
                    className="w-full bg-charcoal-900 border border-charcoal-600 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-secondary-500 transition-colors"
                    autoFocus
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPassword('');
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl border border-charcoal-600 text-charcoal-300 font-medium hover:bg-charcoal-700 transition-colors"
                  >
                    {t('common.cancel', 'Cancelar')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-secondary-500 to-primary-500 text-white font-medium shadow-lg hover:shadow-primary-500/25 transition-all text-center"
                  >
                    {t('common.enter', 'Entrar')}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className="mt-20 text-center lg:text-left text-[10px] font-medium text-charcoal-600 uppercase tracking-[0.4em]">
            {t('landing.location')} &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
