import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search, Calendar, Clock, User, CheckCircle2, XCircle, SearchIcon, Activity, CheckSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const ClientAppointments = () => {
  const { services, professionals, subscribeToAppointmentsSearch } = useAppStore();
  const { t, i18n } = useTranslation();
  const [nameSearch, setNameSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchUnsub = useRef<(() => void) | null>(null);

  const currentLocale = i18n.language.startsWith('pt') ? ptBR : enUS;

  useEffect(() => {
    return () => {
      // Cleanup subscription when component unmounts
      if (searchUnsub.current) searchUnsub.current();
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameSearch.trim()) {
      setIsSearching(true);
      
      // Unsubscribe from any previous search stream
      if (searchUnsub.current) {
        searchUnsub.current();
        searchUnsub.current = null;
      }
      
      const unsub = subscribeToAppointmentsSearch(nameSearch, (results) => {
         setMyAppointments(
           results.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0))
         );
         setHasSearched(true);
         setIsSearching(false);
      });
      
      searchUnsub.current = unsub;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-emerald-500/20 uppercase tracking-widest"><CheckCircle2 size={12}/> {t('common.confirm')}</span>;
      case 'Cancelado':
        return <span className="px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-rose-500/20 uppercase tracking-widest"><XCircle size={12}/> {t('dashboard.cancel_btn')}</span>;
      case 'Em Progresso':
        return <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-blue-500/20 uppercase tracking-widest"><Activity size={12}/> {t('common.in_progress', 'Em Progresso')}</span>;
      case 'Concluído':
        return <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-purple-500/20 uppercase tracking-widest"><CheckSquare size={12}/> {t('common.completed', 'Concluído')}</span>;
      default:
        return <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max border border-amber-500/20 uppercase tracking-widest"><Clock size={12}/> {t('common.pending', 'Pendente')}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent pb-32">
      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-10 mt-6 text-center">
            <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary-100">
                <Calendar size={36} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('my_bookings.title')}</h1>
            <div className="h-1 w-16 bg-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">{t('my_bookings.subtitle')}</p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
            <div className="relative flex bg-white rounded-[28px] overflow-hidden border border-gray-200 shadow-sm group focus-within:border-primary-400 focus-within:shadow-md transition-all">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder={t('my_bookings.search_placeholder')}
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="block w-full pl-16 pr-4 py-5 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 font-medium text-lg"
                />
                <button
                    type="submit"
                    className="bg-primary-600 text-white px-8 font-bold uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all active:scale-95 border-l border-primary-700/20"
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
                            <div key={app.id} className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm flex flex-col gap-6 relative overflow-hidden group hover:border-primary-300 hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-6">
                                   {getStatusBadge(app.status)}
                                </div>
                                
                                <div className="pr-24">
                                    <h3 className="font-bold text-2xl text-gray-900 mb-2">{service?.name}</h3>
                                    <p className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em]">{app.clientName}</p>
                                </div>
                                
                                <div className="w-full h-px bg-gray-100"></div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-primary-600">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('common.date')}</p>
                                            <span className="text-gray-900 font-bold">{format(dateObj, 'dd MMMM yyyy', { locale: currentLocale })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-primary-600">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('common.time')}</p>
                                            <span className="text-gray-900 font-bold">{app.time}H</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 col-span-1 sm:col-span-2 pt-2">
                                        <img src={prof?.photo} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm bg-gray-100" />
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('common.professional')}</p>
                                            <span className="text-gray-900 font-bold">{prof?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-gray-200 shadow-sm animate-in fade-in">
                        <p className="text-gray-500 text-lg font-medium">Nenhum agendamento encontrado para este nome.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
