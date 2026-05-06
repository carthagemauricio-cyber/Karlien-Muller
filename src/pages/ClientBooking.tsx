import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';
import { format, parse, isBefore, startOfToday, parseISO, addDays, getDay, isToday } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Calendar as CalendarIcon, Clock, User, Scissors, ArrowLeft, Phone, MessageCircle, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { Appointment } from '../types';

export const ClientBooking = ({ onGoToAppointments }: { onGoToAppointments?: () => void }) => {
  const { services, professionals, publicSlots, appointments, addAppointment } = useAppStore();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  
  const currentLocale = i18n.language.startsWith('pt') ? ptBR : enUS;
  
  // Form State
  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Derived Values
  const selectedService = services.find(s => s.id === serviceId);
  const selectedProfessional = professionals.find(p => p.id === professionalId);

  // Filter professionals offering selected service
  const availableProfessionals = useMemo(() => {
    if (!serviceId) return [];
    return professionals.filter(p => p.specialties.includes(serviceId));
  }, [professionals, serviceId]);

  // Next 14 days for date selection
  const upcomingDays = useMemo(() => {
    const days = [];
    let current = startOfToday();
    for (let i = 0; i < 14; i++) {
       days.push(current);
       current = addDays(current, 1);
    }
    return days;
  }, []);

  // Filter available times
  const availableTimes = useMemo(() => {
    if (!professionalId || !date) return [];
    
    // Find professional availability
    const dateObj = parseISO(date);
    const dayOfWeek = getDay(dateObj); // 0 = Sunday, 1 = Monday...
    
    // JS getDay -> Monday is 1, Sunday is 0.
    if (!selectedProfessional?.availability?.days?.includes(dayOfWeek)) {
      return []; // Professional doesn't work this day
    }

    const { startHour, endHour } = selectedProfessional.availability;
    const slots: string[] = [];
    
    let current = parse(startHour, 'HH:mm', dateObj);
    const end = parse(endHour, 'HH:mm', dateObj);
    const now = new Date();
    const isTodayFlag = isToday(dateObj);

    while (isBefore(current, end)) {
      const timeString = format(current, 'HH:mm');
      
      if (isTodayFlag) {
        const slotTime = parse(timeString, 'HH:mm', new Date());
        if (isBefore(slotTime, now)) {
          current = new Date(current.getTime() + 30 * 60000);
          continue;
        }
      }

      // Check conflicts
      const allSlotsToCheck = [...(publicSlots || []), ...(appointments || [])];
      const hasConflict = allSlotsToCheck.some(app => 
        app.professionalId === professionalId && 
        app.date === date && 
        app.time === timeString &&
        app.status !== 'Cancelado'
      );

      if (!hasConflict) {
        slots.push(timeString);
      }
      current = new Date(current.getTime() + 30 * 60000);
    }
    return slots;
  }, [professionalId, date, appointments, publicSlots, selectedProfessional]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientName || !clientPhone) {
      toast.error(t('booking.fill_details_error'));
      return;
    }

    const normalizedPhone = clientPhone.replace(/[^\d+]/g, '');
    if (!/^(?:\+?258)?8[2-7]\d{7}$/.test(normalizedPhone)) {
      toast.error(t('booking.invalid_phone_error'));
      return;
    }

    const isDoubleBooked = publicSlots.some(slot => slot.professionalId === professionalId && slot.date === date && slot.time === time && slot.status !== 'Cancelado');
    if (isDoubleBooked) {
      toast.error('Este horário já foi reservado. Por favor, escolha outro.');
      return;
    }

    const newAppointment: Appointment = {
      id: `app_${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId,
      professionalId,
      date,
      time,
      status: 'Pendente',
      createdAt: new Date().toISOString()
    };

    try {
      toast.loading(t('booking.submitting_booking'), { id: 'booking' });
      await addAppointment(newAppointment);
      setIsSuccess(true);
      toast.success(t('booking.success_title'), { id: 'booking' });
    } catch (error) {
      toast.error(t('booking.save_error'), { id: 'booking' });
    }
  };

  const resetForm = () => {
    setServiceId('');
    setProfessionalId('');
    setDate('');
    setTime('');
    setClientName('');
    setClientPhone('');
    setStep(1);
    setIsSuccess(false);
  };

  // SUCCESS SCREEN
  if (isSuccess) {
    const formattedDate = format(parseISO(date), 'dd/MM/yyyy');
    const serviceName = selectedService?.name || '';
    const profName = selectedProfessional?.name || '';
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full min-h-screen bg-transparent pb-32 animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="w-full max-w-md text-center flex flex-col items-center bg-white md:rounded-[40px] md:shadow-md md:border md:border-gray-200 p-10 flex-1 md:flex-none justify-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-in zoom-in-50 duration-500 shadow-sm border border-emerald-100">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('booking.success_title')}</h2>
          <div className="h-0.5 w-16 bg-primary-400 mx-auto mb-6"></div>
          <p className="text-gray-600 mb-8 leading-relaxed px-2 text-base font-medium">
            Seu agendamento foi enviado e está aguardando confirmação.
            <br/><br/>
            <span className="text-primary-600 font-bold">Você pode acompanhar o status na aba Meus Agendamentos.</span>
          </p>
          
          <div className="w-full space-y-4 md:block hidden">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-primary-600 font-bold hover:bg-primary-500 rounded-2xl transition-all shadow-md shadow-primary-500/20 uppercase tracking-widest text-xs"
            >
              {t('booking.view_my_bookings')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-primary-600 font-bold hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest text-xs border border-gray-200"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
        
        {/* Mobile Sticky Bottom Section */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-500 delay-300 z-50 rounded-t-[40px]">
          <div className="max-w-md mx-auto space-y-4">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-primary-600 font-bold active:bg-primary-700 rounded-2xl transition-all shadow-md shadow-primary-500/20 uppercase tracking-widest text-xs"
            >
              {t('booking.view_my_bookings')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-primary-600 font-bold active:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest text-xs border border-gray-200"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-40 relative bg-transparent">
      {/* Header Mobile Step Indicator */}
      <div className="bg-white/90 backdrop-blur-xl px-4 md:px-6 py-6 shadow-sm sticky top-0 z-20 flex items-center gap-4 border-b border-gray-200">
         {step > 1 && (
           <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all text-primary-600 shrink-0 border border-gray-200">
             <ArrowLeft size={20} />
           </button>
         )}
         <div className="flex-1">
           <p className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.3em] mb-1 opacity-70">{t('booking.step_of', { current: step, total: 5 })}</p>
           <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-none">
             {step === 1 && t('booking.select_service')}
             {step === 2 && t('booking.select_professional')}
             {step === 3 && t('booking.select_date')}
             {step === 4 && t('booking.select_time')}
             {step === 5 && t('booking.your_details')}
           </h2>
         </div>
         {/* Simple visual progress pill */}
         <div className="hidden sm:flex bg-gray-100 rounded-full h-1 w-32 overflow-hidden shrink-0">
            <div className="bg-primary-500 h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
         </div>
      </div>

      <div className="p-6 md:p-10 flex-1 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 fade-in duration-500">
        
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div className="space-y-4">
             <div className="flex items-center gap-3 mb-6">
                <Scissors className="text-gray-500" size={18} />
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.1em]">{t('booking.all_services', 'All Services')}</h4>
             </div>

            {services.map(service => (
              <button
                key={service.id}
                onClick={() => { setServiceId(service.id); handleNext(); }}
                className={cn(
                  "w-full text-left bg-white p-6 rounded-[32px] border transition-all flex items-center gap-5 group shadow-sm",
                  serviceId === service.id 
                    ? "border-primary-400 shadow-md shadow-primary-500/10 scale-[1.02] ring-2 ring-primary-400" 
                    : "border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-md"
                )}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100 group-hover:scale-105 transition-transform">
                  <Scissors size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{service.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-medium tracking-wide">
                    <Clock size={16} className="text-primary-400" /> {service.duration} MIN
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-primary-600">{formatCurrency(service.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: PROFESSIONAL */}
        {step === 2 && (
          <div className="space-y-4">
            {availableProfessionals.length > 0 ? (
              availableProfessionals.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => { setProfessionalId(prof.id); handleNext(); }}
                  className={cn(
                    "w-full text-left bg-white p-6 rounded-[32px] border transition-all flex items-center gap-5 group shadow-sm",
                    professionalId === prof.id 
                      ? "border-primary-400 shadow-md shadow-primary-500/10 scale-[1.02] ring-2 ring-primary-400" 
                      : "border-gray-200 text-gray-700 hover:border-primary-300 hover:shadow-md"
                  )}
                >
                  <img src={prof.photo} alt={prof.name} className="w-20 h-20 md:w-24 md:h-24 rounded-[24px] object-cover shadow-sm border border-gray-100 group-hover:border-primary-300 transition-all" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{prof.name}</h3>
                    <p className="text-xs text-gray-500 mt-2 font-bold tracking-widest uppercase">{t('booking.specialist_available')}</p>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-primary-400 transition-colors" size={24} />
                </button>
              ))
            ) : (
              <div className="text-center p-12 bg-white rounded-[40px] border border-gray-200 shadow-sm">
                <User size={48} className="text-gray-300 mx-auto mb-6" />
                <p className="text-gray-600 text-lg font-medium">Nenhum profissional disponível para este serviço no momento.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DATE */}
        {step === 3 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
             {upcomingDays.map((d, index) => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const dayOfWeek = getDay(d);
                const worksThisDay = selectedProfessional?.availability?.days?.includes(dayOfWeek);
                
                return (
                  <button
                    key={dateStr}
                    disabled={!worksThisDay}
                    onClick={() => { setDate(dateStr); handleNext(); }}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-[32px] border transition-all h-36 md:h-40 relative group shadow-sm",
                      !worksThisDay ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-500 shadow-none" :
                      date === dateStr 
                       ? "border-primary-400 bg-primary-50 text-primary-700 scale-[1.05] ring-2 ring-primary-400 shadow-md shadow-primary-500/10" 
                       : "bg-white border-gray-200 hover:border-primary-300 text-gray-700 hover:shadow-md"
                    )}
                  >
                    <span className={cn("text-[10px] uppercase tracking-[0.2em] font-bold mb-3", date === dateStr ? "text-primary-600" : "text-gray-500 group-hover:text-primary-500")}>
                      {format(d, 'eee', { locale: currentLocale })}
                    </span>
                    <span className="text-3xl md:text-4xl font-bold leading-none mb-2">
                      {format(d, 'dd')}
                    </span>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", date === dateStr ? "text-primary-500" : "text-secondary-500")}>
                      {format(d, 'MMM', { locale: currentLocale })}
                    </span>
                    {!worksThisDay && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-500 text-[8px] px-2 py-1 rounded-md font-bold uppercase tracking-widest shadow-sm border border-gray-100">{t('booking.off_day')}</span>
                      </div>
                    )}
                  </button>
                )
             })}
          </div>
        )}

        {/* STEP 4: TIME */}
        {step === 4 && (
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-200 shadow-sm">
            <h3 className="text-center text-gray-600 mb-8 font-medium tracking-wide text-lg">
              {t('booking.times_at', { date: format(parseISO(date), "dd 'de' MMMM", { locale: currentLocale }) })}
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {availableTimes.length > 0 ? (
                availableTimes.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTime(t); handleNext(); }}
                    className={cn(
                      "py-5 rounded-[24px] border font-mono text-xl font-bold transition-all group shadow-sm",
                      time === t 
                        ? "border-primary-400 bg-primary-50 text-primary-700 shadow-md shadow-primary-500/10 scale-110 ring-2 ring-primary-400" 
                        : "bg-white border-gray-200 text-primary-600 hover:border-primary-300 hover:text-primary-700 hover:shadow-md"
                    )}
                  >
                    {t}h
                  </button>
                ))
              ) : (
                <div className="col-span-3 sm:col-span-4 text-center py-16 bg-gray-50 rounded-[32px] border-2 border-gray-200 border-dashed shadow-inner">
                  <Clock className="mx-auto text-gray-300 mb-6" size={48} />
                  <p className="text-gray-500 font-medium mb-6">{t('booking.sold_out')}</p>
                  <button onClick={handleBack} className="text-primary-500 font-bold uppercase tracking-widest text-xs hover:text-primary-400 transition-colors">{t('booking.choose_another_date')}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CLIENT DETAILS */}
        {step === 5 && (
          <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-200 animate-in slide-in-from-bottom-8">
             <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-4">{t('booking.name_label')}</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder={t('booking.name_placeholder')}
                      className="w-full pl-16 pr-6 h-20 bg-gray-50 border border-gray-200 rounded-[24px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-xl font-sans text-gray-900 placeholder:text-gray-400 shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-500 uppercase tracking-[0.2em] mb-4">{t('booking.phone_label')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder={t('booking.phone_placeholder')}
                      className="w-full pl-16 pr-6 h-20 bg-gray-50 border border-gray-200 rounded-[24px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-xl font-mono text-gray-900 placeholder:text-gray-400 shadow-inner focus:shadow-md"
                    />
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      {step === 5 && (
         <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-white/95 backdrop-blur-xl border-t border-gray-200 pb-safe z-30 shadow-2xl rounded-t-[40px]">
           <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="hidden md:block">
                 <p className="text-3xl font-bold text-primary-600">{formatCurrency(selectedService?.price || 0)}</p>
                 <p className="text-sm font-medium text-gray-500 tracking-wide">{selectedService?.name}</p>
                 <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                   {format(parseISO(date), 'dd/MM', { locale: currentLocale })} • {time}H • {selectedProfessional?.name}
                 </p>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={!clientName || !clientPhone}
                className="w-full md:w-auto py-5 px-12 rounded-[24px] bg-primary-600 text-white font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary-500 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-primary-500/30 active:scale-95"
              >
                {t('booking.confirm_booking_btn')}
              </button>
           </div>
         </div>
      )}
    </div>
  );
};
