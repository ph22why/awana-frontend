import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment 
  ? `http://localhost:${process.env.NEXT_PUBLIC_RECEIPT_SERVICE_PORT || '3003'}`
  : 'http://182.231.199.64:3003';

const receiptAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API 경로 상수
const API_PATHS = {
  RECEIPTS: '/',
  SEARCH: '/search'
};

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
      const response = await receiptAxios.post<{ success: boolean; data: Receipt }>(API_PATHS.RECEIPTS, data);
      return response.data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  getReceipts: async (params?: { eventId?: string; churchId?: string; page?: number; limit?: number }) => {
    try {
      const response = await receiptAxios.get<ReceiptResponse>(API_PATHS.RECEIPTS, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting receipts:', error);
      throw error;
    }
  },

  getReceiptById: async (id: string) => {
    try {
      const response = await receiptAxios.get<{ success: boolean; data: Receipt }>(`${API_PATHS.RECEIPTS}${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting receipt:', error);
      throw error;
    }
  },

  updateReceipt: async (id: string, data: Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await receiptAxios.put<{ success: boolean; data: Receipt }>(`${API_PATHS.RECEIPTS}${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  deleteReceipt: async (id: string) => {
    try {
      const response = await receiptAxios.delete<{ success: boolean }>(`${API_PATHS.RECEIPTS}${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }
}; 