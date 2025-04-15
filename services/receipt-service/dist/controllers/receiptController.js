"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventReceipts = exports.getChurchReceipts = exports.deleteReceipt = exports.updateReceipt = exports.createReceipt = exports.getReceiptById = exports.getAllReceipts = void 0;
const Receipt_1 = require("../models/Receipt");
// 영수증 목록 조회
const getAllReceipts = async (req, res) => {
    try {
        const { churchMainId, churchSubId, eventId, status } = req.query;
        let query = {};
        if (churchMainId && churchSubId) {
            query['churchId.mainId'] = churchMainId;
            query['churchId.subId'] = churchSubId;
        }
        if (eventId) {
            query.eventId = eventId;
        }
        if (status) {
            query.paymentStatus = status;
        }
        const receipts = await Receipt_1.Receipt.find(query).sort({ createdAt: -1 });
        res.json(receipts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching receipts', error });
    }
};
exports.getAllReceipts = getAllReceipts;
// 영수증 상세 조회
const getReceiptById = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await Receipt_1.Receipt.findById(id);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.json(receipt);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching receipt', error });
    }
};
exports.getReceiptById = getReceiptById;
// 영수증 생성
const createReceipt = async (req, res) => {
    try {
        const receiptData = req.body;
        const receipt = new Receipt_1.Receipt(receiptData);
        const savedReceipt = await receipt.save();
        res.status(201).json(savedReceipt);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating receipt', error });
    }
};
exports.createReceipt = createReceipt;
// 영수증 수정
const updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const receipt = await Receipt_1.Receipt.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.json(receipt);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating receipt', error });
    }
};
exports.updateReceipt = updateReceipt;
// 영수증 삭제
const deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await Receipt_1.Receipt.findByIdAndDelete(id);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.json({ message: 'Receipt deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting receipt', error });
    }
};
exports.deleteReceipt = deleteReceipt;
// 교회별 영수증 조회
const getChurchReceipts = async (req, res) => {
    try {
        const { mainId, subId } = req.params;
        const receipts = await Receipt_1.Receipt.find({
            'churchId.mainId': mainId,
            'churchId.subId': subId
        }).sort({ createdAt: -1 });
        res.json(receipts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching church receipts', error });
    }
};
exports.getChurchReceipts = getChurchReceipts;
// 이벤트별 영수증 조회
const getEventReceipts = async (req, res) => {
    try {
        const { eventId } = req.params;
        const receipts = await Receipt_1.Receipt.find({ eventId }).sort({ createdAt: -1 });
        res.json(receipts);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching event receipts', error });
    }
};
exports.getEventReceipts = getEventReceipts;
