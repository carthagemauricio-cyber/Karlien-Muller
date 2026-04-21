import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Appointment, Professional, Service } from './types';
import { addDays, format, startOfToday } from 'date-fns';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  addProfessional: (p: Professional) => void;
  updateProfessional: (p: Professional) => void;
  removeProfessional: (id: string) => void;
  addService: (s: Service) => void;
  updateService: (s: Service) => void;
  removeService: (id: string) => void;
  addAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, status: 'Pendente' | 'Confirmado' | 'Cancelado') => void;
  updateAppointment: (a: Appointment) => void;
  removeAppointment: (id: string) => void;
  publicSlots: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const today = startOfToday();

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [publicSlots, setPublicSlots] = useState<any[]>([]);

  useEffect(() => {
    import('./lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, onSnapshot, setDoc, doc }) => {
        // Services
        const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
          setServices(snapshot.docs.map(d => d.data() as Service));
        });

        // Professionals
        const unsubProfessionals = onSnapshot(collection(db, 'professionals'), (snapshot) => {
          setProfessionals(snapshot.docs.map(d => d.data() as Professional));
        });

        // Always listen to public slots (safe for all)
        const unsubPublic = onSnapshot(collection(db, 'public_slots'), (snapshot) => {
          setPublicSlots(snapshot.docs.map(doc => doc.data()));
        }, () => {});

        // Always listen to appointments (now allowed by global list rules to support client check)
        const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
           const apps = snapshot.docs.map(doc => doc.data() as Appointment);
           setAppointments(apps);
        }, (error) => {
           console.error("Appointments fetch error:", error);
        });
        
        return () => {
          unsubServices();
          unsubProfessionals();
          unsubPublic();
          unsubAppointments();
        };
      });
    });
  }, []);

  const addProfessional = async (p: Professional) => {
    try {
      await setDoc(doc(db, 'professionals', p.id), p);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'professionals');
    }
  };

  const updateProfessional = async (p: Professional) => {
    try {
      await setDoc(doc(db, 'professionals', p.id), p);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'professionals');
    }
  };

  // Eager sync utility to match user's explicit pattern
  const salvarDados = (newProfessionals: Professional[], newServices: Service[]) => {
    localStorage.setItem("profissionais", JSON.stringify(newProfessionals));
    localStorage.setItem("servicos", JSON.stringify(newServices));
  };

  const removeProfessional = async (id: string) => {
    // Eagerly update local state and localStorage
    const newProfessionals = professionals.filter(p => p.id !== id);
    setProfessionals(newProfessionals);
    salvarDados(newProfessionals, services);

    try {
      await deleteDoc(doc(db, 'professionals', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'professionals');
    }
  };

  const addService = async (s: Service) => {
    try {
      await setDoc(doc(db, 'services', s.id), s);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'services');
    }
  };

  const updateService = async (s: Service) => {
    try {
      await setDoc(doc(db, 'services', s.id), s);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'services');
    }
  };

  const removeService = async (id: string) => {
    // Eagerly update local state and localStorage
    const newServices = services.filter(servico => servico.id !== id);
    setServices(newServices);
    salvarDados(professionals, newServices);

    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'services');
    }
  };

  const addAppointment = async (a: Appointment) => {
    console.log("Saving new booking to Firestore:", a);
    try {
      // 1. Save Full Appointment to 'appointments' (Private, Admin Only)
      await setDoc(doc(db, 'appointments', a.id), a);
      
      // 2. Save Public Slot to 'public_slots' (Public Read, No PII)
      const slotId = `${a.professionalId}_${a.date}_${a.time.replace(':','')}`;
      await setDoc(doc(db, 'public_slots', slotId), {
        id: slotId,
        appId: a.id,
        professionalId: a.professionalId,
        date: a.date,
        time: a.time,
        status: a.status
      });
      
      console.log("Booking saved successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `appointments/${a.id}`);
    }
  };
  
  const updateAppointmentStatus = async (id: string, status: 'Pendente' | 'Confirmado' | 'Cancelado') => {
    try {
      const appToUpdate = appointments.find(a => a.id === id);
      await updateDoc(doc(db, 'appointments', id), { status });
      
      if (appToUpdate) {
        const slotId = `${appToUpdate.professionalId}_${appToUpdate.date}_${appToUpdate.time.replace(':','')}`;
        await updateDoc(doc(db, 'public_slots', slotId), { status }).catch(() => {
           // Might not exist if legacy
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };
  
  const updateAppointment = async (a: Appointment) => {
    try {
      await setDoc(doc(db, 'appointments', a.id), a);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `appointments/${a.id}`);
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      const appToDelete = appointments.find(a => a.id === id);
      await deleteDoc(doc(db, 'appointments', id));
      
      if (appToDelete) {
        const slotId = `${appToDelete.professionalId}_${appToDelete.date}_${appToDelete.time.replace(':','')}`;
        await deleteDoc(doc(db, 'public_slots', slotId)).catch(() => {});
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  return (
    <AppContext.Provider value={{
      professionals, services, appointments,
      addProfessional, updateProfessional, removeProfessional,
      addService, updateService, removeService,
      addAppointment, updateAppointmentStatus, updateAppointment, removeAppointment, publicSlots
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
