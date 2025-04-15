import express from 'express';
import mongoose from 'mongoose';
import { receiptRoutes } from './routes/receiptRoutes';

const app = express();
const port = process.env.PORT || 3002;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/receipt-service';

// Middleware
app.use(express.json());

// Routes
app.use('/api/receipts', receiptRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// MongoDB 연결
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Receipt service is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }); 