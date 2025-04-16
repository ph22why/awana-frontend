import { Router } from 'express';
import {
  createChurch,
  getChurch,
  updateChurch,
  deleteChurch,
  getAllChurches,
  searchChurches
} from '../controllers/churchController';

const router = Router();

// 교회 생성
router.post('/', createChurch);

// 모든 교회 조회
router.get('/', getAllChurches);

// 교회 검색
router.get('/search', searchChurches);

// 특정 교회 조회
router.get('/:mainId/:subId', getChurch);

// 교회 정보 수정
router.put('/:mainId/:subId', updateChurch);

// 교회 삭제
router.delete('/:mainId/:subId', deleteChurch);

export default router; 