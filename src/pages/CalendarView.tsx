import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { format, addDays, startOfWeek, isSameDay, parseISO, parse, isAfter } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const CalendarView = () => {
  const { appointments, professionals, services } = useAppStore();
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const currentLocale = i18n.language.startsWith('pt') ? ptBR : enUS;
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  const dayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDateStr]);

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 20; i++) {
       slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-medium text-white mb-2">{t('calendar.title')}</h1>
          <div className="h-1 w-20 bg-primary-400 mb-4"></div>
          <p className="text-charcoal-400 flex items-center gap-2 font-light">
             <CalendarIcon size={16} className="text-primary-400" /> 
             {format(selectedDate, "MMMM 'de' yyyy", { locale: currentLocale })}
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-charcoal-800 rounded-full p-1 border border-charcoal-700 shadow-2xl w-max">
          <button 
            onClick={() => setSelectedDate(prev => addDays(prev, -7))}
            className="p-2 hover:bg-charcoal-700 rounded-full text-charcoal-400 hover:text-primary-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest px-4 text-secondary-200">{t('calendar.this_week')}</span>
          <button 
            onClick={() => setSelectedDate(prev => addDays(prev, 7))}
            className="p-2 hover:bg-charcoal-700 rounded-full text-charcoal-400 hover:text-primary-400 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDays.map(day => {
          const isSelected = isSameDay(day, selectedDate);
          const hasAppts = appointments.some(a => a.date === format(day, 'yyyy-MM-dd'));
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center justify-center py-4 rounded-[24px] border transition-all text-center",
                isSelected 
                  ? "bg-primary-600 border-primary-400 text-white shadow-xl shadow-primary-900/30 active:scale-95" 
                  : "bg-charcoal-800 border-charcoal-700 hover:border-primary-400/30 hover:bg-charcoal-700 text-charcoal-400"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest mb-1",
                isSelected ? "text-white/80" : "text-charcoal-500"
              )}>
                {format(day, 'E', { locale: currentLocale })}
              </span>
              <span className={cn(
                "text-lg font-serif font-medium",
                isSelected ? "text-white" : "text-secondary-100"
              )}>
                {format(day, 'd')}
              </span>
              {hasAppts && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-secondary-400 mt-1 shadow-[0_0_8px_rgba(200,162,255,0.8)]"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Timeline View */}
      <div className="bg-charcoal-800 rounded-[40px] p-6 md:p-10 shadow-2xl border border-charcoal-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-400/30 to-transparent"></div>
        
        <h3 className="text-2xl font-serif text-white mb-8 flex items-center justify-between">
           <span>{t('calendar.appointments_title')}</span>
           <span className="text-[10px] font-bold uppercase tracking-widest bg-primary-400/10 text-primary-400 px-4 py-2 rounded-full border border-primary-400/20">
             {dayAppointments.length === 1 ? t('calendar.appointments_count_one') : t('calendar.appointments_count', { count: dayAppointments.length })}
           </span>
        </h3>
        
        <div className="space-y-4">
          {dayAppointments.length > 0 ? (
            dayAppointments.map((apt) => {
              const service = services.find(s => s.id === apt.serviceId);
              const professional = professionals.find(p => p.id === apt.professionalId);

              const colorClass = apt.status === 'Cancelado' 
                ? 'bg-charcoal-900/50 border-charcoal-700 text-charcoal-500' 
                : 'bg-charcoal-900 border-charcoal-700 border-l-secondary-400 text-charcoal-100 hover:border-secondary-400/40';

              return (
                <div 
                  key={apt.id} 
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[24px] border border-l-4 transition-all gap-6 shadow-lg",
                    colorClass,
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-charcoal-800 p-3.5 rounded-2xl font-mono text-xs font-bold whitespace-nowrap flex items-center gap-2 shadow-inner border border-charcoal-700 text-primary-400">
                      <Clock size={16} />
                      {apt.time}h
                    </div>
                    <div>
                      <h4 className="font-serif text-xl flex items-center gap-3 text-white">
                        {apt.clientName}
                        {apt.status === 'Confirmado' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                        {apt.status === 'Pendente' && <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>}
                        {apt.status === 'Cancelado' && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>}
                      </h4>
                      <p className="text-[10px] font-mono text-charcoal-500 uppercase tracking-widest mt-1">{apt.clientPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-10 md:ml-auto pt-4 md:pt-0 border-t md:border-t-0 border-charcoal-700">
                    <div className="flex-1 min-w-[120px]">
                       <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 text-secondary-400/50">{t('common.service')}</p>
                       <p className="font-medium text-sm text-charcoal-200">{service?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-[150px]">
                       <img src={professional?.photo} alt={professional?.name} className="w-10 h-10 rounded-full border border-secondary-400/20 object-cover shadow-lg" />
                       <div>
                         <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 text-secondary-400/50">{t('common.professional')}</p>
                         <p className="font-medium text-sm text-charcoal-200">{professional?.name}</p>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-charcoal-900/50 rounded-[32px] border border-charcoal-700 border-dashed">
              <div className="w-20 h-20 bg-charcoal-800 rounded-full flex items-center justify-center text-charcoal-600 mx-auto mb-6 shadow-inner">
               <CalendarIcon size={36} />
              </div>
              <p className="text-charcoal-400 text-lg font-light">{t('calendar.no_appointments')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
