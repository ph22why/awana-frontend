"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const churchRoutes_1 = __importDefault(require("./routes/churchRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)()); // 모든 도메인에서의 요청 허용
app.use(express_1.default.json());
// Routes
app.use('/api/churches', churchRoutes_1.default);
// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'Church Service is running' });
});
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/church-service';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
// Add text search index to Church model
mongoose_1.default.connection.once('open', async () => {
    try {
        if (!mongoose_1.default.connection || !mongoose_1.default.connection.db) {
            console.error('Database connection not initialized');
            return;
        }
        const collection = mongoose_1.default.connection.db.collection('churches');
        // Drop existing text indexes
        const indexes = await collection.indexes();
        const textIndexes = indexes.filter(index => index.key._fts === 'text');
        for (const index of textIndexes) {
            if (index.name) {
                await collection.dropIndex(index.name);
            }
        }
        // Create new text index
        await collection.createIndex({ name: 'text', location: 'text' }, { background: true });
        console.log('Text search index created for churches collection');
    }
    catch (error) {
        console.error('Error handling text search index:', error);
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
exports.default = app;
