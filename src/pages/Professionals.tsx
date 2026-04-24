import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Scissors, User, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Professionals = () => {
  const { professionals, services, appointments, addProfessional, updateProfessional, removeProfessional } = useAppStore();
  const { t } = useTranslation();
  const [editingProf, setEditingProf] = useState<Professional | null | 'new'>(null);
  const [deletingProfId, setDeletingProfId] = useState<string | null>(null);

  const daysOfWeek = [t('common.days.sun', 'Dom'), t('common.days.mon', 'Seg'), t('common.days.tue', 'Ter'), t('common.days.wed', 'Qua'), t('common.days.thu', 'Qui'), t('common.days.fri', 'Sex'), t('common.days.sat', 'Sáb')];

  const requestDelete = (id: string) => {
    const isLinked = appointments.some(app => app.professionalId === id);
    if (isLinked) {
      toast.error(t('management.not_removable_linked'));
      return;
    }
    setDeletingProfId(id);
  };

  const confirmDelete = () => {
    if (deletingProfId) {
      removeProfessional(deletingProfId);
      toast.success(t('management.removed_success'));
      setDeletingProfId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-serif font-medium text-white mb-2">{t('management.professionals')}</h1>
          <div className="h-1 w-20 bg-primary-400 mb-2"></div>
          <p className="text-charcoal-400 font-light">{t('management.professionals_subtitle')}</p>
        </div>
        <button 
          onClick={() => setEditingProf('new')}
          className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-primary-900/20 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 font-ui">
          <Plus size={18} /> {t('management.add_professional')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {professionals.map((prof) => (
          <div key={prof.id} className="bg-charcoal-800 rounded-[40px] p-8 shadow-2xl border border-charcoal-700 flex flex-col hover:border-primary-400/30 transition-all group">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-6">
                <img 
                  src={prof.photo} 
                  alt={prof.name} 
                  className="w-32 h-32 rounded-full object-cover border-2 border-primary-400/20 shadow-2xl group-hover:border-primary-400 transition-all"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-charcoal-700 border border-primary-400/30 text-primary-400 flex items-center justify-center">
                  <User size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-serif font-medium text-white group-hover:text-primary-200 transition-colors">{prof.name}</h3>
                <div className="text-[10px] text-primary-400/60 font-bold mt-2 uppercase tracking-[0.3em]">
                   {t('management.team_member_role', 'Specialist')}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-3">{t('management.specialties')}</h4>
                <div className="flex flex-wrap gap-2">
                  {prof.specialties.map(specId => {
                    const serv = services.find(s => s.id === specId);
                    return serv ? (
                      <span key={specId} className="px-3 py-1.5 bg-primary-400/5 text-primary-400 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-primary-400/10">
                        {serv.name}
                      </span>
                    ) : null;
                  })}
                </div>
                {prof.specialties.length === 0 && (
                  <span className="text-xs text-charcoal-600 italic font-light">{t('management.no_specialties')}</span>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-3 mt-6">{t('management.schedule')}</h4>
                <div className="bg-charcoal-900/50 rounded-2xl p-4 border border-charcoal-700/50">
                   <div className="flex gap-2 mb-3 justify-center">
                     {daysOfWeek.map((day, idx) => (
                       <div 
                         key={idx} 
                         className={cn(
                           "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border",
                           prof.availability.days.includes(idx) 
                             ? "bg-primary-400/10 border-primary-400/30 text-primary-400" 
                             : "border-transparent text-charcoal-700"
                         )}
                       >
                         {day.charAt(0)}
                       </div>
                     ))}
                   </div>
                   <div className="text-[11px] font-bold text-charcoal-400 flex items-center justify-center gap-2 tracking-widest uppercase font-mono">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                     {prof.availability.startHour} — {prof.availability.endHour}
                   </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-charcoal-700">
              <button 
                onClick={() => setEditingProf(prof)}
                className="flex-1 py-3 text-[10px] font-bold text-primary-400 border border-primary-400/20 hover:bg-primary-400/10 rounded-2xl transition-all uppercase tracking-[0.2em] font-ui">
                {t('management.edit')}
              </button>
              <button 
                onClick={() => requestDelete(prof.id)}
                className="py-3 px-6 text-[10px] font-bold text-rose-400/60 border border-rose-500/10 hover:bg-rose-500/10 hover:text-rose-400 rounded-2xl transition-all uppercase tracking-[0.2em] font-ui">
                {t('management.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProf && (
        <ProfessionalModal 
          prof={editingProf === 'new' ? null : editingProf} 
          onClose={() => setEditingProf(null)} 
          onSave={(prof) => {
            if (editingProf === 'new') {
              addProfessional(prof);
              toast.success(t('management.completed', 'Concluído com sucesso!'));
            } else {
              updateProfessional(prof);
              toast.success(t('management.completed', 'Concluído com sucesso!'));
            }
            setEditingProf(null);
          }}
        />
      )}

      {deletingProfId && (
        <div className="fixed inset-0 z-[60] bg-charcoal-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-charcoal-800 rounded-[40px] p-10 w-full max-w-sm shadow-2xl border border-charcoal-700 animate-in fade-in zoom-in-95 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <h3 className="text-2xl font-serif text-white mb-3 font-medium">{t('management.delete_title')}</h3>
            <p className="text-charcoal-400 text-sm font-light leading-relaxed mb-8">{t('management.delete_confirm')}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingProfId(null)}
                className="flex-1 px-6 py-4 bg-charcoal-700 hover:bg-charcoal-600 text-charcoal-200 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-900/20"
              >
                {t('management.delete_yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfessionalModal = ({ prof, onClose, onSave }: { prof: Professional | null, onClose: () => void, onSave: (p: Professional) => void }) => {
  const { services } = useAppStore();
  const { t } = useTranslation();
  
  const [name, setName] = useState(prof?.name || '');
  const [photo, setPhoto] = useState(prof?.photo || '');
  const [specialties, setSpecialties] = useState<string[]>(prof?.specialties || []);
  const [days, setDays] = useState<number[]>(prof?.availability.days || [1, 2, 3, 4, 5]);
  const [startHour, setStartHour] = useState(prof?.availability.startHour || '09:00');
  const [endHour, setEndHour] = useState(prof?.availability.endHour || '18:00');

  const daysOfWeek = [t('common.days.sun', 'Dom'), t('common.days.mon', 'Seg'), t('common.days.tue', 'Ter'), t('common.days.wed', 'Qua'), t('common.days.thu', 'Qui'), t('common.days.fri', 'Sex'), t('common.days.sat', 'Sáb')];

  const toggleDay = (idx: number) => {
    setDays(prev => 
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    );
  };

  const toggleSpecialty = (id: string) => {
    setSpecialties(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the image to draw on canvas instead of reading full buffer first
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Quality factor 0.7 for JPEG compression to ensure the base64 string is tiny
             const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
             setPhoto(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('management.name_required'));
      return;
    }
    if (days.length === 0) {
      toast.error(t('management.select_at_least_one_day'));
      return;
    }
    
    // Default placeholder photo if empty
    const finalPhoto = photo.trim() || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80';

    onSave({
      id: prof?.id || `p_${Date.now()}`,
      name,
      photo: finalPhoto,
      specialties,
      availability: {
        days,
        startHour,
        endHour
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-charcoal-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-charcoal-800 rounded-[40px] p-8 md:p-12 w-full max-w-2xl shadow-2xl border border-charcoal-700 max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-8 relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif text-white">{prof ? t('management.edit_professional') : t('management.new_professional')}</h2>
            <div className="h-0.5 w-12 bg-primary-400 mt-2"></div>
          </div>
          <button onClick={onClose} className="p-3 bg-charcoal-700 rounded-full hover:bg-charcoal-600 transition-all text-charcoal-400 border border-charcoal-600">
             <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.professional_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-serif text-xl text-white placeholder:text-charcoal-700"
              placeholder={t('management.name_placeholder', 'ex: Marta Silva')}
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.professional_photo')}</label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                {photo ? (
                  <img 
                    src={photo} 
                    alt="Preview" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-400/20 bg-charcoal-900 shrink-0" 
                  />
                ) : (
                   <div className="w-24 h-24 rounded-full bg-charcoal-900 border-2 border-charcoal-700 flex items-center justify-center shrink-0">
                      <User size={32} className="text-charcoal-700" />
                   </div>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*"
                  id="fotoProfissional"
                  onChange={handlePhotoUpload}
                  className="w-full text-[10px] text-charcoal-500 font-bold uppercase tracking-widest file:cursor-pointer file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border file:border-primary-400/20 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-primary-400/10 file:text-primary-400 hover:file:bg-primary-400/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-4 ml-2">{t('management.specialties')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.map(service => (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => toggleSpecialty(service.id)}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                    specialties.includes(service.id)
                      ? "bg-primary-400/10 border-primary-400 text-primary-400 shadow-lg shadow-primary-900/20"
                      : "bg-charcoal-900/50 border-charcoal-700 text-charcoal-500 hover:border-primary-400/30"
                  )}
                >
                  {service.name}
                </button>
              ))}
              {services.length === 0 && <span className="text-xs text-charcoal-600 font-light italic">{t('management.add_services_first')}</span>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-4 ml-2">{t('management.professional_work_days')}</label>
            <div className="flex gap-4 justify-between max-w-sm">
              {daysOfWeek.map((day, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={cn(
                    "w-12 h-12 rounded-full flex flex-col items-center justify-center text-[10px] font-bold uppercase border transition-all",
                    days.includes(idx)
                      ? "bg-primary-400 border-primary-400 text-white shadow-xl shadow-primary-900/20"
                      : "bg-charcoal-900/50 border-charcoal-700 text-charcoal-600 hover:border-primary-400/30"
                  )}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.professional_start_hour')}</label>
              <input 
                type="time" 
                lang="pt-PT"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-6 py-4 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-mono text-xl text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.professional_end_hour')}</label>
              <input 
                type="time" 
                lang="pt-PT"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-6 py-4 bg-charcoal-900 border border-charcoal-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-mono text-xl text-white"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="mt-10 w-full bg-primary-600 hover:bg-primary-500 text-white rounded-2xl py-5 px-8 font-bold uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary-900/40 active:scale-95 text-xs font-ui"
          >
            {prof ? t('management.save') : t('management.professional_create')}
          </button>
        </form>
      </div>
    </div>
  );
};
