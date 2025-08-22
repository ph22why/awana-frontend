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
  // 새로운 키 관리 컨트롤러
  generateKeysForChurch,
  getKeysByChurchManager,
  assignKeyToTeacher,
  useKey,
  // 새로운 출결 관리 컨트롤러
  checkInWithQR,
  getAttendanceRecords,
  getAttendanceStatistics,
} from '../controllers/btController';
import {
  createBTSession,
  getBTSessions,
  getBTSessionById,
  getBTSessionBySessionId,
  updateBTSession,
  deleteBTSession,
  updateBTSessionStatus,
  getBTSessionAttendanceStats,
} from '../controllers/sessionController';
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

// ===== 키 관리 라우트 =====
router.post('/keys/generate', generateKeysForChurch);
router.get('/keys/church-manager/:churchManagerId', getKeysByChurchManager);
router.post('/keys/assign', assignKeyToTeacher);
router.post('/keys/use', useKey);

// ===== 세션 관리 라우트 =====
router.post('/sessions', createBTSession);
router.get('/sessions', getBTSessions);
router.get('/sessions/:id', getBTSessionById);
router.get('/sessions/session/:sessionId', getBTSessionBySessionId);
router.put('/sessions/:id', updateBTSession);
router.delete('/sessions/:id', deleteBTSession);
router.patch('/sessions/:id/status', updateBTSessionStatus);
router.get('/sessions/session/:sessionId/attendance', getBTSessionAttendanceStats);

// ===== 출결 관리 라우트 =====
router.post('/attendance/checkin', checkInWithQR);
router.get('/attendance/records', getAttendanceRecords);
router.get('/attendance/statistics', getAttendanceStatistics);

// Statistics
router.get('/statistics', getBTStatistics);

export default router;
