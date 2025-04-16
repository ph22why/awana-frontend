import axios from 'axios';
import { EventFormData, SampleEvent } from '../../types/event';

// BASE_URL을 환경 변수에서 가져오되, /api는 제외
const BASE_URL = process.env.REACT_APP_EVENT_API_URL || 'http://localhost:3001';

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// API 경로 상수
const API_PATHS = {
  EVENTS: '/api/events',
  SAMPLE_EVENTS: '/api/events/samples'
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
}

export interface IEvent extends IEventCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface EventApiResponse {
  success: boolean;
  data: IEvent[];
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
  getEvents: async (): Promise<IEvent[]> => {
    try {
      console.log('Fetching events...');
      console.log('Request URL:', `${BASE_URL}${API_PATHS.EVENTS}`);
      
      const response = await axios.get<EventsResponse>(`${BASE_URL}${API_PATHS.EVENTS}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Response:', response.data);
      
      // 응답이 배열인 경우 (기존 API 형식)
      if (Array.isArray(response.data)) {
        return response.data as IEvent[];
      }
      
      // 응답이 객체인 경우 (새로운 API 형식)
      const apiResponse = response.data as EventApiResponse;
      if (apiResponse.success) {
        return apiResponse.data || [];
      } else if (apiResponse.data) {
        return apiResponse.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching events:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw new Error(error.response?.data?.error || error.message || '이벤트 목록을 불러오는데 실패했습니다.');
    }
  },

  // 이벤트 생성
  createEvent: async (eventData: EventFormData) => {
    try {
      console.log('Creating event...');
      console.log('Request URL:', `${BASE_URL}${API_PATHS.EVENTS}`);
      console.log('Event Data:', eventData);
      
      const response = await axios({
        method: 'post',
        url: `${BASE_URL}${API_PATHS.EVENTS}`,
        data: eventData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Response:', response.data);
      return response;
    } catch (error: any) {
      console.error('Error creating event:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  // 샘플 이벤트 목록 조회
  getSampleEvents: async (): Promise<SampleEventApiResponse> => {
    try {
      console.log('Fetching sample events...');
      console.log('Request URL:', `${BASE_URL}${API_PATHS.SAMPLE_EVENTS}`);
      
      const response = await axios.get<SampleEvent[] | SampleEventApiResponse>(`${BASE_URL}${API_PATHS.SAMPLE_EVENTS}`, {
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
  }
};

export default eventApi; 