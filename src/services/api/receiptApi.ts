import { api } from '@/lib/api';
import { Receipt, ReceiptResponse } from '@/types/receipt';

export const receiptApi = {
  createReceipt: async (data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: Receipt }> => {
    const response = await api.post('/api/receipts', data);
    return { success: true, data: response.data || response };
  },

  getAllReceipts: async (): Promise<ReceiptResponse> => {
    const response = await api.get('/api/receipts');
    return {
      success: true,
      data: Array.isArray(response) ? response : response.data || [],
      count: Array.isArray(response) ? response.length : response.data?.length || 0,
    };
  },

  getReceiptById: async (id: string): Promise<Receipt> => {
    const response = await api.get(`/api/receipts/${id}`);
    return response.data || response;
  },

  searchReceipts: async (query: {
    eventId?: string;
    churchName?: string;
    managerPhone?: string;
    registrationNumber?: string;
  }): Promise<ReceiptResponse> => {
    const queryParams = new URLSearchParams();
    if (query.eventId) queryParams.append('eventId', query.eventId);
    if (query.churchName) queryParams.append('churchName', query.churchName);
    if (query.managerPhone) queryParams.append('managerPhone', query.managerPhone);
    if (query.registrationNumber) queryParams.append('registrationNumber', query.registrationNumber);

    const endpoint = `/api/receipts/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    
    return {
      success: true,
      data: Array.isArray(response) ? response : response.data || [],
      count: Array.isArray(response) ? response.length : response.data?.length || 0,
    };
  },

  updateReceipt: async (id: string, data: Partial<Receipt>): Promise<Receipt> => {
    const response = await api.put(`/api/receipts/${id}`, data);
    return response.data || response;
  },

  deleteReceipt: async (id: string): Promise<void> => {
    await api.delete(`/api/receipts/${id}`);
  },
};

export type { Receipt, ReceiptResponse };
