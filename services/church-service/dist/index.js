"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3003;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/church-service';
app_1.default.use(express_1.default.json());
// MongoDB 연결 설정
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('Successfully connected to MongoDB.');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error connecting to MongoDB:', error.message);
        }
        else {
            console.error('Unknown error connecting to MongoDB');
        }
        // 5초 후 재시도
        setTimeout(connectDB, 5000);
    }
};
// 초기 연결 시도
connectDB();
// MongoDB 연결 이벤트 리스너
mongoose_1.default.connection.on('disconnected', () => {
    console.log('Lost MongoDB connection. Retrying...');
    setTimeout(connectDB, 5000);
});
mongoose_1.default.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
// 기본 에러 핸들러
app_1.default.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
// Basic health check endpoint
app_1.default.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'church-service',
        mongodb: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});
// Church routes
app_1.default.get('/api/churches', async (req, res) => {
    try {
        // TODO: Implement church listing
        res.json({
            message: 'Church listing endpoint',
            mongoStatus: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    }
    catch (error) {
        console.error('Error in /api/churches:', error);
        res.status(500).json({ error: 'Failed to fetch churches' });
    }
});
const server = app_1.default.listen(PORT, () => {
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
