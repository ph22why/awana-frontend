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
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
setupLogging(app);

// Pre-flight 요청을 위한 OPTIONS 처리
app.options('*', cors(corsOptions));

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-service';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((error) => console.error('MongoDB 연결 실패:', error));

app.listen(port, () => {
  console.log(`Event Service가 포트 ${port}에서 실행 중입니다.`);
  console.log(`API 엔드포인트: http://localhost:${port}/api`);
  console.log('사용 가능한 라우트:');
  console.log('- GET /api/events/samples');
  console.log('- POST /api/events');
}); 