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
exports.receiptRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const receiptController = __importStar(require("../controllers/receiptController"));
const validateRequest_1 = require("../middleware/validateRequest");
const router = (0, express_1.Router)();
exports.receiptRoutes = router;
// Validation middleware
const receiptIdValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid receipt ID'),
    validateRequest_1.validateRequest
];
const churchIdValidation = [
    (0, express_validator_1.param)('mainId').matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
    (0, express_validator_1.param)('subId').matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
    validateRequest_1.validateRequest
];
const receiptDataValidation = [
    (0, express_validator_1.body)('churchId.mainId').matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
    (0, express_validator_1.body)('churchId.subId').matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
    (0, express_validator_1.body)('eventId').notEmpty().isString().withMessage('Event ID is required'),
    (0, express_validator_1.body)('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
    (0, express_validator_1.body)('paymentMethod').isIn(['card', 'bank', 'cash']).withMessage('Invalid payment method'),
    (0, express_validator_1.body)('paymentStatus').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid payment status'),
    validateRequest_1.validateRequest
];
const queryValidation = [
    (0, express_validator_1.query)('churchMainId').optional().matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
    (0, express_validator_1.query)('churchSubId').optional().matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
    (0, express_validator_1.query)('eventId').optional().isString(),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
    validateRequest_1.validateRequest
];
// Routes
router.get('/', queryValidation, receiptController.getAllReceipts);
router.get('/:id', receiptIdValidation, receiptController.getReceiptById);
router.post('/', receiptDataValidation, receiptController.createReceipt);
router.put('/:id', [...receiptIdValidation, ...receiptDataValidation], receiptController.updateReceipt);
router.delete('/:id', receiptIdValidation, receiptController.deleteReceipt);
// Church and Event specific routes
router.get('/church/:mainId/:subId', churchIdValidation, receiptController.getChurchReceipts);
router.get('/event/:eventId', (0, express_validator_1.param)('eventId').notEmpty(), receiptController.getEventReceipts);
