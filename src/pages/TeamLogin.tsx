import React, { useState } from 'react';
import { LogIn, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { signInWithPopup, signInWithRedirect, browserPopupRedirectResolver } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

interface TeamLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function TeamLogin({ onBack, onLoginSuccess }: TeamLoginProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Attempt popup first
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      toast.success('Login efetuado com sucesso!');
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If popup is blocked, provide guidance or fallback
      if (error.code === 'auth/popup-blocked') {
        toast.error('O pop-up de login foi bloqueado pelo navegador. Por favor, permita pop-ups para este site.', { duration: 5000 });
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        toast.error('O login foi cancelado.');
      } else {
        toast.error('Falha na autenticação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-900 p-4 md:p-8 font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 hover:bg-charcoal-800 rounded-full transition-colors text-charcoal-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium tracking-wide uppercase">Voltar</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 md:p-10 rounded-[32px] border border-charcoal-700 bg-charcoal-800/80 shadow-2xl backdrop-blur-xl flex flex-col items-center">
          
          <div className="w-16 h-16 rounded-full bg-charcoal-700 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-[0_0_30px_rgba(255,79,163,0.3)] mb-8">
            <ShieldCheck size={32} strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-serif text-white mb-2 text-center tracking-tight">Acesso Restrito</h2>
          <p className="text-charcoal-400 text-sm text-center mb-10 tracking-wide">
            Área exclusiva para a gestão da equipe Karlien Muller.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full relative overflow-hidden group rounded-2xl bg-gradient-to-r from-primary-500 hover:from-primary-400 to-secondary-500 hover:to-secondary-400 p-[1px] transition-all hover:shadow-[0_0_40px_rgba(200,162,255,0.4)]"
          >
            <div className="bg-charcoal-800 rounded-2xl w-full h-full flex items-center justify-center p-4 gap-3 transition-colors group-hover:bg-charcoal-800/80">
              {loading ? (
                <Loader2 className="w-5 h-5 text-secondary-400 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-semibold text-white tracking-wide">
                    Continuar com Google
                  </span>
                </>
              )}
            </div>
          </button>
          
          <p className="mt-8 text-xs text-charcoal-500 text-center max-w-[250px] leading-relaxed">
            O acesso a esta área requer uma conta Google autorizada pelo administrador.
          </p>

        </div>
      </div>
    </div>
  );
}
