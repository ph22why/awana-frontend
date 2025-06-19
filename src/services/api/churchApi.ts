import axios from 'axios';

const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment 
  ? `http://localhost:${process.env.NEXT_PUBLIC_CHURCH_SERVICE_PORT || '3002'}`
  : ''; // Use relative URLs for HTTPS production

// BASE_URL을 환경 변수에서 가져오되, /api는 제외
// const BASE_URL = process.env.REACT_APP_CHURCH_API_URL || '/api/churches';

// axios 인스턴스 생성
const axiosInstance = axios.create({
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
  CHURCHES: '/api/churches/',
  SEARCH: '/api/churches/search'
};

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
  count: number;  // 백엔드 응답 형식에 맞춤
  error?: string;
}

export interface SingleChurchResponse {
  success: boolean;
  data: Church;
  error?: string;
}

export interface ChurchSearchParams {
  mainId?: string;
  name?: string;
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
  getAllResults?: boolean;  // 전체 결과를 가져오기 위한 파라미터
}

export const churchApi = {
  searchChurches: async (params: ChurchSearchParams): Promise<ChurchResponse> => {
    try {
      console.log('Fetching churches with params:', params);
      const response = await axiosInstance.get<ChurchResponse>(API_PATHS.CHURCHES, { 
        params: {
          page: params.page || 1,
          limit: params.getAllResults ? 10000 : (params.limit || 20),
          search: params.name || params.search
        }
      });
      
      console.log('Church API Response:', response.data);
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        error: response.data.error
      };
    } catch (error: any) {
      console.error('Error fetching churches:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error?.response?.data?.message || error.message || '교회 목록을 불러오는데 실패했습니다.'
      };
    }
  },

  getChurchById: async (mainId: string, subId: string): Promise<SingleChurchResponse> => {
    try {
      const response = await axiosInstance.get<SingleChurchResponse>(`${API_PATHS.CHURCHES}${mainId}/${subId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting church:', error);
      throw error;
    }
  },

  createChurch: async (churchData: Omit<Church, '_id' | 'createdAt' | 'updatedAt'>): Promise<SingleChurchResponse> => {
    try {
      const response = await axiosInstance.post<SingleChurchResponse>(API_PATHS.CHURCHES, churchData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating church:', error);
      throw error;
    }
  },

  updateChurch: async (mainId: string, subId: string, churchData: Partial<Omit<Church, '_id' | 'createdAt' | 'updatedAt'>>): Promise<SingleChurchResponse> => {
    try {
      const response = await axiosInstance.put<SingleChurchResponse>(`${API_PATHS.CHURCHES}${mainId}/${subId}`, churchData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating church:', error);
      throw error;
    }
  },

  deleteChurch: async (mainId: string, subId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axiosInstance.delete<{ success: boolean; message?: string }>(`${API_PATHS.CHURCHES}${mainId}/${subId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting church:', error);
      throw error;
    }
  }
}; 