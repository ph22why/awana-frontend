"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Church_1 = require("../models/Church");
const validateRequest_1 = require("../middleware/validateRequest");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// 교회 목록 조회
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('search').optional().isString(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } },
                    { mainId: { $regex: search, $options: 'i' } }
                ]
            }
            : {};
        const [churches, total] = await Promise.all([
            Church_1.Church.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ mainId: 1, subId: 1 }),
            Church_1.Church.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: {
                churches,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching churches:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// 교회 상세 조회
router.get('/:mainId/:subId', async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const church = await Church_1.Church.findOne({ mainId, subId });
        if (!church) {
            return res.status(404).json({
                success: false,
                error: 'Church not found'
            });
        }
        res.json({
            success: true,
            data: church
        });
    }
    catch (error) {
        console.error('Error fetching church:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// 교회 추가
router.post('/', [
    (0, express_validator_1.body)('mainId').isString().matches(/^\d{4}$/),
    (0, express_validator_1.body)('subId').isString().matches(/^[a-z]$/),
    (0, express_validator_1.body)('name').isString().trim().notEmpty(),
    (0, express_validator_1.body)('location').isString().trim().notEmpty(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const church = new Church_1.Church(req.body);
        await church.save();
        res.status(201).json({
            success: true,
            data: church
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Church with this ID already exists'
            });
        }
        console.error('Error creating church:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// 교회 수정
router.put('/:mainId/:subId', [
    (0, express_validator_1.body)('name').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('location').optional().isString().trim().notEmpty(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const church = await Church_1.Church.findOneAndUpdate({ mainId, subId }, { $set: req.body }, { new: true });
        if (!church) {
            return res.status(404).json({
                success: false,
                error: 'Church not found'
            });
        }
        res.json({
            success: true,
            data: church
        });
    }
    catch (error) {
        console.error('Error updating church:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// 교회 삭제
router.delete('/:mainId/:subId', async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const church = await Church_1.Church.findOneAndDelete({ mainId, subId });
        if (!church) {
            return res.status(404).json({
                success: false,
                error: 'Church not found'
            });
        }
        res.json({
            success: true,
            message: 'Church deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting church:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
