import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { receiptRoutes } from './routes/receiptRoutes';

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
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