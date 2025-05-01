import axios from 'axios';

const RECEIPT_API_URL = process.env.REACT_APP_RECEIPT_API_URL || 'http://localhost:3003';

const receiptAxios = axios.create({
  baseURL: RECEIPT_API_URL,
  timeout: 10000,
});

export interface Receipt {
  _id?: string;  // MongoDB ID
  id: string;    // Keep the id field for backward compatibility
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

export const receiptApi = {
  createReceipt: async (data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await receiptAxios.post<{ success: boolean; data: Receipt }>('/api/receipts', data);
      return response.data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  getReceipts: async (params?: { eventId?: string; churchId?: string; page?: number; limit?: number }) => {
    try {
      const response = await receiptAxios.get<ReceiptResponse>('/api/receipts', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting receipts:', error);
      throw error;
    }
  },

  getReceiptById: async (id: string) => {
    try {
      const response = await receiptAxios.get<{ success: boolean; data: Receipt }>(`/api/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting receipt:', error);
      throw error;
    }
  },

  updateReceipt: async (id: string, data: Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await receiptAxios.put<{ success: boolean; data: Receipt }>(`/api/receipts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  deleteReceipt: async (id: string) => {
    try {
      const response = await receiptAxios.delete<{ success: boolean }>(`/api/receipts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }
}; 