import express from 'express';
import {
  createChurchManager,
  getChurchManagers,
  getChurchManagerById,
  updateChurchManagerStatus,
  createIndividualTeacher,
  getIndividualTeachers,
  getIndividualTeacherById,
  updateIndividualTeacherStatus,
  getBTReceipts,
  getBTReceiptById,
  getBTReceiptByChurchManager,
  searchChurches,
  createBTTeacher,
  getBTTeachers,
  getBTTeachersByChurchManager,
  updateBTTeacherStatus,
  getBTStatistics,
} from '../controllers/btController';
import { validateRequest } from '../middleware/validateRequest';
import { churchManagerSchema, individualTeacherSchema, statusUpdateSchema } from '../middleware/validation';

const router = express.Router();

// Church Manager routes
router.post('/church-managers', validateRequest(churchManagerSchema), createChurchManager);
router.get('/church-managers', getChurchManagers);
router.get('/church-managers/:id', getChurchManagerById);
router.patch('/church-managers/:id/status', validateRequest(statusUpdateSchema), updateChurchManagerStatus);

// Individual Teacher routes
router.post('/individual-teachers', validateRequest(individualTeacherSchema), createIndividualTeacher);
router.get('/individual-teachers', getIndividualTeachers);
router.get('/individual-teachers/:id', getIndividualTeacherById);
router.patch('/individual-teachers/:id/status', validateRequest(statusUpdateSchema), updateIndividualTeacherStatus);

// Church Integration routes
router.get('/churches/search', searchChurches);

// BT Receipt routes (receipt-service 연동)
router.get('/receipts', getBTReceipts);
router.get('/receipts/:id', getBTReceiptById);
router.get('/church-managers/:churchManagerId/receipts', getBTReceiptByChurchManager);

// BT Teacher routes
router.post('/teachers', createBTTeacher);
router.get('/teachers', getBTTeachers);
router.get('/church-managers/:churchManagerId/teachers', getBTTeachersByChurchManager);
router.patch('/teachers/:id/status', validateRequest(statusUpdateSchema), updateBTTeacherStatus);

// Statistics
router.get('/statistics', getBTStatistics);

export default router;
