"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventYear: {
        type: Number,
        required: true
    },
    eventLocation: {
        type: String,
        required: true,
        trim: true
    },
    eventPlace: {
        type: String,
        required: true,
        trim: true
    },
    registrationStartDate: {
        type: Date,
        required: true
    },
    registrationEndDate: {
        type: Date,
        required: true
    },
    eventStartDate: {
        type: Date,
        required: true
    },
    eventEndDate: {
        type: Date,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: 1
    },
    registrationFee: {
        type: Number,
        required: true,
        min: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// 연도별 이벤트 조회를 위한 인덱스
eventSchema.index({ eventYear: 1 });
// 공개/비공개 이벤트 조회를 위한 복합 인덱스
eventSchema.index({ isPublic: 1, eventDate: 1 });
exports.Event = (0, mongoose_1.model)('Event', eventSchema);
