import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { eventRoutes } from './routes/eventRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setupLogging } from './utils/logging';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
setupLogging(app);

// Routes
app.use('/api/events', eventRoutes);

// Error handling
app.use(errorHandler);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/event-service';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((error) => console.error('MongoDB 연결 실패:', error));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Event Service is running' });
});

app.listen(port, () => {
  console.log(`Event Service가 포트 ${port}에서 실행 중입니다.`);
}); 