import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('pt') ? 'en' : 'pt';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors text-sm font-medium",
        className
      )}
    >
      <Globe size={16} className="text-amber-500" />
      <span className="uppercase">{i18n.language.slice(0, 2)}</span>
    </button>
  );
};
