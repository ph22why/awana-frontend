import { api } from '@/lib/api';
import { Church, ChurchResponse, ChurchSearchParams } from '@/types/church';

export const churchApi = {
  searchChurches: async (params: ChurchSearchParams = {}): Promise<ChurchResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.churchName) queryParams.append('churchName', params.churchName);
    if (params.name) queryParams.append('name', params.name);
    if (params.mainId) queryParams.append('mainId', params.mainId);
    if (params.region) queryParams.append('region', params.region);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.getAllResults) queryParams.append('getAllResults', 'true');

    const endpoint = `/api/churches/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    
    return {
      success: true,
      data: Array.isArray(response) ? response : response.data || [],
      count: response.count || (Array.isArray(response) ? response.length : response.data?.length || 0),
    };
  },

  getChurchById: async (id: string): Promise<Church> => {
    const response = await api.get(`/api/churches/${id}`);
    return response.data || response;
  },

  createChurch: async (churchData: Omit<Church, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Church> => {
    const response = await api.post('/api/churches', churchData);
    return response.data || response;
  },

  updateChurch: async (id: string, churchData: Partial<Church>): Promise<Church> => {
    const response = await api.put(`/api/churches/${id}`, churchData);
    return response.data || response;
  },

  deleteChurch: async (id: string): Promise<void> => {
    await api.delete(`/api/churches/${id}`);
  },

  getAllChurches: async (): Promise<Church[]> => {
    const response = await churchApi.searchChurches({ getAllResults: true });
    return response.data;
  },
};

export type { Church, ChurchResponse, ChurchSearchParams };
