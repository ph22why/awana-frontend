import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import eventRoutes from './routes/event.routes';
import eventGroupRoutes from './routes/eventGroup.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupLogging } from './utils/logging';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS 설정
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? ['http://localhost:3000']
  : ['http://112.145.65.29:3000', 'http://localhost:3000', 'http://awanaevent.com', 'https://awanaevent.com'];

app.use(cors({
  origin: function (origin, callback) {
    // origin이 없으면 (예: 모바일 앱, Postman) 허용
    if (!origin) return callback(null, true);
    
    // 디버깅 로그
    console.log('CORS check for origin:', origin);
    
    // lovable.dev 허용
    if (origin === 'https://lovable.dev') {
      console.log('Allowed: lovable.dev');
      return callback(null, true);
    }
    
    // lovable.app 서브도메인 허용 (https:// 로 시작하는 경우)
    if (origin.includes('.lovable.app')) {
      console.log('Allowed: lovable.app subdomain');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Allowed: in allowedOrigins list');
      callback(null, true);
    } else {
      console.log('Blocked: not in allowedOrigins list');
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
setupLogging(app);

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/event-groups', eventGroupRoutes);

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
  .catch((error: Error) => console.error('MongoDB 연결 실패:', error));

app.listen(port, () => {
  console.log(`Event Service가 포트 ${port}에서 실행 중입니다.`);
  console.log(`개발 환경 API 엔드포인트: http://localhost:${port}/api/events`);
  console.log(`프로덕션 환경 API 엔드포인트: http://112.145.65.29:${port}/api/events`);
}); 