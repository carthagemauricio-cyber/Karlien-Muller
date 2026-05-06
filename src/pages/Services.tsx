import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Clock, Plus, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Service } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ServicesPage = () => {
  const { services, addService, updateService, removeService, appointments } = useAppStore();
  const { t } = useTranslation();
  const [editingService, setEditingService] = useState<Service | null | 'new'>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const requestDelete = (id: string) => {
    const isLinked = appointments.some(app => app.serviceId === id);
    if (isLinked) {
      toast.error(t('management.not_removable_linked'));
      return;
    }
    setDeletingServiceId(id);
  };

  const confirmDelete = () => {
    if (deletingServiceId) {
      removeService(deletingServiceId);
      toast.success(t('management.removed_success'));
      setDeletingServiceId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-sans font-medium text-gray-900 mb-2">{t('management.services')}</h1>
          <div className="h-1 w-20 bg-primary-400 mb-2"></div>
          <p className="text-gray-600 font-light">{t('management.services_subtitle')}</p>
        </div>
        <button 
          onClick={() => setEditingService('new')}
          className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-primary-900/20 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 font-sans">
          <Plus size={18} /> {t('management.add_service')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                {service.name}
              </h3>
            </div>

            <div className="flex-1 space-y-4 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-4 py-2 rounded-xl w-max border border-primary-100">
                  <Clock size={14} className="text-primary-400" />
                  {service.duration} {t('management.minutes')}
                </div>
                <div className="text-3xl font-bold text-primary-600">
                  {formatCurrency(service.price)}
                </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setEditingService(service)}
                className="flex-1 py-3 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest border border-primary-200 rounded-2xl bg-primary-50 hover:bg-primary-100 shadow-sm">
                {t('management.edit')}
              </button>
              <button 
                onClick={() => requestDelete(service.id)}
                className="flex-1 py-3 text-[10px] font-bold text-rose-500 hover:text-white transition-colors uppercase tracking-widest border border-rose-200 rounded-2xl hover:bg-rose-500 shadow-sm">
                {t('management.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingService && (
        <ServiceModal 
          service={editingService === 'new' ? null : editingService} 
          onClose={() => setEditingService(null)} 
          onSave={(service) => {
            if (editingService === 'new') {
              addService(service);
              toast.success(t('management.completed', 'Concluído com sucesso!'));
            } else {
              updateService(service);
              toast.success(t('management.completed', 'Concluído com sucesso!'));
            }
            setEditingService(null);
          }}
        />
      )}

      {deletingServiceId && (
        <div className="fixed inset-0 z-[60] bg-gray-100/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-gray-50 rounded-[40px] p-10 w-full max-w-sm shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
            <h3 className="text-2xl font-sans text-gray-900 mb-3 font-medium">{t('management.delete_title')}</h3>
            <p className="text-gray-600 text-sm font-light leading-relaxed mb-8">{t('management.delete_confirm')}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingServiceId(null)}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all"
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

const ServiceModal = ({ service, onClose, onSave }: { service: Service | null, onClose: () => void, onSave: (s: Service) => void }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(service?.name || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '60');
  const [price, setPrice] = useState(service?.price?.toString() || '1500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration || !price) {
      toast.error(t('management.fill_all_fields'));
      return;
    }
    
    onSave({
      id: service?.id || `s_${Date.now()}`,
      name,
      duration: parseInt(duration, 10),
      price: parseFloat(price)
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-100/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-[40px] p-8 md:p-12 w-full max-w-lg shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-8 relative">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-sans text-gray-900">{service ? t('management.edit_service') : t('management.new_service')}</h2>
            <div className="h-0.5 w-12 bg-primary-400 mt-2"></div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all text-gray-600 border border-gray-300">
             <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.service_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-sans text-xl text-gray-900 placeholder-gray-400"
              placeholder={t('management.service_name_placeholder', 'ex: Madeixas')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.service_duration')}</label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-mono text-xl text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-primary-400/80 uppercase tracking-widest mb-3 ml-2">{t('management.service_price')}</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400/30 transition-all font-mono text-xl text-gray-900"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="mt-10 w-full bg-primary-600 hover:bg-primary-500 text-white rounded-2xl py-5 px-8 font-bold uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary-900/40 active:scale-95 text-xs font-sans"
          >
            {service ? t('management.save') : t('management.service_create')}
          </button>
        </form>
      </div>
    </div>
  );
};
