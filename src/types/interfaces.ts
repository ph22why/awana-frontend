// Event interfaces
export interface IEvent {
  _id: string;
  eventName: string;
  eventDate: string;
  eventYear: number;
  eventLocation: string;
  eventPlace: string;
  registrationStartDate: string;
  registrationEndDate: string;
  eventStartDate: string;
  eventEndDate: string;
  maxParticipants: number;
  registrationFee: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Church interfaces
export interface IChurch {
  _id: string;
  mainId: string;
  subId: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Receipt interfaces
export interface IReceipt {
  _id: string;
  churchId: string;
  churchName: string;
  eventId: string;
  managerPhone: string;
  partTotal: number;
  partStudent: number;
  partTeacher: number;
  partYM: number;
  costs: number;
  paymentMethod: 'card' | 'bank' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  paymentDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  error?: string;
} 