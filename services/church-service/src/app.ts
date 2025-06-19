import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import churchRoutes from './routes/churchRoutes';
import { Request, Response } from 'express';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// CORS 설정
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? ['http://localhost:3000']
  : ['http://182.231.199.64:3000', 'http://localhost:3000', 'http://awanaevent.com', 'https://awanaevent.com'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/churches', churchRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Church Service is running' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/awana';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Add text search index to Church model
mongoose.connection.once('open', async () => {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error('Database connection not initialized');
      return;
    }
    
    const collection = mongoose.connection.db.collection('churches');
    
    // Drop existing text indexes
    const indexes = await collection.indexes();
    const textIndexes = indexes.filter(index => index.key._fts === 'text');
    for (const index of textIndexes) {
      if (index.name) {
        await collection.dropIndex(index.name);
      }
    }
    
    // Create new text index
    await collection.createIndex(
      { name: 'text', location: 'text' },
      { background: true }
    );
    console.log('Text search index created for churches collection');
  } catch (error) {
    console.error('Error handling text search index:', error);
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app; 