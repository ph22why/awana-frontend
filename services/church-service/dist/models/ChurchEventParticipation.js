"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChurchEventParticipation = void 0;
const mongoose_1 = require("mongoose");
const churchEventParticipationSchema = new mongoose_1.Schema({
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
    participantCount: {
        type: Number,
        required: true,
        min: 1
    },
    registrationDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});
// 교회별 이벤트 참가 이력 조회를 위한 인덱스
churchEventParticipationSchema.index({ 'churchId.mainId': 1, 'churchId.subId': 1 });
// 이벤트별 참가 교회 조회를 위한 인덱스
churchEventParticipationSchema.index({ eventId: 1 });
// 결제 상태별 조회를 위한 인덱스
churchEventParticipationSchema.index({ paymentStatus: 1 });
exports.ChurchEventParticipation = (0, mongoose_1.model)('ChurchEventParticipation', churchEventParticipationSchema);
