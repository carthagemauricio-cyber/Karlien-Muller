import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { format, parseISO, isToday, isBefore, startOfToday } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Users, CalendarClock, TrendingUp, Search, Filter, CheckCircle2, XCircle, Clock, Scissors, User, Activity, CheckSquare } from 'lucide-react';
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

  const handleStatusChange = async (id: string, newStatus: 'Pendente' | 'Confirmado' | 'Em Progresso' | 'Concluído' | 'Cancelado') => {
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
      case 'Em Progresso':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-blue-500/20"><Activity size={12}/> {t('common.in_progress', 'Em Progresso')}</span>;
      case 'Concluído':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-purple-500/20"><CheckSquare size={12}/> {t('common.completed', 'Concluído')}</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 w-max border border-amber-500/20"><Clock size={12}/> {t('common.pending', 'Pendente')}</span>;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-sans font-medium text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <div className="h-1 w-20 bg-primary-400 mb-2"></div>
        <p className="text-gray-600 font-light">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-200 flex flex-col group hover:border-primary-300 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/5 to-secondary-400/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
              <CalendarClock size={24} />
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.total_bookings')}</p>
          <h2 className="text-4xl font-bold text-primary-600">{appointments.length}</h2>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-200 flex flex-col group hover:border-secondary-300 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary-400/5 to-primary-400/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary-600 flex items-center justify-center border border-secondary-100">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.clients_today')}</p>
          <h2 className="text-4xl font-bold text-secondary-600">{uniqueClientsToday}</h2>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-200 flex flex-col group hover:border-primary-300 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-primary-600 flex items-center justify-center border border-gray-100">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{t('dashboard.pending_today')}</p>
          <h2 className="text-4xl font-bold text-gray-900">
            {todayAppointments.filter(a => a.status === 'Pendente').length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between bg-white z-10 relative">
          <div className="relative flex-1 max-w-md group focus-within:ring-2 focus-within:ring-primary-500/30 rounded-2xl transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500" size={18} />
            <input 
              type="text" 
              placeholder={t('dashboard.search_placeholder')} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none transition-all text-sm text-gray-900 placeholder-gray-400 shadow-inner group-focus-within:shadow-md"
            />
          </div>
          <div className="flex gap-3">
            <input 
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm text-gray-700 font-medium font-sans shadow-inner focus:shadow-md"
            />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all text-sm text-gray-700 font-medium font-sans shadow-inner focus:shadow-md"
            >
              <option value="all">{t('dashboard.status_all')}</option>
              <option value="Pendente">{t('common.pending', 'Pendente')}</option>
              <option value="Confirmado">{t('common.confirm')}</option>
              <option value="Em Progresso">{t('common.in_progress', 'Em Progresso')}</option>
              <option value="Concluído">{t('common.completed', 'Concluído')}</option>
              <option value="Cancelado">{t('dashboard.cancel_btn')}</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-gray-50">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(app => {
              const service = services.find(s => s.id === app.serviceId);
              const professional = professionals.find(p => p.id === app.professionalId);
              const dateObj = parseISO(app.date);

              return (
                <div key={app.id} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">
                        {app.clientName}
                      </h4>
                      <p className="text-xs text-primary-500 font-bold mt-1">{app.clientPhone}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="w-full h-px bg-gray-100"></div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-9 h-9 rounded-[14px] bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100">
                         <Scissors size={16} className="text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-800">{service?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                       {professional?.photo ? (
                         <img src={professional.photo} alt={professional.name} className="w-9 h-9 rounded-[14px] object-cover shrink-0 border border-gray-200" />
                       ) : (
                         <div className="w-9 h-9 rounded-[14px] bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100">
                           <User size={16} className="text-primary-600" />
                         </div>
                       )}
                      <span className="font-medium text-gray-700">{professional?.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="w-9 h-9 rounded-[14px] bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100">
                        <Clock size={16} className="text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-700">
                        {format(dateObj, 'dd MMM yyyy', { locale: currentLocale })} às <strong className="text-primary-600 font-bold">{app.time}h</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                     {app.status === 'Pendente' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Confirmado')}
                          className="flex-1 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-600/30 transition-all uppercase tracking-widest shadow-lg shadow-emerald-900/10 font-sans"
                        >
                          {t('dashboard.confirm_btn', 'Confirmar')}
                        </button>
                      )}
                     {app.status === 'Confirmado' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Em Progresso')}
                          className="flex-1 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold hover:bg-blue-600/30 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/10 font-ui"
                        >
                          {t('common.start', 'Iniciar')}
                        </button>
                      )}
                     {app.status === 'Em Progresso' && (
                        <button 
                          onClick={() => handleStatusChange(app.id, 'Concluído')}
                          className="flex-1 py-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-semibold hover:bg-purple-600/30 transition-all uppercase tracking-widest shadow-lg shadow-purple-900/10 font-ui"
                        >
                          {t('common.finish', 'Finalizar')}
                        </button>
                      )}
                      {['Pendente', 'Confirmado', 'Em Progresso'].includes(app.status) && (
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
                          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all uppercase tracking-widest font-ui"
                        >
                          {t('dashboard.reactivate_btn')}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="py-3 px-6 bg-gray-100 text-rose-400/80 rounded-xl text-xs font-semibold hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-900/30"
                      >
                        {t('dashboard.delete_btn')}
                      </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 text-gray-500 font-light bg-gray-50/50 rounded-[32px] border border-gray-200 border-dashed">
              {t('dashboard.no_appointments')}
            </div>
          )}
        </div>

        {/* Table View Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/50 text-secondary-400 border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map(app => {
                  const service = services.find(s => s.id === app.serviceId);
                  const professional = professionals.find(p => p.id === app.professionalId);
                  const dateObj = parseISO(app.date);

                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors uppercase tracking-tight">{app.clientName}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-mono">{t('dashboard.created_at', { date: format(new Date(app.createdAt || new Date()), 'dd/MM, HH:mm') })}</div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-gray-600 group-hover:text-primary-600 font-bold">{app.clientPhone}</td>
                      <td className="px-8 py-6 text-gray-800 font-medium">{service?.name}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img src={professional?.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                          <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{professional?.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-900 font-ui text-xs">{format(dateObj, 'dd/MMM/yyyy', { locale: currentLocale })}</div>
                        <div className="text-[10px] text-primary-600 mt-1 uppercase tracking-widest font-bold font-mono">{app.time}h</div>
                      </td>
                      <td className="px-8 py-6">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 scale-95 origin-right font-ui">
                          {app.status === 'Pendente' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Confirmado')}
                              className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600/30 transition-all shadow-md shadow-emerald-900/10"
                            >
                              {t('dashboard.confirm_btn', 'Confirmar')}
                            </button>
                          )}
                          {app.status === 'Confirmado' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Em Progresso')}
                              className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600/30 transition-all shadow-md shadow-blue-900/10"
                            >
                              {t('common.start', 'Iniciar')}
                            </button>
                          )}
                          {app.status === 'Em Progresso' && (
                            <button 
                              onClick={() => handleStatusChange(app.id, 'Concluído')}
                              className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600/30 transition-all shadow-md shadow-purple-900/10"
                            >
                              {t('common.finish', 'Finalizar')}
                            </button>
                          )}
                          {['Pendente', 'Confirmado', 'Em Progresso'].includes(app.status) && (
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
                              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                              {t('dashboard.reactivate_btn')}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="px-3 py-2 bg-gray-100 text-rose-400/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-900/30 hover:text-rose-400 transition-all"
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
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-500 font-light border-dashed border-2 border-gray-200 bg-white/30 m-4 rounded-[32px]">
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
