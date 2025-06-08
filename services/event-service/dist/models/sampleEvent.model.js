"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialSampleEvents = exports.SampleEvent = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SampleEventSchema = new mongoose_1.Schema({
    sampleEvent_ID: { type: Number, required: true, unique: true },
    sampleEvent_Name: { type: String, required: true },
    sampleEvent_Location: { type: String, required: true },
    sampleEvent_Year: { type: String, default: "미정" },
    sampleEvent_Start_Date: { type: String, default: null },
    sampleEvent_End_Date: { type: String, default: null },
    sampleEvent_Registration_Start_Date: { type: String, default: null },
    sampleEvent_Registration_End_Date: { type: String, default: null },
    sampleEvent_Open_Available: { type: String, enum: ['공개', '비공개'], default: '비공개' },
    sampleEvent_Place: { type: String, required: true },
    sampleEvent_Month: { type: String, default: "미정" }
});
exports.SampleEvent = mongoose_1.default.model('SampleEvent', SampleEventSchema);
// 초기 샘플 데이터
exports.initialSampleEvents = [
    {
        sampleEvent_ID: 1,
        sampleEvent_Name: "성경퀴즈대회",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "1월"
    },
    {
        sampleEvent_ID: 2,
        sampleEvent_Name: "YM Summit",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "1월"
    },
    {
        sampleEvent_ID: 3,
        sampleEvent_Name: "상반기 연합 BT",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "2월"
    },
    {
        sampleEvent_ID: 4,
        sampleEvent_Name: "컨퍼런스",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "3월"
    },
    {
        sampleEvent_ID: 5,
        sampleEvent_Name: "올림픽 설명회",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "4월"
    },
    {
        sampleEvent_ID: 6,
        sampleEvent_Name: "올림픽",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "5월"
    },
    {
        sampleEvent_ID: 7,
        sampleEvent_Name: "조정관 학교 101",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "6월"
    },
    {
        sampleEvent_ID: 8,
        sampleEvent_Name: "조정관 학교 201",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "6월"
    },
    {
        sampleEvent_ID: 9,
        sampleEvent_Name: "T&T Camp",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "7월"
    },
    {
        sampleEvent_ID: 10,
        sampleEvent_Name: "감독관 학교 101",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "8월"
    },
    {
        sampleEvent_ID: 11,
        sampleEvent_Name: "YM MIT",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "8월"
    },
    {
        sampleEvent_ID: 12,
        sampleEvent_Name: "하반기 연합 BT",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "9월"
    },
    {
        sampleEvent_ID: 13,
        sampleEvent_Name: "영성수련회",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "10월"
    },
    {
        sampleEvent_ID: 14,
        sampleEvent_Name: "성경퀴즈대회 설명회",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "11월"
    },
    {
        sampleEvent_ID: 15,
        sampleEvent_Name: "비전캠프",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "12월"
    },
    {
        sampleEvent_ID: 16,
        sampleEvent_Name: "장학캠프",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "미정"
    },
    {
        sampleEvent_ID: 17,
        sampleEvent_Name: "수시 BT",
        sampleEvent_Location: "미정",
        sampleEvent_Year: "미정",
        sampleEvent_Start_Date: null,
        sampleEvent_End_Date: null,
        sampleEvent_Registration_Start_Date: null,
        sampleEvent_Registration_End_Date: null,
        sampleEvent_Open_Available: "비공개",
        sampleEvent_Place: "미정",
        sampleEvent_Month: "미정"
    }
];
