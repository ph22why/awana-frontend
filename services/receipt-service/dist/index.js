"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const receiptRoutes_1 = require("./routes/receiptRoutes");
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/receipt-service';
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/receipts', receiptRoutes_1.receiptRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// MongoDB 연결
mongoose_1.default.connect(mongoUri)
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
