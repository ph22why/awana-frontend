import { Request, Response } from 'express';
import EventGroup from '../models/eventGroup.model';

export const listGroups = async (req: Request, res: Response) => {
  try {
    const groups = await EventGroup.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: groups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '그룹 목록 조회 실패', error: error.message });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, location, eventIds } = req.body;
    if (!name || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ success: false, message: '이름과 이벤트 선택이 필요합니다.' });
    }
    const group = await EventGroup.create({ name, location, eventIds });
    res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    res.status(400).json({ success: false, message: '그룹 생성 실패', error: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, eventIds } = req.body;
    const group = await EventGroup.findByIdAndUpdate(
      id,
      { $set: { ...(name !== undefined ? { name } : {}), ...(location !== undefined ? { location } : {}), ...(eventIds ? { eventIds } : {}) } },
      { new: true }
    );
    if (!group) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });
    res.json({ success: true, data: group });
  } catch (error: any) {
    res.status(400).json({ success: false, message: '그룹 수정 실패', error: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await EventGroup.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ success: false, message: '그룹을 찾을 수 없습니다.' });
    res.json({ success: true, message: '그룹이 삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '그룹 삭제 실패', error: error.message });
  }
};


