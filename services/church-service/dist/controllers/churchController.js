"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerForEvent = exports.getChurchEventHistory = exports.searchChurches = exports.deleteChurch = exports.updateChurch = exports.getChurch = exports.getAllChurches = exports.createChurch = void 0;
const Church_1 = require("../models/Church");
const ChurchEventParticipation_1 = require("../models/ChurchEventParticipation");
// 교회 생성
const createChurch = async (req, res) => {
    try {
        const { mainId, subId, name, location } = req.body;
        // 교회 ID 유효성 검사
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({
                success: false,
                message: '잘못된 교회 ID 형식입니다. mainId는 4자리 숫자, subId는 1자리 알파벳이어야 합니다.'
            });
        }
        const church = new Church_1.Church({
            mainId,
            subId,
            name,
            location
        });
        await church.save();
        res.status(201).json({
            success: true,
            data: church
        });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: '이미 존재하는 교회 ID입니다.'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: '교회 생성 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }
};
exports.createChurch = createChurch;
// 모든 교회 조회
const getAllChurches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: new RegExp(search, 'i') },
                    { location: new RegExp(search, 'i') },
                    { mainId: new RegExp(search, 'i') }
                ]
            };
        }
        const total = await Church_1.Church.countDocuments(query);
        const churches = await Church_1.Church.find(query)
            .sort({ mainId: 1, subId: 1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            success: true,
            count: total,
            data: churches
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '교회 목록 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
exports.getAllChurches = getAllChurches;
// 특정 교회 조회
const getChurch = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        // 교회 ID 유효성 검사
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({
                success: false,
                message: '잘못된 교회 ID 형식입니다.'
            });
        }
        const church = await Church_1.Church.findOne({ mainId, subId });
        if (!church) {
            return res.status(404).json({
                success: false,
                message: '해당 교회를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            data: church
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '교회 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
exports.getChurch = getChurch;
// 교회 정보 수정
const updateChurch = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const { name, location } = req.body;
        // 교회 ID 유효성 검사
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({
                success: false,
                message: '잘못된 교회 ID 형식입니다.'
            });
        }
        const church = await Church_1.Church.findOneAndUpdate({ mainId, subId }, { name, location }, { new: true, runValidators: true });
        if (!church) {
            return res.status(404).json({
                success: false,
                message: '해당 교회를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            data: church
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '교회 정보 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
exports.updateChurch = updateChurch;
// 교회 삭제
const deleteChurch = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        // 교회 ID 유효성 검사
        if (!Church_1.Church.validateChurchId(mainId, subId)) {
            return res.status(400).json({
                success: false,
                message: '잘못된 교회 ID 형식입니다.'
            });
        }
        const church = await Church_1.Church.findOneAndDelete({ mainId, subId });
        if (!church) {
            return res.status(404).json({
                success: false,
                message: '해당 교회를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            success: true,
            message: '교회가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '교회 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
exports.deleteChurch = deleteChurch;
// 교회 검색
const searchChurches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const searchQuery = {};
        // Handle different search parameters
        if (req.query.mainId) {
            searchQuery.mainId = req.query.mainId;
        }
        else if (req.query.name) {
            searchQuery.name = new RegExp(String(req.query.name), 'i');
        }
        else if (req.query.location) {
            searchQuery.location = new RegExp(String(req.query.location), 'i');
        }
        else if (req.query.query) {
            // General search across multiple fields
            const searchRegex = new RegExp(String(req.query.query), 'i');
            searchQuery.$or = [
                { name: searchRegex },
                { location: searchRegex },
                { mainId: searchRegex }
            ];
        }
        // Get total count for pagination
        const total = await Church_1.Church.countDocuments(searchQuery);
        // Get results - either paginated or all
        const query = Church_1.Church.find(searchQuery).sort({ mainId: 1, subId: 1 });
        // Apply pagination only if limit is less than total (to support getting all results)
        if (limit < total) {
            query.skip(skip).limit(limit);
        }
        const churches = await query;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            data: churches,
            pagination: {
                total,
                page,
                limit,
                totalPages
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: '교회 검색 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};
exports.searchChurches = searchChurches;
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
