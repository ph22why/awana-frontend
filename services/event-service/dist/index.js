"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const logging_1 = require("./utils/logging");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// CORS 설정
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // 개발 환경에서만 localhost 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware
app.use(express_1.default.json());
(0, logging_1.setupLogging)(app);
// Routes
app.use('/api/events', event_routes_1.default);
// 기본 라우트 (테스트용)
app.get('/', (req, res) => {
    res.json({ message: 'Event Service is running' });
});
// API 테스트 라우트
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-service';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('MongoDB에 연결되었습니다.'))
    .catch((error) => console.error('MongoDB 연결 실패:', error));
app.listen(port, () => {
    console.log(`Event Service가 포트 ${port}에서 실행 중입니다.`);
    console.log(`개발 환경 API 엔드포인트: http://localhost:${port}/api/events`);
    console.log(`프로덕션 환경 API 엔드포인트: https://awanaevent.com:${port}/api/events`);
});
