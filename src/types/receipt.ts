export interface Receipt {
  _id?: string;
  id: string;
  eventId: string;
  churchId: {
    mainId: string;
    subId: string;
  };
  churchName: string;
  managerName: string;
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

export interface ReceiptResponse {
  success: boolean;
  data: Receipt[];
  count: number;
  error?: string;
}
