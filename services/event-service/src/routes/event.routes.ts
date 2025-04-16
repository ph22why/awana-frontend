import { Router } from 'express';
import { createEvent, getSampleEvents, getEvents, updateEvent, deleteEvent } from '../controllers/event.controller';

const router = Router();

// 이벤트 목록 조회
router.get('/', getEvents);

// 이벤트 생성
router.post('/', createEvent);

// 이벤트 수정
router.put('/:id', updateEvent);

// 이벤트 삭제
router.delete('/:id', deleteEvent);

// 샘플 이벤트 목록 조회
router.get('/samples', getSampleEvents);

export default router; 