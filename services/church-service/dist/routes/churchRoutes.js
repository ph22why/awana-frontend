"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const churchController_1 = require("../controllers/churchController");
const router = (0, express_1.Router)();
// 교회 생성
router.post('/', churchController_1.createChurch);
// 모든 교회 조회
router.get('/', churchController_1.getAllChurches);
// 교회 검색
router.get('/search', churchController_1.searchChurches);
// 특정 교회 조회
router.get('/:mainId/:subId', churchController_1.getChurch);
// 교회 정보 수정
router.put('/:mainId/:subId', churchController_1.updateChurch);
// 교회 삭제
router.delete('/:mainId/:subId', churchController_1.deleteChurch);
exports.default = router;
