export interface ChurchManager {
  _id: string;
  churchName: string;
  churchAddress: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  participants?: number;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  eventId?: string;
  costs?: number;
  partTeacher?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BTReceipt {
  _id: string;
  eventId: string;
  churchId: {
    mainId: string;
    subId: string;
  };
  churchName: string;
  managerName: string;
  partTeacher: number;
  costs: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChurchManagerResponse {
  success: boolean;
  data: ChurchManager[];
  count: number;
  error?: string;
}
