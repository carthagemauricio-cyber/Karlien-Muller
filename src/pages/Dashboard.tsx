import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { format, parseISO, isToday, isBefore, startOfToday } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Users, CalendarClock, TrendingUp, Search, Filter, CheckCircle2, XCircle, Clock, Scissors, User } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { appointments, professionals, services, updateAppointmentStatus, removeAppointment } = useAppStore();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentLocale = i18n.language.startsWith('pt') ? ptBR : enUS;
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const todayAppointments = useMemo(() => {
    return appointments.filter((a: any) => isToday(parseISO(a.date)));
  }, [appointments]);

  const uniqueClientsToday = new Set(todayAppointments.map((a: any) => a.clientPhone)).size;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app: any) => {
      const safeName = (app.clientName || '').toLowerCase();
      const safePhone = (app.clientPhone || '');
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = safeName.includes(searchLower) || safePhone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesDate = !dateFilter || app.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a: any, b: any) => {
      // Sort by creation date DESC
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = async (id: string, newStatus: 'Pendente' | 'Confirmado' | 'Cancelado') => {
    updateAppointmentStatus(id, newStatus);
    toast.success(t('dashboard.status_changed', { status: newStatus }));
  };

  const handleDelete = (id: string) => {
    removeAppointment(id);
    toast.success(t('dashboard.appointment_removed'));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Confirmado':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-emerald-500/20"><CheckCircle2 size={12}/> {t('common.confirm')}</span>;
      case 'Cancelado':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-rose-500/20"><XCircle size={12}/> {t('dashboard.cancel_btn')}</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-amber-500/20"><Clock size={12}/> {t('common.pending', 'Pendente')}</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-medium text-white mb-2">{t('dashboard.title')}</h1>
        <div className="h-1 w-20 bg-primary-400 mb-2"></div>
        <p className="text-charcoal-400 font-light">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-charcoal-800 rounded-[32px] p-8 shadow-2xl border border-charcoal-700 flex flex-col group hover:border-primary-400/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-400/10 text-primary-400 flex items-center justify-center border border-primary-400/20">
              <CalendarClock size={24} />
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-widest mb-1">{t('dashboard.total_bookings')}</p>
          <h2 className="text-4xl font-serif font-medium text-primary-200">{appointments.length}</h2>
        </div>

        <div className="bg-charcoal-800 rounded-[32px] p-8 shadow-2xl border border-charcoal-700 flex flex-col group hover:border-secondary-400/30 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary-400/10 to-primary-400/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary-400/10 text-secondary-400 flex items-center justify-center border border-secondary-400/20">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-widest mb-1">{t('dashboard.clients_today')}</p>
          <h2 className="text-4xl font-serif font-medium text-secondary-200">{uniqueClientsToday}</h2>
        </div>

        <div className="bg-charcoal-800 rounded-[32px] p-8 shadow-2xl border border-charcoal-700 flex flex-col group hover:border-primary-400/30 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-700 text-primary-400 flex items-center justify-center border border-primary-400/10">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-charcoal-500 font-semibold uppercase tracking-widest mb-1">{t('dashboard.pending_today')}</p>
          <h2 className="text-4xl font-serif font-medium text-primary-200">
            {todayAppointments.filter(a => a.status === 'Pendente').length}
          </h2>
        </div>
      </div>

      <div className="bg-charcoal-800 rounded-[40px] shadow-2xl border border-charcoal-700 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-6 border-b border-charcoal-700 flex flex-col md:flex-row gap-4 justify-between bg-charcoal-800/50 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" size={18} />
            <input 
              type="text" 
              placeholder={t('dashboard.search_placeholder')} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all text-sm text-white placeholder-charcoal-600"
            />
          </div>
          <div className="flex gap-3">
            <input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-3 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all text-sm text-charcoal-400 font-medium font-ui"
            />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-3 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all text-sm text-charcoal-400 font-medium font-ui"
            >
              <option value="all">{t('dashboard.status_all')}</option>
              <option value="Pendente">{t('common.pending', 'Pendente')}</option>
              <option value="Confirmado">{t('common.confirm')}</option>
              <option value="Cancelado">{t('dashboard.cancel_btn')}</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-charcoal-900/30">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(app => {
              const service = services.find(s => s.id === app.serviceId);
              const professional = professionals.find(p => p.id === app.professionalId);
              const dateObj = parseISO(app.date);

              return (
                <div key={app.id} className="bg-charcoal-800 p-6 rounded-[32px] border border-charcoal-700 shadow-xl flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-medium text-xl text-white">
                        {app.clientName}
                      </h4>
                      <p className="text-xs text-primary-400/60 font-mono mt-1">{app.clientPhone}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="w-full h-px bg-charcoal-700"></div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-9 h-9 rounded-full bg-charcoal-700 flex items-center justify-center shrink-0 border border-charcoal-600">
                         <Scissors size={16} className="text-primary-400" />
                      </div>
                      <span className="font-medium text-charcoal-200">{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                       {professional?.photo ? (
                         <img src={professional.photo} alt={professional.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-secondary-400/20" />
                       ) : (
                         <div className="w-9 h-9 rounded-full bg-charcoal-700 flex items-center justify-center shrink-0 border border-charcoal-600">
                           <User size={16} className="text-primary-400" />
                         </div>
                       )}
                      <span className="font-medium text-charcoal-300">{professional?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-9 h-9 rounded-full bg-charcoal-700 flex items-center justify-center shrink-0 border border-charcoal-600">
                        <Clock size={16} className="text-primary-400" />
                      </div>
                      <span className="font-medium text-charcoal-300">
                        {format(dateObj, 'dd MMM yyyy', { locale: currentLocale })} às <strong className="text-secondary-400 font-mono">{app.time}h</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-charcoal-700 flex-wrap">
                     {app.status === 'Pendente' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Confirmado')}
                          className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-500 transition-all uppercase tracking-widest shadow-lg shadow-primary-900/20 font-ui"
                        >
                          {t('dashboard.confirm_btn')}
                        </button>
                      )}
                      {(app.status === 'Pendente' || app.status === 'Confirmado') && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Cancelado')}
                          className="flex-1 py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-semibold hover:bg-rose-500/20 transition-all uppercase tracking-widest font-ui"
                        >
                          {t('dashboard.cancel_btn')}
                        </button>
                      )}
                      {app.status === 'Cancelado' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Pendente')}
                          className="flex-1 py-3 bg-charcoal-700 text-charcoal-300 rounded-xl text-xs font-semibold hover:bg-charcoal-600 transition-all uppercase tracking-widest font-ui"
                        >
                          {t('dashboard.reactivate_btn')}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="py-3 px-6 bg-charcoal-700 text-rose-400/80 rounded-xl text-xs font-semibold hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-900/30"
                      >
                        {t('dashboard.delete_btn')}
                      </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 text-charcoal-500 font-light bg-charcoal-800/50 rounded-[32px] border border-charcoal-700 border-dashed">
              {t('dashboard.no_appointments')}
            </div>
          )}
        </div>

        {/* Table View Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-charcoal-900/50 text-secondary-400 border-b border-charcoal-700">
              <tr>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_client')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_contact')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_service')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_professional')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_date_time')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em]">{t('dashboard.table_status')}</th>
                <th className="px-8 py-5 font-semibold text-[10px] uppercase tracking-[0.2em] text-right">{t('dashboard.table_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-700">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => {
                  const service = services.find(s => s.id === app.serviceId);
                  const professional = professionals.find(p => p.id === app.professionalId);
                  const dateObj = parseISO(app.date);

                  return (
                    <tr key={app.id} className="hover:bg-charcoal-700/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="font-serif text-lg text-white group-hover:text-primary-200 transition-colors uppercase tracking-tight">{app.clientName}</div>
                        <div className="text-[10px] text-charcoal-500 mt-1 uppercase tracking-widest font-mono">{t('dashboard.created_at', { date: format(new Date(app.createdAt || new Date()), 'dd/MM, HH:mm') })}</div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-charcoal-400 group-hover:text-primary-400/50">{app.clientPhone}</td>
                      <td className="px-8 py-6 text-charcoal-200 font-light">{service?.name}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img src={professional?.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-secondary-400/20" />
                          <span className="text-charcoal-300 font-light group-hover:text-white transition-colors">{professional?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-medium text-secondary-200/80 font-ui text-xs">{format(dateObj, 'dd/MMM/yyyy', { locale: currentLocale })}</div>
                        <div className="text-[10px] text-primary-400/60 mt-1 uppercase tracking-widest font-bold font-mono">{app.time}h</div>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 scale-95 origin-right font-ui">
                          {app.status === 'Pendente' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Confirmado')}
                              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-500 transition-all shadow-md shadow-primary-900/20"
                            >
                              {t('dashboard.confirm_btn')}
                            </button>
                          )}
                          {(app.status === 'Pendente' || app.status === 'Confirmado') && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Cancelado')}
                              className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                            >
                              {t('dashboard.cancel_btn')}
                            </button>
                          )}
                          {app.status === 'Cancelado' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Pendente')}
                              className="px-4 py-2 bg-charcoal-700 text-charcoal-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal-600 transition-all"
                            >
                              {t('dashboard.reactivate_btn')}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="px-3 py-2 bg-charcoal-700 text-rose-400/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-900/30 hover:text-rose-400 transition-all"
                            title={t('dashboard.delete_btn')}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-charcoal-500 font-light border-dashed border-2 border-charcoal-700 bg-charcoal-900/30 m-4 rounded-[32px]">
                    {t('dashboard.no_appointments')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
