export interface Professional {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  availability: {
    days: number[]; // 0-6 (Sunday-Saturday)
    startHour: string; // e.g. "09:00"
    endHour: string; // e.g. "18:00"
  };
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  professionalId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'Pendente' | 'Confirmado' | 'Cancelado';
  createdAt: string; // ISO string
  whatsappSent?: boolean;
}
