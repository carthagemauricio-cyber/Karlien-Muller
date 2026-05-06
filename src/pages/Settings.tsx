import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Settings = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || '123456';
    
    if (currentPassword !== storedPassword) {
      toast.error(t('settings.incorrect_current_password', 'A palavra-passe atual está incorreta'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.passwords_dont_match', 'As novas palavras-passe não coincidem'));
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error(t('settings.password_too_short', 'A nova palavra-passe deve ter pelo menos 6 caracteres'));
      return;
    }
    
    localStorage.setItem('admin_password', newPassword);
    toast.success(t('settings.password_changed', 'Palavra-passe alterada com sucesso'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 md:pb-10 relative min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-sans font-medium text-gray-900 mb-2">{t('settings.title', 'Configurações de Segurança')}</h1>
        <div className="h-1 w-20 bg-primary-400 mb-2"></div>
        <p className="text-gray-600 font-light">{t('settings.subtitle', 'Gerencie as credenciais de acesso da equipe')}</p>
      </div>

      <div className="bg-gray-50 rounded-[40px] p-8 md:p-10 shadow-2xl border border-gray-200 max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary-400/10 rounded-full flex items-center justify-center text-primary-400">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-medium text-gray-900">{t('settings.change_password', 'Alterar Palavra-passe')}</h2>
            <p className="text-sm text-gray-600 font-light">{t('settings.change_password_desc', 'Defina uma nova palavra-passe para a área da equipe')}</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest ml-2">
              {t('settings.current_password', 'Palavra-passe Atual')}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-primary-400/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest ml-2">
              {t('settings.new_password', 'Nova Palavra-passe')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-primary-400/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest ml-2">
              {t('settings.confirm_password', 'Confirmar Nova Palavra-passe')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-gray-900 focus:outline-none focus:border-primary-400/50 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-500 text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-primary-900/20 transition-all text-xs uppercase tracking-[0.2em] font-sans pt-6 mt-4"
          >
            <Save size={18} /> {t('common.save', 'Guardar Alterações')}
          </button>
        </form>
      </div>
    </div>
  );
};
