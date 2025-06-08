"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventFromSample = exports.getSampleEvents = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getAllEvents = void 0;
const Event_1 = require("../models/Event");
const SampleEvent_1 = require("../models/SampleEvent");
// 이벤트 목록 조회 (연도별, 공개/비공개 필터링 지원)
const getAllEvents = async (req, res) => {
    try {
        const { year, isPublic } = req.query;
        const query = {};
        if (year) {
            query.eventYear = parseInt(year);
        }
        if (isPublic !== undefined) {
            query.isPublic = isPublic === 'true';
        }
        const events = await Event_1.Event.find(query).sort({ eventDate: 1 });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching events', error });
    }
};
exports.getAllEvents = getAllEvents;
// 단일 이벤트 조회
const getEventById = async (req, res) => {
    try {
        const event = await Event_1.Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching event', error });
    }
};
exports.getEventById = getEventById;
// 이벤트 생성
const createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            eventYear: new Date(req.body.eventDate).getFullYear()
        };
        const event = new Event_1.Event(eventData);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating event', error });
    }
};
exports.createEvent = createEvent;
// 이벤트 수정
const updateEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            eventYear: new Date(req.body.eventDate).getFullYear()
        };
        const event = await Event_1.Event.findByIdAndUpdate(req.params.id, eventData, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating event', error });
    }
};
exports.updateEvent = updateEvent;
// 이벤트 삭제
const deleteEvent = async (req, res) => {
    try {
        const event = await Event_1.Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting event', error });
    }
};
exports.deleteEvent = deleteEvent;
// 샘플 이벤트 목록 조회
const getSampleEvents = async (req, res) => {
    try {
        const sampleEvents = await SampleEvent_1.SampleEvent.find({ isOpenAvailable: true });
        res.json(sampleEvents);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching sample events', error });
    }
};
exports.getSampleEvents = getSampleEvents;
// 샘플 이벤트를 실제 이벤트로 복사
const createEventFromSample = async (req, res) => {
    try {
        const { sampleEventId } = req.params;
        const sampleEvent = await SampleEvent_1.SampleEvent.findById(sampleEventId);
        if (!sampleEvent) {
            return res.status(404).json({ message: 'Sample event not found' });
        }
        if (!sampleEvent.isOpenAvailable) {
            return res.status(400).json({ message: 'This sample event is not available for use' });
        }
        const eventData = {
            ...sampleEvent.toObject(),
            _id: undefined,
            eventYear: new Date().getFullYear(),
            eventDate: new Date(),
            registrationStartDate: new Date(),
            registrationEndDate: new Date(),
            eventStartDate: new Date(),
            eventEndDate: new Date()
        };
        const newEvent = new Event_1.Event(eventData);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating event from sample', error });
    }
};
exports.createEventFromSample = createEventFromSample;
