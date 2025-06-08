"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleEvent = void 0;
const mongoose_1 = require("mongoose");
const sampleEventSchema = new mongoose_1.Schema({
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
    },
    isOpenAvailable: {
        type: Boolean,
        default: true
    },
    eventMonth: {
        type: String,
        required: true,
        enum: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월', '미정']
    }
}, {
    timestamps: true
});
// 공개 가능한 샘플 이벤트 조회를 위한 인덱스
sampleEventSchema.index({ isOpenAvailable: 1 });
// 월별 조회를 위한 인덱스
sampleEventSchema.index({ eventMonth: 1 });
exports.SampleEvent = (0, mongoose_1.model)('SampleEvent', sampleEventSchema);
