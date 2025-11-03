import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import btRoutes from './routes/btRoutes';
import { errorHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validateRequest';

// 모델들을 import하여 MongoDB 스키마 등록
import './models/ChurchManager';
import './models/BTTeacher';
import './models/BTKey';
import './models/BTAttendance';
import './models/BTSession';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bt-service';

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // origin이 없으면 (예: 모바일 앱, Postman) 허용
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000']
      : ['http://localhost:3000', 'https://awanaevent.com'];
    
    // lovable.app 서브도메인 허용
    if (origin.endsWith('.lovable.app') || origin === 'https://lovable.dev') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'BT Service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/bt', btRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`BT Service running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

export default app;
