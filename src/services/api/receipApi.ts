import axios from 'axios';
import { ReceiptFormData} from '../../types/receipt';

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
  RECEIPT: '/api/receipt',
};


export const receipApi = {
  createReceipt: async (receiptData: ReceiptFormData) => {
    try {
      console.log('보내는 영수증 데이터:', receiptData);
      // const res = await axiosInstance.post(`${API_PATHS.RECEIPT}/create`, receiptData);
      // return res.data;
    } catch (error: any) {
      console.error('❌ Error creating receipt:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  }
};


export default receipApi; 