import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { receiptRoutes } from './routes/receiptRoutes';

const app = express();
const port = process.env.PORT || 3002;

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
    
    // lovable.app 서브도메인 허용
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

app.use(express.json());

// Routes
app.use('/api/receipts', receiptRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receipt-service';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((error) => console.error('MongoDB 연결 실패:', error));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Receipt Service is running' });
});

app.listen(port, () => {
  console.log(`Receipt Service가 포트 ${port}에서 실행 중입니다.`);
}); 