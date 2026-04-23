import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Calendar, Clock, User, CheckCircle2, XCircle, SearchIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const ClientAppointments = () => {
  const { services, professionals, searchAppointments } = useAppStore();
  const { t, i18n } = useTranslation();
  const [nameSearch, setNameSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const currentLocale = i18n.language.startsWith('pt') ? ptBR : enUS;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameSearch.trim()) {
      setIsSearching(true);
      const results = await searchAppointments(nameSearch);
      setMyAppointments(
        results.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0))
      );
      setHasSearched(true);
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-emerald-500/20 uppercase tracking-widest"><CheckCircle2 size={12}/> {t('common.confirm')}</span>;
      case 'Cancelado':
        return <span className="px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-rose-500/20 uppercase tracking-widest"><XCircle size={12}/> {t('dashboard.cancel_btn')}</span>;
      default:
        return <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-amber-500/20 uppercase tracking-widest"><Clock size={12}/> {t('common.pending', 'Pendente')}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-charcoal-900 pb-32">
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-10 mt-6 text-center">
            <div className="w-20 h-20 bg-charcoal-800 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl border border-primary-400/20">
                <Calendar size={36} />
            </div>
            <h1 className="text-4xl font-serif text-white mb-2">{t('my_bookings.title')}</h1>
            <div className="h-1 w-16 bg-primary-400 mx-auto mb-4"></div>
            <p className="text-charcoal-400 font-light text-sm">{t('my_bookings.subtitle')}</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
            <div className="relative flex bg-charcoal-800 rounded-[28px] overflow-hidden border border-charcoal-700 shadow-2xl shadow-black/40 group focus-within:border-primary-400/50 transition-all">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-charcoal-600 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={t('my_bookings.search_placeholder')}
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="block w-full pl-16 pr-4 py-5 bg-transparent focus:outline-none text-white placeholder-charcoal-700 font-light text-lg"
                />
                <button
                    type="submit"
                    className="bg-primary-600 text-white px-8 font-bold uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all active:scale-95 font-ui"
                    disabled={isSearching}
                >
                    {isSearching ? <SearchIcon size={16} className="animate-spin" /> : t('my_bookings.search_btn')}
                </button>
            </div>
        </form>

        {hasSearched && nameSearch.trim() !== '' && !isSearching && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {myAppointments.length > 0 ? (
                    myAppointments.map(app => {
                        const service = services.find(s => s.id === app.serviceId);
                        const prof = professionals.find(p => p.id === app.professionalId);
                        const dateObj = parseISO(app.date);

                        return (
                            <div key={app.id} className="bg-charcoal-800 p-8 rounded-[40px] border border-charcoal-700 shadow-2xl flex flex-col gap-6 relative overflow-hidden group hover:border-primary-400/30 transition-all">
                                <div className="absolute top-0 right-0 p-8">
                                   {getStatusBadge(app.status)}
                                </div>
                                
                                <div className="pr-20">
                                    <h3 className="font-serif text-2xl text-white mb-2">{service?.name}</h3>
                                    <p className="text-[10px] font-bold text-primary-400/60 uppercase tracking-[0.2em]">{app.clientName}</p>
                                </div>
                                
                                <div className="w-full h-px bg-charcoal-700/50"></div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center border border-charcoal-700 text-primary-400">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-charcoal-500 uppercase tracking-widest mb-0.5">{t('common.date')}</p>
                                            <span className="text-secondary-200 font-medium">{format(dateObj, 'dd MMMM yyyy', { locale: currentLocale })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center border border-charcoal-700 text-primary-400">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-charcoal-500 uppercase tracking-widest mb-0.5">{t('common.time')}</p>
                                            <span className="text-secondary-200 font-medium">{app.time}H</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 col-span-1 sm:col-span-2 pt-2">
                                        <img src={prof?.photo} alt="" className="w-10 h-10 rounded-full border border-secondary-400/20 object-cover shadow-lg" />
                                        <div>
                                            <p className="text-[9px] font-bold text-charcoal-500 uppercase tracking-widest mb-0.5">{t('common.professional')}</p>
                                            <span className="text-white font-medium">{prof?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-charcoal-800/50 rounded-[40px] border border-charcoal-700 border-dashed">
                        <p className="text-charcoal-400 text-lg font-light">{t('my_bookings.no_bookings')}</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
