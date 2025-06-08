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
exports.eventRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const eventController = __importStar(require("../controllers/eventController"));
const validateRequest_1 = require("../middleware/validateRequest");
const router = (0, express_1.Router)();
exports.eventRoutes = router;
// Validation middleware
const eventValidation = [
    (0, express_validator_1.body)('eventName').notEmpty().trim().isString(),
    (0, express_validator_1.body)('eventDate').isISO8601().toDate(),
    (0, express_validator_1.body)('eventLocation').notEmpty().trim().isString(),
    (0, express_validator_1.body)('eventPlace').notEmpty().trim().isString(),
    (0, express_validator_1.body)('registrationStartDate').isISO8601().toDate(),
    (0, express_validator_1.body)('registrationEndDate').isISO8601().toDate(),
    (0, express_validator_1.body)('eventStartDate').isISO8601().toDate(),
    (0, express_validator_1.body)('eventEndDate').isISO8601().toDate(),
    (0, express_validator_1.body)('maxParticipants').isInt({ min: 1 }),
    (0, express_validator_1.body)('registrationFee').isFloat({ min: 0 }),
    (0, express_validator_1.body)('isPublic').optional().isBoolean(),
    validateRequest_1.validateRequest
];
const queryValidation = [
    (0, express_validator_1.query)('year').optional().isInt({ min: 1900, max: 9999 }),
    (0, express_validator_1.query)('isPublic').optional().isBoolean(),
    validateRequest_1.validateRequest
];
// Event routes
router.get('/', queryValidation, eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventValidation, eventController.createEvent);
router.put('/:id', eventValidation, eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
// Sample event routes
router.get('/samples/list', eventController.getSampleEvents);
router.post('/samples/:sampleEventId/create', eventController.createEventFromSample);
