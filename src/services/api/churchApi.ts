import axios from 'axios';

const CHURCH_API_URL = process.env.REACT_APP_CHURCH_API_URL || 'http://localhost:3002';

const churchAxios = axios.create({
  baseURL: CHURCH_API_URL,
  timeout: 10000,
});

export interface Church {
  _id: string;
  mainId: string;
  subId: string;
  name: string;
  managerName?: string;
  phone?: string;
  address?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChurchResponse {
  success: boolean;
  data: Church[];
  pagination: PaginationInfo;
  error?: string;
}

export interface ChurchSearchParams {
  mainId?: string;
  name?: string;
  page?: number;
  limit?: number;
  location?: string;
  getAllResults?: boolean;
}

export const churchApi = {
  searchChurches: async (params: ChurchSearchParams) => {
    try {
      // If getAllResults is true, set a very high limit to get all results
      const searchParams = params.getAllResults 
        ? { ...params, limit: 10000, page: 1 } 
        : {
            ...params,
            page: params.page || 1,
            limit: params.limit || 20
          };

      const response = await churchAxios.get<ChurchResponse>('/api/churches', { 
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Error searching churches:', error);
      throw error;
    }
  },

  getChurchById: async (id: string) => {
    try {
      const response = await churchAxios.get<{ success: boolean; data: Church }>(`/api/churches/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting church:', error);
      throw error;
    }
  }
}; 