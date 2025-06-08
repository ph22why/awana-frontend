"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEvents = exports.getSampleEvents = exports.createEvent = void 0;
const event_model_1 = __importDefault(require("../models/event.model"));
const sampleEvent_model_1 = require("../models/sampleEvent.model");
const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        // 날짜 문자열을 Date 객체로 변환
        const dateFields = [
            'event_Start_Date',
            'event_End_Date',
            'event_Registration_Start_Date',
            'event_Registration_End_Date'
        ];
        dateFields.forEach(field => {
            if (eventData[field]) {
                eventData[field] = new Date(eventData[field]);
            }
        });
        const event = new event_model_1.default(eventData);
        await event.save();
        res.status(201).json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('이벤트 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '이벤트 생성 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
};
exports.createEvent = createEvent;
const getSampleEvents = async (req, res) => {
    try {
        // 샘플 이벤트 데이터가 있는지 확인
        let sampleEvents = await sampleEvent_model_1.SampleEvent.find();
        // 데이터가 없으면 초기 데이터 삽입
        if (sampleEvents.length === 0) {
            sampleEvents = await sampleEvent_model_1.SampleEvent.insertMany(sampleEvent_model_1.initialSampleEvents);
        }
        res.status(200).json(sampleEvents);
    }
    catch (error) {
        console.error('샘플 이벤트 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '샘플 이벤트 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
};
exports.getSampleEvents = getSampleEvents;
const getEvents = async (req, res) => {
    try {
        const events = await event_model_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    }
    catch (error) {
        console.error('이벤트 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '이벤트 목록 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
};
exports.getEvents = getEvents;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // 날짜 문자열을 Date 객체로 변환
        const dateFields = [
            'event_Start_Date',
            'event_End_Date',
            'event_Registration_Start_Date',
            'event_Registration_End_Date'
        ];
        dateFields.forEach(field => {
            if (updateData[field]) {
                updateData[field] = new Date(updateData[field]);
            }
        });
        const updatedEvent = await event_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: '해당 이벤트를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    }
    catch (error) {
        console.error('이벤트 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '이벤트 수정 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await event_model_1.default.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: '해당 이벤트를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            message: '이벤트가 성공적으로 삭제되었습니다.',
            data: deletedEvent
        });
    }
    catch (error) {
        console.error('이벤트 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '이벤트 삭제 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
};
exports.deleteEvent = deleteEvent;
