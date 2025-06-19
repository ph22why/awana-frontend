import axios from 'axios';
import { EventFormData, SampleEvent } from '../../types/event';

const isDevelopment = process.env.NODE_ENV === 'development';

// Alternative approach: Use relative paths when possible
const BASE_URL = isDevelopment 
  ? `http://localhost:${process.env.NEXT_PUBLIC_EVENT_SERVICE_PORT || '3001'}`
  : ''; // Empty string for relative paths in production

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: isDevelopment ? `${BASE_URL}/api/events` : '/api/events',
  timeout: 10000,
  withCredentials: false, // Set to false for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// This approach requires nginx proxy setup to forward /api/events/* to backend
// For now, use the direct IP approach with CORS fix 