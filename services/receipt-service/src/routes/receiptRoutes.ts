import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as receiptController from '../controllers/receiptController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation middleware
const receiptIdValidation = [
  param('id').isMongoId().withMessage('Invalid receipt ID'),
  validateRequest
];

const churchIdValidation = [
  param('mainId').matches(/^\d{4}$/).withMessage('교회등록번호는 4자리 숫자여야 합니다'),
  param('subId').matches(/^[a-z]$/).withMessage('하위 ID는 소문자 알파벳 한 글자여야 합니다'),
  validateRequest
];

const receiptDataValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('이벤트 ID가 필요합니다'),
  body('churchId')
    .isObject()
    .withMessage('교회 ID 형식이 올바르지 않습니다'),
  body('churchId.mainId')
    .matches(/^\d{4}$/)
    .withMessage('교회등록번호는 4자리 숫자여야 합니다'),
  body('churchId.subId')
    .matches(/^[a-z]$/)
    .withMessage('하위 ID는 소문자 알파벳 한 글자여야 합니다'),
  body('churchName')
    .notEmpty()
    .withMessage('교회명이 필요합니다'),
  body('managerName')
    .notEmpty()
    .withMessage('담당자 이름이 필요합니다'),
  body('managerPhone')
    .notEmpty()
    .withMessage('담당자 전화번호가 필요합니다')
    .matches(/^\d{3}-\d{3,4}-\d{4}$/)
    .withMessage('전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'),
  body('partTotal')
    .isInt({ min: 0 })
    .withMessage('전체 참가자 수는 0 이상이어야 합니다'),
  body('partStudent')
    .isInt({ min: 0 })
    .withMessage('학생 참가자 수는 0 이상이어야 합니다'),
  body('partTeacher')
    .isInt({ min: 0 })
    .withMessage('선생님 참가자 수는 0 이상이어야 합니다'),
  body('partYM')
    .isInt({ min: 0 })
    .withMessage('YM 참가자 수는 0 이상이어야 합니다'),
  body('costs')
    .isInt({ min: 0 })
    .withMessage('비용은 0 이상이어야 합니다'),
  body('paymentMethod')
    .isIn(['card', 'bank', 'cash'])
    .withMessage('올바른 결제 방법을 선택해주세요'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('올바른 결제 상태를 선택해주세요'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('올바른 날짜 형식이 아닙니다'),
  body(['partStudent', 'partTeacher', 'partYM', 'partTotal']).custom((value, { req }) => {
    const total = Number(req.body.partTotal);
    const sum = Number(req.body.partStudent) + Number(req.body.partTeacher) + Number(req.body.partYM);
    if (sum > total) {
      throw new Error('개별 참가자 수의 합이 전체 참가자 수보다 클 수 없습니다');
    }
    return true;
  }),
  validateRequest
];

const queryValidation = [
  query('eventId').optional().notEmpty().withMessage('Event ID cannot be empty if provided'),
  query('churchId').optional().notEmpty().withMessage('Church ID cannot be empty if provided'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  validateRequest
];

// Routes
router.get('/', queryValidation, receiptController.getAllReceipts);
router.get('/:id', receiptIdValidation, receiptController.getReceiptById);
router.post('/', receiptDataValidation, receiptController.createReceipt);
router.put('/:id', receiptIdValidation, receiptDataValidation, receiptController.updateReceipt);
router.delete('/:id', receiptIdValidation, receiptController.deleteReceipt);

// Church and Event specific routes
router.get('/church/:mainId/:subId', churchIdValidation, receiptController.getChurchReceipts);
router.get('/event/:eventId', param('eventId').notEmpty(), receiptController.getEventReceipts);

// 교회 정보 조회
router.get('/church/:mainId', receiptController.getChurchByMainId);

// GET /api/receipts
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Receipts list endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

export { router as receiptRoutes }; 