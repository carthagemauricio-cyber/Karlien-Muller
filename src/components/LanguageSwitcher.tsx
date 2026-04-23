import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language.startsWith('pt') ? 'pt' : 'en';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  const currentFlag = currentLang === 'pt' ? '🇲🇿' : '🇺🇸';
  const currentText = currentLang === 'pt' ? 'PT' : 'EN';

  return (
    <div className={cn("relative inline-block text-left", className?.includes('w-full') ? 'w-full' : '')} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors text-sm font-medium",
          className
        )}
      >
        <span className="text-lg leading-none">{currentFlag}</span>
        <span>{currentText}</span>
        <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5 focus:outline-none z-50 transform opacity-100 scale-100 transition-all p-1.5">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => changeLanguage('en')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">🇺🇸</span>
                <span className="font-medium text-[15px]">Inglês</span>
              </div>
              {currentLang === 'en' && <Check size={16} strokeWidth={2.5} className="text-gray-900" />}
            </button>
            <button
              onClick={() => changeLanguage('pt')}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">🇲🇿</span>
                <span className="font-medium text-[15px]">Português</span>
              </div>
              {currentLang === 'pt' && <Check size={16} strokeWidth={2.5} className="text-gray-900" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
