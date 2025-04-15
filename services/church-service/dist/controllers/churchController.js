"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerForEvent = exports.getChurchEventHistory = exports.deleteChurch = exports.updateChurch = exports.createChurch = exports.getChurchById = exports.getAllChurches = void 0;
const Church_1 = require("../models/Church");
const ChurchEventParticipation_1 = require("../models/ChurchEventParticipation");
// 교회 목록 조회
const getAllChurches = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = { $text: { $search: search } };
        }
        const churches = await Church_1.Church.find(query).sort({ mainId: 1, subId: 1 });
        res.json(churches);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching churches', error });
    }
};
exports.getAllChurches = getAllChurches;
// 교회 상세 정보 조회
const getChurchById = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const church = await Church_1.Church.findOne({ mainId, subId });
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }
        res.json(church);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching church', error });
    }
};
exports.getChurchById = getChurchById;
// 교회 등록
const createChurch = async (req, res) => {
    try {
        const { mainId, subId, name, location } = req.body;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const existingChurch = await Church_1.Church.findOne({ mainId, subId });
        if (existingChurch) {
            return res.status(400).json({ message: 'Church with this ID already exists' });
        }
        const church = new Church_1.Church({ mainId, subId, name, location });
        const savedChurch = await church.save();
        res.status(201).json(savedChurch);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating church', error });
    }
};
exports.createChurch = createChurch;
// 교회 정보 수정
const updateChurch = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const { name, location } = req.body;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const church = await Church_1.Church.findOneAndUpdate({ mainId, subId }, { name, location }, { new: true, runValidators: true });
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }
        res.json(church);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating church', error });
    }
};
exports.updateChurch = updateChurch;
// 교회 삭제
const deleteChurch = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const church = await Church_1.Church.findOneAndDelete({ mainId, subId });
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }
        // 관련된 이벤트 참가 이력도 삭제
        await ChurchEventParticipation_1.ChurchEventParticipation.deleteMany({ 'churchId.mainId': mainId, 'churchId.subId': subId });
        res.json({ message: 'Church deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting church', error });
    }
};
exports.deleteChurch = deleteChurch;
// 교회의 이벤트 참가 이력 조회
const getChurchEventHistory = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const history = await ChurchEventParticipation_1.ChurchEventParticipation.find({
            'churchId.mainId': mainId,
            'churchId.subId': subId
        }).sort({ registrationDate: -1 });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching church event history', error });
    }
};
exports.getChurchEventHistory = getChurchEventHistory;
// 이벤트 참가 등록
const registerForEvent = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const { eventId, participantCount, totalAmount } = req.body;
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({ message: 'Invalid church ID format' });
        }
        const church = await Church_1.Church.findOne({ mainId, subId });
        if (!church) {
            return res.status(404).json({ message: 'Church not found' });
        }
        const participation = new ChurchEventParticipation_1.ChurchEventParticipation({
            churchId: { mainId, subId },
            eventId,
            participantCount,
            totalAmount,
            registrationDate: new Date()
        });
        const savedParticipation = await participation.save();
        res.status(201).json(savedParticipation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering for event', error });
    }
};
exports.registerForEvent = registerForEvent;
