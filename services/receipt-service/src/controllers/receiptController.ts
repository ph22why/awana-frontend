import { Request, Response } from 'express';
import { Receipt, IReceipt } from '../models/Receipt';

// 영수증 목록 조회
export const getAllReceipts = async (req: Request, res: Response) => {
  try {
    const { churchMainId, churchSubId, eventId, status } = req.query;
    let query: any = {};
    
    if (churchMainId && churchSubId) {
      query['churchId.mainId'] = churchMainId;
      query['churchId.subId'] = churchSubId;
    }
    
    if (eventId) {
      query.eventId = eventId;
    }
    
    if (status) {
      query.paymentStatus = status;
    }

    const receipts = await Receipt.find(query).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipts', error });
  }
};

// 영수증 상세 조회
export const getReceiptById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findById(id);
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipt', error });
  }
};

// 영수증 생성
export const createReceipt = async (req: Request, res: Response) => {
  try {
    const receiptData = req.body;
    const receipt = new Receipt(receiptData);
    const savedReceipt = await receipt.save();
    res.status(201).json(savedReceipt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating receipt', error });
  }
};

// 영수증 수정
export const updateReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const receipt = await Receipt.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating receipt', error });
  }
};

// 영수증 삭제
export const deleteReceipt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const receipt = await Receipt.findByIdAndDelete(id);
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting receipt', error });
  }
};

// 교회별 영수증 조회
export const getChurchReceipts = async (req: Request, res: Response) => {
  try {
    const { mainId, subId } = req.params;
    const receipts = await Receipt.find({
      'churchId.mainId': mainId,
      'churchId.subId': subId
    }).sort({ createdAt: -1 });

    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching church receipts', error });
  }
};

// 이벤트별 영수증 조회
export const getEventReceipts = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const receipts = await Receipt.find({ eventId }).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event receipts', error });
  }
}; 