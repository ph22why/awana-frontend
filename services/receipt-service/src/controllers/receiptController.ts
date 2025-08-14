import { Request, Response } from 'express';
import { Receipt } from '../models/Receipt';

// 영수증 목록 조회
export const getAllReceipts = async (req: Request, res: Response) => {
  try {
    const { eventId, eventIds, churchId, page = 1, limit = 10 } = req.query as any;
    const query: any = {};

    if (eventIds) {
      const idsArray = Array.isArray(eventIds)
        ? eventIds
        : typeof eventIds === 'string'
          ? eventIds.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      if (idsArray.length > 0) {
        query.eventId = { $in: idsArray };
      }
    } else if (eventId) {
      query.eventId = eventId;
    }
    if (churchId) query.churchId = churchId;

    const skip = (Number(page) - 1) * Number(limit);
    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Receipt.countDocuments(query);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error getting receipts:', error);
    res.status(500).json({
      success: false,
      message: '영수증 목록을 불러오는데 실패했습니다',
      error: error.message
    });
  }
};

// 영수증 상세 조회
export const getReceiptById = async (req: Request, res: Response) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: '영수증을 찾을 수 없습니다'
      });
    }
    res.json({
      success: true,
      data: receipt
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '영수증을 불러오는데 실패했습니다',
      error: error.message
    });
  }
};

// 교회 정보 조회 (mainId로 검색)
export const getChurchByMainId = async (req: Request, res: Response) => {
  try {
    const { mainId } = req.params;

    // mainId로 가장 최근 영수증 조회
    const latestReceipt = await Receipt.findOne(
      { 'churchId.mainId': mainId },
      { 'churchId.subId': 1, 'churchName': 1 }
    ).sort({ createdAt: -1 });

    if (!latestReceipt) {
      return res.status(404).json({
        success: false,
        message: '해당 교회 정보를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: {
        mainId,
        subId: latestReceipt.churchId.subId,
        churchName: latestReceipt.churchName
      }
    });
  } catch (error: any) {
    console.error('Error fetching church details:', error);
    res.status(500).json({
      success: false,
      message: '교회 정보 조회 중 오류가 발생했습니다',
      error: error.message
    });
  }
};

// 영수증 생성
export const createReceipt = async (req: Request, res: Response) => {
  try {
    const receiptData = req.body;
    
    // Map the costs field if amount is provided
    if (receiptData.amount && !receiptData.costs) {
      receiptData.costs = receiptData.amount;
      delete receiptData.amount;
    }

    // If only mainId is provided, try to fetch the subId
    if (receiptData.churchId?.mainId && !receiptData.churchId?.subId) {
      const latestReceipt = await Receipt.findOne(
        { 'churchId.mainId': receiptData.churchId.mainId },
        { 'churchId.subId': 1 }
      ).sort({ createdAt: -1 });

      if (latestReceipt) {
        receiptData.churchId.subId = latestReceipt.churchId.subId;
      }
    }

    console.log('Processing receipt data:', receiptData);

    const receipt = new Receipt(receiptData);
    const savedReceipt = await receipt.save();

    res.status(201).json({
      success: true,
      data: savedReceipt
    });
  } catch (error: any) {
    console.error('Error creating receipt:', error);
    
    // Transform validation errors
    const errors = error.errors ? 
      Object.entries(error.errors).map(([key, err]: [string, any]) => {
        // Map costs error to amount for client compatibility
        const field = key === 'costs' ? 'amount' : key;
        return {
          field,
          message: err.message
        };
      }) : [];

    res.status(400).json({
      success: false,
      message: '영수증 생성 중 오류가 발생했습니다',
      errors
    });
  }
};

// 영수증 수정
export const updateReceipt = async (req: Request, res: Response) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: '영수증을 찾을 수 없습니다'
      });
    }
    res.json({
      success: true,
      data: receipt
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: '영수증 수정에 실패했습니다',
      error: error.message
    });
  }
};

// 영수증 삭제
export const deleteReceipt = async (req: Request, res: Response) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: '영수증을 찾을 수 없습니다'
      });
    }
    res.json({
      success: true,
      message: '영수증이 삭제되었습니다'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '영수증 삭제에 실패했습니다',
      error: error.message
    });
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