import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import eventRoutes from './routes/event.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupLogging } from './utils/logging';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS 설정
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? ['http://localhost:3000']
  : ['http://182.231.199.64:3000', 'http://localhost:3000', 'http://awanaevent.com', 'https://awanaevent.com'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
setupLogging(app);

// Routes
app.use('/api/events', eventRoutes);

// 기본 라우트 (테스트용)
app.get('/', (req, res) => {
  res.json({ message: 'Event Service is running' });
});

// API 테스트 라우트
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling
app.use(errorHandler);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/awana';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((error: Error) => console.error('MongoDB 연결 실패:', error));

app.listen(port, () => {
  console.log(`Event Service가 포트 ${port}에서 실행 중입니다.`);
  console.log(`개발 환경 API 엔드포인트: http://localhost:${port}/api/events`);
  console.log(`프로덕션 환경 API 엔드포인트: http://182.231.199.64:${port}/api/events`);
}); 