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
  const [aiSuggestedTimes, setAiSuggestedTimes] = useState<string[]>([]);
  const [loadingAiTimes, setLoadingAiTimes] = useState(false);

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

  useEffect(() => {
    if (step === 4 && professionalId && date) {
        setLoadingAiTimes(true);
        setAiSuggestedTimes([]);
        
        fetch('/api/recommend-times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedProfessional,
            date,
            allSlots: [...(publicSlots || []), ...(appointments || [])].filter(s => s.status !== 'Cancelado'),
            upcomingDays: upcomingDays.slice(0, 7),
            availableTimes
          })
        })
        .then(res => res.json())
        .then(data => {
            if (data.recommendations) {
               // Extract just the time part since recommendations might be "YYYY-MM-DD HH:mm"
               const times = data.recommendations
                 .filter((r: string) => r.startsWith(date))
                 .map((r: string) => r.split(' ')[1])
                 .filter(Boolean);
               
               // Only take times that are actually in `availableTimes` or suggest otherwise
               setAiSuggestedTimes(times.length > 0 ? times : availableTimes.slice(0, 3));
            }
        })
        .catch(console.error)
        .finally(() => setLoadingAiTimes(false));
    }
  }, [step, professionalId, date, availableTimes]);

  // AI Recommended Services (calculated locally based on popularity from public Slots/Appointments)
  const aiRecommendedServices = useMemo(() => {
    if (services.length === 0) return [];
    
    // Count occurrences of serviceId in appointments
    const counts = appointments.reduce((acc: any, app) => {
       acc[app.serviceId] = (acc[app.serviceId] || 0) + 1;
       return acc;
    }, {});
    
    const sorted = [...services].sort((a, b) => {
       const scoreA = counts[a.id] || 0;
       const scoreB = counts[b.id] || 0;
       return scoreB - scoreA;
    });
    
    // Return top 2
    return sorted.slice(0, 2);
  }, [services, appointments]);

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

    const newAppointment: Appointment = {
      id: `app_${Date.now()}`,
      clientName,
      clientPhone,
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
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full min-h-screen bg-charcoal-900 md:bg-transparent pb-32 animate-in slide-in-from-bottom-8 fade-in duration-500">
        <div className="w-full max-w-md text-center flex flex-col items-center bg-charcoal-800 md:rounded-[40px] md:shadow-2xl md:border md:border-charcoal-700 p-10 flex-1 md:flex-none justify-center border-primary-400/10">
          <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-8 animate-in zoom-in-50 duration-500 shadow-xl shadow-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-serif text-white mb-4 tracking-tight">{t('booking.success_title')}</h2>
          <div className="h-0.5 w-16 bg-primary-400 mx-auto mb-6"></div>
          <p className="text-charcoal-300 mb-8 leading-relaxed px-2 text-base font-light">
            {t('booking.success_message', {
              name: clientName,
              service: serviceName.toLowerCase(),
              professional: profName,
              date: formattedDate,
              time: time
            })}
            <br/><br/>
            <span className="text-secondary-400 font-medium">{t('booking.success_followup')}</span>
          </p>
          
          <div className="w-full space-y-4 md:block hidden">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-primary-600 font-bold hover:bg-primary-500 rounded-2xl transition-all shadow-xl shadow-primary-900/40 uppercase tracking-widest text-xs font-ui"
            >
              {t('booking.view_my_bookings')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-secondary-300 font-bold hover:bg-charcoal-700 rounded-2xl transition-all uppercase tracking-widest text-xs border border-charcoal-700 font-ui"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
        
        {/* Mobile Sticky Bottom Section */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-charcoal-800 border-t border-charcoal-700 shadow-2xl animate-in slide-in-from-bottom-full duration-500 delay-300 z-50 rounded-t-[40px]">
          <div className="max-w-md mx-auto space-y-4">
            <button 
              onClick={() => {
                resetForm();
                if (onGoToAppointments) onGoToAppointments();
              }}
              className="w-full py-4 text-white bg-primary-600 font-bold active:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-900/40 uppercase tracking-widest text-xs font-ui"
            >
              {t('booking.view_my_bookings')}
            </button>
            <button 
              onClick={resetForm}
              className="w-full py-4 text-secondary-300 font-bold active:bg-charcoal-700 rounded-2xl transition-all uppercase tracking-widest text-xs border border-charcoal-700 font-ui"
            >
              {t('booking.new_booking')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-charcoal-900 pb-40 relative">
      {/* Header Mobile Step Indicator */}
      <div className="bg-charcoal-800/80 backdrop-blur-xl px-4 md:px-6 py-6 shadow-2xl sticky top-0 z-20 flex items-center gap-4 border-b border-charcoal-700">
         {step > 1 && (
           <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-charcoal-700 transition-all text-primary-400 shrink-0 border border-charcoal-700">
             <ArrowLeft size={20} />
           </button>
         )}
         <div className="flex-1">
           <p className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.3em] mb-1 opacity-70">{t('booking.step_of', { current: step, total: 5 })}</p>
           <h2 className="text-xl md:text-2xl font-serif font-medium text-white leading-none">
             {step === 1 && t('booking.select_service')}
             {step === 2 && t('booking.select_professional')}
             {step === 3 && t('booking.select_date')}
             {step === 4 && t('booking.select_time')}
             {step === 5 && t('booking.your_details')}
           </h2>
         </div>
         {/* Simple visual progress pill */}
         <div className="hidden sm:flex bg-charcoal-700 rounded-full h-1 w-32 overflow-hidden shrink-0">
            <div className="bg-primary-500 h-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
         </div>
      </div>

      <div className="p-6 md:p-10 flex-1 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-8 fade-in duration-500">
        
        {/* STEP 1: SERVICE */}
        {step === 1 && (
          <div className="space-y-4">
             {/* AI Recommendations */}
             {aiRecommendedServices.length > 0 && (
                <div className="mb-10 bg-gradient-to-br from-charcoal-800 to-charcoal-900/40 p-6 rounded-[32px] border border-primary-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-primary-400" size={18} />
                    <h4 className="text-sm font-bold text-primary-400 uppercase tracking-[0.2em]">{t('booking.recommended_for_you', 'Recommended for You')}</h4>
                  </div>
                  <div className="space-y-4">
                    {aiRecommendedServices.map(service => (
                      <button
                        key={'rec_' + service.id}
                        onClick={() => { setServiceId(service.id); handleNext(); }}
                        className={cn(
                          "w-full text-left bg-charcoal-800 p-5 rounded-[24px] border transition-all flex items-center gap-4 group",
                          serviceId === service.id 
                            ? "border-primary-400 bg-primary-400/5 shadow-2xl shadow-primary-900/20 scale-[1.02]" 
                            : "border-primary-500/10 hover:border-primary-400/30 shadow-lg shadow-black/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary-900/40 group-hover:scale-110 transition-transform text-white">
                          <Sparkles size={18} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-serif font-medium text-white group-hover:text-primary-200 transition-colors leading-tight">{service.name}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-primary-400/80 mt-1 font-bold uppercase tracking-widest">
                             {t('booking.popular_choice', 'Popular Choice')}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-serif font-medium text-primary-400 leading-tight">{formatCurrency(service.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
             )}

             <div className="flex items-center gap-3 mb-6">
                <Scissors className="text-charcoal-500" size={18} />
                <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-[0.1em]">{t('booking.all_services', 'All Services')}</h4>
             </div>

            {services.filter(s => !aiRecommendedServices.find(rec => rec.id === s.id)).map(service => (
              <button
                key={service.id}
                onClick={() => { setServiceId(service.id); handleNext(); }}
                className={cn(
                  "w-full text-left bg-charcoal-800 p-6 rounded-[32px] border-2 transition-all flex items-center gap-5 group",
                  serviceId === service.id 
                    ? "border-primary-400 bg-primary-400/5 shadow-2xl shadow-primary-900/20 scale-[1.02]" 
                    : "border-charcoal-700 text-charcoal-300 hover:border-primary-400/30 hover:bg-charcoal-800/80"
                )}
              >
                <div className="w-16 h-16 rounded-full bg-primary-400/10 text-primary-400 flex items-center justify-center shrink-0 border border-primary-400/20 group-hover:scale-110 transition-transform">
                  <Scissors size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-medium text-white group-hover:text-primary-200 transition-colors">{service.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1 font-medium tracking-wide">
                    <Clock size={16} className="text-primary-400/50" /> {service.duration} MIN
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-serif font-medium text-primary-400">{formatCurrency(service.price)}</p>
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
                    "w-full text-left bg-charcoal-800 p-6 rounded-[32px] border-2 transition-all flex items-center gap-5 group",
                    professionalId === prof.id 
                      ? "border-primary-400 bg-primary-400/5 shadow-2xl shadow-primary-900/20 scale-[1.02]" 
                      : "border-charcoal-700 text-charcoal-300 hover:border-primary-400/30 hover:bg-charcoal-800/80"
                  )}
                >
                  <img src={prof.photo} alt={prof.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-2xl border-2 border-primary-400/20 group-hover:border-primary-400 transition-all" />
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-medium text-white group-hover:text-primary-200 transition-colors">{prof.name}</h3>
                    <p className="text-xs text-charcoal-500 mt-2 font-medium tracking-widest uppercase">{t('booking.specialist_available')}</p>
                  </div>
                  <ChevronRight className="text-charcoal-600 group-hover:text-primary-400 transition-colors" size={24} />
                </button>
              ))
            ) : (
              <div className="text-center p-12 bg-charcoal-800 rounded-[40px] border border-charcoal-700 shadow-2xl">
                <User size={48} className="text-charcoal-700 mx-auto mb-6" />
                <p className="text-charcoal-400 text-lg font-light">Nenhum profissional disponível para este serviço no momento.</p>
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
                      "flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all h-36 md:h-40 relative group",
                      !worksThisDay ? "opacity-30 cursor-not-allowed bg-charcoal-800 border-transparent text-charcoal-400" :
                      date === dateStr 
                       ? "border-primary-500 bg-primary-400 shadow-2xl shadow-primary-900/40 text-white scale-[1.05]" 
                       : "bg-charcoal-800 border-charcoal-700 hover:border-primary-400/50 shadow-xl text-charcoal-300"
                    )}
                  >
                    <span className={cn("text-[10px] uppercase tracking-[0.2em] font-bold mb-3", date === dateStr ? "text-white/80" : "text-charcoal-500 group-hover:text-primary-400/70")}>
                      {format(d, 'eee', { locale: currentLocale })}
                    </span>
                    <span className="text-3xl md:text-4xl font-serif font-medium leading-none mb-2">
                      {format(d, 'dd')}
                    </span>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", date === dateStr ? "text-white/70" : "text-secondary-400/60")}>
                      {format(d, 'MMM', { locale: currentLocale })}
                    </span>
                    {!worksThisDay && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-charcoal-900/80 text-charcoal-500 text-[8px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-charcoal-700">{t('booking.off_day')}</span>
                      </div>
                    )}
                  </button>
                )
             })}
          </div>
        )}

        {/* STEP 4: TIME */}
        {step === 4 && (
          <div className="bg-charcoal-800 p-8 md:p-10 rounded-[40px] border border-charcoal-700 shadow-2xl">
            <h3 className="text-center text-charcoal-400 mb-8 font-light tracking-wide text-lg">
              {t('booking.times_at', { date: format(parseISO(date), "dd 'de' MMMM", { locale: currentLocale }) })}
            </h3>
            
            {/* AI Suggested Times */}
            {availableTimes.length > 0 && (
               <div className="mb-10 bg-charcoal-900/40 p-6 rounded-[32px] border border-primary-500/20">
                  <div className="flex items-center gap-3 mb-6 justify-center">
                    <Sparkles className="text-primary-400" size={18} />
                    <h4 className="text-sm font-bold text-primary-400 uppercase tracking-[0.2em]">{t('booking.ai_suggested', 'Suggested by AI')}</h4>
                  </div>
                  
                  {loadingAiTimes ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {aiSuggestedTimes.map(t => (
                        <button
                          key={'ai_' + t}
                          onClick={() => { setTime(t); handleNext(); }}
                          className={cn(
                            "py-4 rounded-[20px] border-2 font-mono text-lg font-medium transition-all group shadow-lg",
                            time === t 
                              ? "border-primary-500 bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-primary-900/40 scale-110" 
                              : "bg-charcoal-800 border-primary-400/30 text-primary-300 hover:border-primary-400 hover:text-white"
                          )}
                        >
                          {t}h
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            )}

            <div className="h-px w-20 bg-charcoal-700 mx-auto mt-4 mb-10"></div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {availableTimes.length > 0 ? (
                availableTimes.filter(t => !aiSuggestedTimes.includes(t)).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTime(t); handleNext(); }}
                    className={cn(
                      "py-5 rounded-[24px] border-2 font-mono text-xl font-medium transition-all group",
                      time === t 
                        ? "border-primary-500 bg-primary-400 text-white shadow-2xl shadow-primary-900/40 scale-110" 
                        : "bg-charcoal-900/50 border-charcoal-700 text-primary-400 hover:border-primary-400/30 hover:text-white"
                    )}
                  >
                    {t}h
                  </button>
                ))
              ) : (
                <div className="col-span-3 sm:col-span-4 text-center py-16 bg-charcoal-900/30 rounded-[32px] border-2 border-charcoal-700 border-dashed">
                  <Clock className="mx-auto text-charcoal-700 mb-6" size={48} />
                  <p className="text-charcoal-400 font-light mb-6">{t('booking.sold_out')}</p>
                  <button onClick={handleBack} className="text-primary-400 font-bold uppercase tracking-widest text-xs hover:text-primary-300 transition-colors">{t('booking.choose_another_date')}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CLIENT DETAILS */}
        {step === 5 && (
          <div className="bg-charcoal-800 p-8 md:p-10 rounded-[40px] shadow-2xl border border-charcoal-700 animate-in slide-in-from-bottom-8">
             <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-primary-400/80 uppercase tracking-[0.2em] mb-4">{t('booking.name_label')}</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-600 group-focus-within:text-primary-400 transition-colors" size={20} />
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder={t('booking.name_placeholder')}
                      className="w-full pl-16 pr-6 h-20 bg-charcoal-900 border border-charcoal-700 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/50 transition-all text-xl font-serif text-white placeholder:text-charcoal-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-400/80 uppercase tracking-[0.2em] mb-4">{t('booking.phone_label')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-600 group-focus-within:text-primary-400 transition-colors" size={20} />
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder={t('booking.phone_placeholder')}
                      className="w-full pl-16 pr-6 h-20 bg-charcoal-900 border border-charcoal-700 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400/50 transition-all text-xl font-mono text-white placeholder:text-charcoal-700"
                    />
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      {step === 5 && (
         <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-charcoal-800/90 backdrop-blur-xl border-t border-charcoal-700 pb-safe z-30 shadow-2xl rounded-t-[40px]">
           <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="hidden md:block">
                 <p className="text-3xl font-serif font-medium text-primary-400">{formatCurrency(selectedService?.price || 0)}</p>
                 <p className="text-sm font-light text-charcoal-300 tracking-wide">{selectedService?.name}</p>
                 <p className="text-[10px] text-charcoal-500 mt-2 uppercase tracking-widest font-bold font-ui">
                   {format(parseISO(date), 'dd/MM', { locale: currentLocale })} • {time}H • {selectedProfessional?.name}
                 </p>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={!clientName || !clientPhone}
                className="w-full md:w-auto py-5 px-12 rounded-[24px] bg-primary-600 text-white font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary-500 transition-all disabled:opacity-30 disabled:grayscale shadow-2xl shadow-primary-900/40 active:scale-95 font-ui"
              >
                {t('booking.confirm_booking_btn')}
              </button>
           </div>
         </div>
      )}
    </div>
  );
};
