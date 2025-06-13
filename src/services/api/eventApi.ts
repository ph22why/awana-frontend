import axios from 'axios';
import { EventFormData, SampleEvent } from '../../types/event';

const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment 
  ? `http://localhost:${process.env.NEXT_PUBLIC_EVENT_SERVICE_PORT || '3001'}`
  : 'http://182.231.199.64:3001';

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/events`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API 경로 상수
const API_PATHS = {
  EVENTS: '/',
  SAMPLE_EVENTS: '/samples'
};

export interface IEventCreate {
  event_Name: string;
  event_Description?: string;
  event_Location: string;
  event_Year: number;
  event_Start_Date: string;
  event_End_Date: string;
  event_Registration_Start_Date: string;
  event_Registration_End_Date: string;
  event_Open_Available: '공개' | '비공개';
  event_Place: string;
  event_Month: number;
  event_Registration_Start_Time?: string;
  event_Registration_End_Time?: string;
}

export interface IEvent extends IEventCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;
  event_Link?: string;
}

export interface EventApiResponse {
  success: boolean;
  data: IEvent[];
  error?: string;
}

export interface SingleEventApiResponse {
  success: boolean;
  data: IEvent;
  error?: string;
}

interface EventsResponse {
  data: IEvent[] | EventApiResponse;
}

interface SampleEventApiResponse {
  success?: boolean;
  data: SampleEvent[];
  error?: string;
}

export const eventApi = {
  // 이벤트 목록 조회
  getEvents: async (params?: { year?: number; page?: number; limit?: number }): Promise<IEvent[]> => {
    try {
      console.log('Fetching events with params:', params);
      const response = await axiosInstance.get<IEvent[] | EventApiResponse>(API_PATHS.EVENTS, { 
        params,
        validateStatus: (status) => status < 500 // 500 미만의 모든 상태 코드를 유효한 응답으로 처리
      });
      
      console.log('Events response:', response.data);
      
      // 응답이 배열인 경우 직접 반환
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // 응답이 EventApiResponse 형태인 경우 data 필드 반환
      if ('data' in response.data) {
        return response.data.data;
      }
      
      // 기본값으로 빈 배열 반환
      return [];
    } catch (error: any) {
      console.error('Error fetching events:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      if (error.response?.status === 404) {
        return []; // 404 에러의 경우 빈 배열 반환
      }
      throw new Error(error.response?.data?.error || error.message || '이벤트 목록을 불러오는데 실패했습니다.');
    }
  },

  // 이벤트 생성
  createEvent: async (eventData: EventFormData): Promise<IEvent> => {
    try {
      console.log('Creating event with data:', eventData);
      
      // 날짜 데이터 변환
      const formattedData = {
        ...eventData,
        event_Start_Date: eventData.event_Start_Date ? new Date(eventData.event_Start_Date).toISOString() : undefined,
        event_End_Date: eventData.event_End_Date ? new Date(eventData.event_End_Date).toISOString() : undefined,
        event_Registration_Start_Date: eventData.event_Registration_Start_Date ? new Date(eventData.event_Registration_Start_Date).toISOString() : undefined,
        event_Registration_End_Date: eventData.event_Registration_End_Date ? new Date(eventData.event_Registration_End_Date).toISOString() : undefined
      };
      
      console.log('Formatted event data:', formattedData);
      console.log('Request URL:', `${BASE_URL}${API_PATHS.EVENTS}`);
      
      const response = await axiosInstance.post<SingleEventApiResponse>(`${API_PATHS.EVENTS}`, formattedData);
      
      console.log('Create event response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || '이벤트 생성에 실패했습니다.');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating event:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw new Error(error.response?.data?.error || error.message || '이벤트 생성에 실패했습니다.');
    }
  },

  // 샘플 이벤트 목록 조회
  getSampleEvents: async (): Promise<SampleEventApiResponse> => {
    try {
      console.log('Fetching sample events...');
      const fullUrl = `${BASE_URL}/api/events${API_PATHS.SAMPLE_EVENTS}`;
      console.log('Request URL:', fullUrl);
      
      const response = await axios.get<SampleEvent[] | SampleEventApiResponse>(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Response:', response.data);
      
      // 응답이 배열인 경우
      if (Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data
        };
      }
      
      // 응답이 객체인 경우
      if (response.data.data) {
        return response.data;
      }
      
      return {
        success: true,
        data: []
      };
    } catch (error: any) {
      console.error('Error fetching sample events:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw new Error(error.response?.data?.error || error.message || '샘플 이벤트 목록을 불러오는데 실패했습니다.');
    }
  },

  // 이벤트 수정
  updateEvent: async (id: string, eventData: Partial<EventFormData>) => {
    try {
      console.log('Updating event...');
      
      // 날짜 데이터 변환
      const formattedData = {
        ...eventData,
        event_Start_Date: eventData.event_Start_Date ? new Date(eventData.event_Start_Date).toISOString() : undefined,
        event_End_Date: eventData.event_End_Date ? new Date(eventData.event_End_Date).toISOString() : undefined,
        event_Registration_Start_Date: eventData.event_Registration_Start_Date ? new Date(eventData.event_Registration_Start_Date).toISOString() : undefined,
        event_Registration_End_Date: eventData.event_Registration_End_Date ? new Date(eventData.event_Registration_End_Date).toISOString() : undefined
      };

      console.log('Request URL:', `${BASE_URL}${API_PATHS.EVENTS}/${id}`);
      console.log('Event Data:', formattedData);
      
      const response = await axios.put(`${BASE_URL}${API_PATHS.EVENTS}/${id}`, formattedData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // 이벤트 삭제
  deleteEvent: async (id: string) => {
    try {
      console.log('Deleting event...');
      console.log('Request URL:', `${BASE_URL}${API_PATHS.EVENTS}/${id}`);
      
      const response = await axios({
        method: 'delete',
        url: `${BASE_URL}${API_PATHS.EVENTS}/${id}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting event:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  getEventById: async (id: number) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: IEvent }>(`${API_PATHS.EVENTS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }
};

export default eventApi; 