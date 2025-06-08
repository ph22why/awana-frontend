"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const router = (0, express_1.Router)();
// 이벤트 목록 조회
router.get('/', event_controller_1.getEvents);
// 이벤트 생성
router.post('/', event_controller_1.createEvent);
// 이벤트 수정
router.put('/:id', event_controller_1.updateEvent);
// 이벤트 삭제
router.delete('/:id', event_controller_1.deleteEvent);
// 샘플 이벤트 목록 조회
router.get('/samples', event_controller_1.getSampleEvents);
exports.default = router;
