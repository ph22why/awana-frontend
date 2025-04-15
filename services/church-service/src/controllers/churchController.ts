import { Request, Response } from 'express';
import { Church, IChurch } from '../models/Church';
import { ChurchEventParticipation, IChurchEventParticipation } from '../models/ChurchEventParticipation';

// 교회 목록 조회
export const getAllChurches = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = { $text: { $search: search as string } };
    }

    const churches = await Church.find(query).sort({ mainId: 1, subId: 1 });
    res.json(churches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching churches', error });
  }
};

// 교회 상세 정보 조회
export const getChurchById = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;
    
    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const church = await Church.findOne({ mainId, subId });
    if (!church) {
      return res.status(404).json({ message: 'Church not found' });
    }

    res.json(church);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching church', error });
  }
};

// 교회 등록
export const createChurch = async (req: Request, res: Response) => {
  try {
    const { mainId, subId, name, location } = req.body;

    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const existingChurch = await Church.findOne({ mainId, subId });
    if (existingChurch) {
      return res.status(400).json({ message: 'Church with this ID already exists' });
    }

    const church = new Church({ mainId, subId, name, location });
    const savedChurch = await church.save();
    
    res.status(201).json(savedChurch);
  } catch (error) {
    res.status(500).json({ message: 'Error creating church', error });
  }
};

// 교회 정보 수정
export const updateChurch = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;
    const { name, location } = req.body;

    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const church = await Church.findOneAndUpdate(
      { mainId, subId },
      { name, location },
      { new: true, runValidators: true }
    );

    if (!church) {
      return res.status(404).json({ message: 'Church not found' });
    }

    res.json(church);
  } catch (error) {
    res.status(500).json({ message: 'Error updating church', error });
  }
};

// 교회 삭제
export const deleteChurch = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;

    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const church = await Church.findOneAndDelete({ mainId, subId });
    if (!church) {
      return res.status(404).json({ message: 'Church not found' });
    }

    // 관련된 이벤트 참가 이력도 삭제
    await ChurchEventParticipation.deleteMany({ 'churchId.mainId': mainId, 'churchId.subId': subId });

    res.json({ message: 'Church deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting church', error });
  }
};

// 교회의 이벤트 참가 이력 조회
export const getChurchEventHistory = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;

    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const history = await ChurchEventParticipation.find({
      'churchId.mainId': mainId,
      'churchId.subId': subId
    }).sort({ registrationDate: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching church event history', error });
  }
};

// 이벤트 참가 등록
export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;
    const { eventId, participantCount, totalAmount } = req.body;

    if (!Church.validateChurchId(mainId, subId)) {
      return res.status(400).json({ message: 'Invalid church ID format' });
    }

    const church = await Church.findOne({ mainId, subId });
    if (!church) {
      return res.status(404).json({ message: 'Church not found' });
    }

    const participation = new ChurchEventParticipation({
      churchId: { mainId, subId },
      eventId,
      participantCount,
      totalAmount,
      registrationDate: new Date()
    });

    const savedParticipation = await participation.save();
    res.status(201).json(savedParticipation);
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error });
  }
}; 