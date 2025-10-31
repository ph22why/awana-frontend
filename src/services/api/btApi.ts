import { api } from '@/lib/api';
import { ChurchManager, BTReceipt, ChurchManagerResponse } from '@/types/bt';

export const btApi = {
  getChurchManagers: async (): Promise<ChurchManagerResponse> => {
    const response = await api.get('/api/bt/church-managers');
    return {
      success: true,
      data: Array.isArray(response) ? response : response.data || [],
      count: Array.isArray(response) ? response.length : response.data?.length || 0,
    };
  },

  updateChurchManagerStatus: async (
    managerId: string,
    status: string,
    eventId?: string,
    costs?: number,
    partTeacher?: number
  ): Promise<{ success: boolean; data: ChurchManager }> => {
    const response = await api.put(`/api/bt/church-managers/${managerId}/status`, {
      status,
      eventId,
      costs,
      partTeacher,
    });
    return { success: true, data: response.data || response };
  },

  getBTReceiptByChurchManager: async (managerId: string): Promise<BTReceipt[]> => {
    const response = await api.get(`/api/bt/receipts/manager/${managerId}`);
    return Array.isArray(response) ? response : response.data || [];
  },
};

export type { ChurchManager, BTReceipt, ChurchManagerResponse };
