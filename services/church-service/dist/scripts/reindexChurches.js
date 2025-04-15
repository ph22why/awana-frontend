"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Church_1 = require("../models/Church");
async function reindexChurches() {
    try {
        // MongoDB 연결
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/church-service');
        console.log('Connected to MongoDB');
        // 기존 인덱스 삭제
        const collection = mongoose_1.default.connection.collection('churches');
        const indexes = await collection.indexes();
        for (const index of indexes) {
            if (index.name !== '_id_') { // _id 인덱스는 유지
                await collection.dropIndex(index.name);
            }
        }
        console.log('Dropped existing indexes');
        // 새 인덱스 생성
        await Church_1.Church.createIndexes();
        console.log('Created new indexes');
        // 생성된 인덱스 확인
        const newIndexes = await collection.indexes();
        console.log('Current indexes:', newIndexes);
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error reindexing churches:', error);
        process.exit(1);
    }
}
// 스크립트 실행
reindexChurches();
