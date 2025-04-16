import express from 'express';
import { body, param, query } from 'express-validator';
import * as receiptController from '../controllers/receiptController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validation middleware
const receiptIdValidation = [
  param('id').isMongoId().withMessage('Invalid receipt ID'),
  validateRequest
];

const churchIdValidation = [
  param('mainId').matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
  param('subId').matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
  validateRequest
];

const receiptDataValidation = [
  body('churchId.mainId').matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
  body('churchId.subId').matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
  body('eventId').notEmpty().isString().withMessage('Event ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
  body('paymentMethod').isIn(['card', 'bank', 'cash']).withMessage('Invalid payment method'),
  body('paymentStatus').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid payment status'),
  validateRequest
];

const queryValidation = [
  query('churchMainId').optional().matches(/^\d{4}$/).withMessage('Main ID must be a 4-digit number'),
  query('churchSubId').optional().matches(/^[a-z]$/).withMessage('Sub ID must be a single lowercase letter'),
  query('eventId').optional().isString(),
  query('status').optional().isIn(['pending', 'completed', 'cancelled']).withMessage('Invalid status'),
  validateRequest
];

// Routes
router.get('/', queryValidation, receiptController.getAllReceipts);
router.get('/:id', receiptIdValidation, receiptController.getReceiptById);
router.post('/', receiptDataValidation, receiptController.createReceipt);
router.put('/:id', [...receiptIdValidation, ...receiptDataValidation], receiptController.updateReceipt);
router.delete('/:id', receiptIdValidation, receiptController.deleteReceipt);

// Church and Event specific routes
router.get('/church/:mainId/:subId', churchIdValidation, receiptController.getChurchReceipts);
router.get('/event/:eventId', param('eventId').notEmpty(), receiptController.getEventReceipts);

// GET /api/receipts
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Receipts list endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

export { router as receiptRoutes }; 