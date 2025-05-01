"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = void 0;
const mongoose_1 = require("mongoose");
const receiptSchema = new mongoose_1.Schema({
    churchId: {
        mainId: {
            type: String,
            required: true,
            trim: true
        },
        subId: {
            type: String,
            required: true,
            trim: true
        }
    },
    eventId: {
        type: String,
        required: true
    },
    costs: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'bank', 'cash']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// 교회별 영수증 조회를 위한 인덱스
receiptSchema.index({ 'churchId.mainId': 1, 'churchId.subId': 1 });
// 이벤트별 영수증 조회를 위한 인덱스
receiptSchema.index({ eventId: 1 });
// 결제 상태별 조회를 위한 인덱스
receiptSchema.index({ paymentStatus: 1 });
exports.Receipt = (0, mongoose_1.model)('Receipt', receiptSchema);
