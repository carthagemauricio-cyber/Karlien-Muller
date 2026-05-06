import React, { useState } from 'react';
import { Scissors, CalendarHeart, UserCog, ArrowRight, X, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export const Landing = ({ onSelectMode }: { onSelectMode: (mode: 'client' | 'admin') => void }) => {
  const { t } = useTranslation();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  React.useEffect(() => {
    // Explicitly reset the password to 123456 during this update, 
    // to override any existing authentication as per the user's manual instruction.
    if (localStorage.getItem('admin_password_force_reset_v1') !== 'true') {
      localStorage.setItem('admin_password', '123456');
      localStorage.setItem('admin_password_force_reset_v1', 'true');
    }
  }, []);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure default password is set if not exists
    if (!localStorage.getItem('admin_password')) {
      localStorage.setItem('admin_password', '123456');
    }
    
    const storedPassword = localStorage.getItem('admin_password');
    // Username can be anything as long as the password is correct, 
    // or we can mandate a specific username like 'admin' if requested. 
    // The prompt just says "all team members use this password" and "Display a login form with Username, Password".
    if (username.trim() && password === storedPassword) {
      try {
        onSelectMode('admin');
        toast.success(t('auth.success', 'Acesso concedido'));
      } catch (err) {
        toast.error(t('auth.db_error', 'Erro ao autenticar no banco de dados'));
      }
    } else if (!username.trim()) {
      toast.error(t('auth.username_required', 'O utilizador é obrigatório'));
    } else {
      toast.error(t('auth.error', 'Credenciais incorretas'));
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      {/* Left/Top Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" 
          alt="MarcaJá Appointments" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-gray-100/40 to-transparent flex flex-col justify-end p-16">
          <h2 className="text-5xl font-sans text-gray-900 mb-4 whitespace-pre-line leading-tight">{t('landing.hero_title')}</h2>
          <div className="h-1 w-24 bg-primary-400 mb-6"></div>
          <p className="text-gray-700 text-lg max-w-sm font-light">
            {t('landing.hero_subtitle')}
          </p>
        </div>
      </div>

      {/* Right/Bottom Content Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-white">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary-900/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10 flex flex-col items-center lg:items-start">
          <div className="flex flex-col items-center group cursor-pointer mb-12">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border border-primary-100 flex items-center justify-center mb-4 transition-all duration-700 bg-gradient-to-br from-gray-50 via-gray-100 to-white group-hover:scale-105 shadow-xl shadow-primary-500/10 overflow-hidden">
                <div className="absolute inset-1 rounded-3xl border border-white/50"></div>
                <CalendarHeart className="w-12 h-12 md:w-16 md:h-16 text-primary-500 z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight text-primary-900">Marca<span className="text-secondary-500">Já</span></h2>
              <div className="h-px w-12 bg-primary-400/40 mt-2 group-hover:w-24 transition-all duration-500"></div>
              <p className="text-[10px] text-gray-500 tracking-[0.6em] uppercase mt-2 font-bold opacity-70">Agendamentos</p>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-sans font-medium text-gray-900 mb-2 text-center lg:text-left tracking-tight hidden">
            MarcaJá Appointments
          </h1>
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-primary-600/80">AGENDE • CONFIRME • ORGANIZE</span>
          </div>
          
          <p className="text-gray-600 text-center lg:text-left mb-12 text-lg font-light">
            {t('landing.access_prompt')}
          </p>

          <div className="space-y-5 w-full">
            {/* Client Option */}
            <button 
              onClick={() => onSelectMode('client')}
              className="w-full group bg-gray-50/50 p-6 rounded-[32px] border border-primary-900/30 hover:border-primary-400/50 shadow-sm hover:shadow-2xl hover:shadow-primary-900/20 transition-all flex items-center gap-6 text-left focus:outline-none backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 text-primary-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-primary-400/20 shadow-inner">
                <CalendarHeart size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-sans font-medium text-primary-100 mb-1">{t('landing.i_am_client')}</h3>
                <p className="text-sm text-gray-600 font-light">{t('landing.client_desc')}</p>
              </div>
              <div className="text-primary-400/30 group-hover:text-primary-400 group-hover:translate-x-1 transition-all">
                <ArrowRight size={24} />
              </div>
            </button>

            {/* Admin Option */}
            {!showPasswordPrompt ? (
              <button 
                onClick={() => setShowPasswordPrompt(true)}
                className="w-full group bg-gray-50/30 p-6 rounded-[32px] border border-transparent hover:border-secondary-600 transition-all flex items-center gap-6 text-left focus:outline-none"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100/50 text-secondary-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserCog size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-sans font-medium text-gray-900 mb-1">{t('landing.i_am_team')}</h3>
                  <p className="text-sm text-gray-500 font-light">{t('landing.team_desc')}</p>
                </div>
                <div className="text-gray-400 group-hover:text-secondary-500 group-hover:translate-x-1 transition-all">
                  <ArrowRight size={24} />
                </div>
              </button>
            ) : (
              <form onSubmit={handleAdminAuth} className="w-full bg-gray-50/50 p-6 rounded-[32px] border border-secondary-600 shadow-sm transition-all focus:outline-none backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPassword('');
                  }}
                  className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100/50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft size={16} />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100/50 text-secondary-300 flex items-center justify-center shrink-0">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-medium text-gray-900">{t('auth.admin_access', 'Acesso Restrito')}</h3>
                    <p className="text-xs text-gray-500 font-light">{t('auth.enter_password', 'Insira a palavra-passe para continuar')}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.username_placeholder', 'Utilizador')}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-secondary-500 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.password_placeholder', 'Palavra-passe')}
                      className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-secondary-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPasswordPrompt(false);
                      setPassword('');
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    {t('common.back', 'Voltar')}
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
          
          <div className="mt-20 text-center lg:text-left text-[10px] font-medium text-gray-400 uppercase tracking-[0.4em]">
            {t('landing.location')} &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
