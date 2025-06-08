"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Church = void 0;
const mongoose_1 = require("mongoose");
const churchSchema = new mongoose_1.Schema({
    mainId: {
        type: String,
        required: true,
        trim: true
    },
    subId: {
        type: String,
        required: true,
        trim: true,
        default: 'a'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});
// 교회 ID로 조회하기 위한 복합 인덱스
churchSchema.index({ mainId: 1, subId: 1 }, { unique: true });
// 가상 필드: 전체 교회 ID
churchSchema.virtual('fullId').get(function () {
    return `${this.mainId}-${this.subId}`;
});
// 교회 ID 검증을 위한 정적 메서드
churchSchema.statics.validateChurchId = function (mainId, subId) {
    const mainIdPattern = /^\d{4}$/;
    const subIdPattern = /^[a-z]$/;
    return mainIdPattern.test(mainId) && subIdPattern.test(subId);
};
exports.Church = (0, mongoose_1.model)('Church', churchSchema);
