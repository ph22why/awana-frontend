import express from 'express';
import { Request, Response, NextFunction } from 'express';
import mongoose, { Error as MongooseError } from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 3003;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/awana';

app.use(express.json());

// MongoDB 연결 설정
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error connecting to MongoDB:', error.message);
    } else {
      console.error('Unknown error connecting to MongoDB');
    }
    // 5초 후 재시도
    setTimeout(connectDB, 5000);
  }
};

// 초기 연결 시도
connectDB();

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('disconnected', () => {
  console.log('Lost MongoDB connection. Retrying...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (error: MongooseError) => {
  console.error('MongoDB connection error:', error);
});

// 기본 에러 핸들러
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'church-service',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Church routes
app.get('/api/churches', async (req: Request, res: Response) => {
  try {
    // TODO: Implement church listing
    res.json({ 
      message: 'Church listing endpoint',
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('Error in /api/churches:', error);
    res.status(500).json({ error: 'Failed to fetch churches' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Church service is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}); 