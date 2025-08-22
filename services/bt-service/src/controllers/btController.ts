import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import ChurchManager, { IChurchManager } from '../models/ChurchManager';
import IndividualTeacher, { IIndividualTeacher } from '../models/IndividualTeacher';
import BTTeacher, { IBTTeacher } from '../models/BTTeacher';

// Church Manager Controllers
export const createChurchManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const churchManager: IChurchManager = new ChurchManager(req.body);
    const savedChurchManager = await churchManager.save();
    
    res.status(201).json({
      success: true,
      message: '교회담당자 신청이 성공적으로 접수되었습니다.',
      data: savedChurchManager,
    });
  } catch (error) {
    next(error);
  }
};

export const getChurchManagers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    const churchManagers = await ChurchManager.find(query)
      .sort({ registrationDate: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ChurchManager.countDocuments(query);

    res.json({
      success: true,
      data: churchManagers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChurchManagerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const churchManager = await ChurchManager.findById(req.params.id);
    
    if (!churchManager) {
      return res.status(404).json({
        success: false,
        message: '교회담당자 정보를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: churchManager,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChurchManagerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, eventId, costs, partTeacher } = req.body;
    
    const churchManager = await ChurchManager.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!churchManager) {
      return res.status(404).json({
        success: false,
        message: '교회담당자 정보를 찾을 수 없습니다.',
      });
    }

    // 상태가 approved로 변경되면 receipt-service에 영수증 생성
    if (status === 'approved' && eventId && costs && partTeacher) {
      await createReceiptInReceiptService(churchManager, eventId, costs, partTeacher);
    }

    res.json({
      success: true,
      message: '상태가 업데이트되었습니다.',
      data: churchManager,
    });
  } catch (error) {
    next(error);
  }
};

// church-service에서 교회 정보 조회
const getChurchFromChurchService = async (churchName: string) => {
  try {
    const response = await fetch(`http://church-service:3002/api/churches/search?name=${encodeURIComponent(churchName)}`);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      return data.data[0]; // 첫 번째 매칭되는 교회 반환
    }
    return null;
  } catch (error) {
    console.error('Church service 조회 오류:', error);
    return null;
  }
};

// receipt-service에 영수증 생성
const createReceiptInReceiptService = async (
  churchManager: IChurchManager, 
  eventId: string, 
  costs: number, 
  partTeacher: number
) => {
  try {
    // church-service에서 교회 정보 조회
    const churchData = await getChurchFromChurchService(churchManager.churchName);
    
    let churchId = {
      mainId: '9999', // 기본값
      subId: 'a'
    };

    if (churchData) {
      churchId = {
        mainId: churchData.mainId,
        subId: churchData.subId
      };
    } else {
      console.warn(`교회 정보를 찾을 수 없습니다: ${churchManager.churchName}. 기본 ID를 사용합니다.`);
    }

    // receipt-service에 영수증 생성 요청
    const receiptData = {
      eventId: eventId,
      churchId: churchId,
      churchName: churchManager.churchName,
      managerName: churchManager.managerName,
      managerPhone: churchManager.managerPhone,
      partTotal: partTeacher,
      partStudent: 0, // BT는 학생 참가 없음
      partTeacher: partTeacher,
      partYM: 0, // BT는 YM 참가 없음
      costs: costs,
      paymentMethod: 'bank',
      paymentStatus: 'completed', // 승인 시 바로 완료 처리
      paymentDate: new Date(),
      description: 'BT 프로그램 참가비',
    };

    const response = await fetch('http://receipt-service:3003/api/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Receipt service에서 영수증 생성 실패');
    }

    console.log('Receipt service에 영수증 생성 완료:', result.data);
    return result.data;
  } catch (error) {
    console.error('Receipt service 영수증 생성 오류:', error);
    throw error;
  }
};

// Individual Teacher Controllers
export const createIndividualTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const individualTeacher: IIndividualTeacher = new IndividualTeacher(req.body);
    const savedIndividualTeacher = await individualTeacher.save();
    
    res.status(201).json({
      success: true,
      message: '개인교사 신청이 성공적으로 접수되었습니다.',
      data: savedIndividualTeacher,
    });
  } catch (error) {
    next(error);
  }
};

export const getIndividualTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    const individualTeachers = await IndividualTeacher.find(query)
      .sort({ registrationDate: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await IndividualTeacher.countDocuments(query);

    res.json({
      success: true,
      data: individualTeachers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getIndividualTeacherById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const individualTeacher = await IndividualTeacher.findById(req.params.id);
    
    if (!individualTeacher) {
      return res.status(404).json({
        success: false,
        message: '개인교사 정보를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: individualTeacher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIndividualTeacherStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    const individualTeacher = await IndividualTeacher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!individualTeacher) {
      return res.status(404).json({
        success: false,
        message: '개인교사 정보를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '상태가 업데이트되었습니다.',
      data: individualTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// BT Receipt Controllers (receipt-service 연동)
export const getBTReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, eventId, paymentStatus } = req.query;
    
    // BT 관련 이벤트 ID만 필터링
    const btEventIds = ['상반기 연합 BT 2025', '하반기 연합 BT 2025', '수시 BT 2025']; // 실제 이벤트 ID로 변경 필요
    
    let queryParams = `page=${page}&limit=${limit}`;
    
    if (eventId && btEventIds.includes(eventId as string)) {
      queryParams += `&eventId=${eventId}`;
    } else if (!eventId) {
      // BT 이벤트들만 조회
      queryParams += `&eventIds=${btEventIds.join(',')}`;
    }
    
    if (paymentStatus) {
      queryParams += `&paymentStatus=${paymentStatus}`;
    }

    const response = await fetch(`http://receipt-service:3003/api/receipts?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Receipt service에서 영수증 조회 실패');
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getBTReceiptById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(`http://receipt-service:3003/api/receipts/${req.params.id}`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getBTReceiptByChurchManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { churchManagerId } = req.params;
    
    // 교회담당자 정보로 교회 데이터 조회
    const churchManager = await ChurchManager.findById(churchManagerId);
    if (!churchManager) {
      return res.status(404).json({
        success: false,
        message: '교회담당자 정보를 찾을 수 없습니다.',
      });
    }

    // church-service에서 교회 정보 조회
    const churchData = await getChurchFromChurchService(churchManager.churchName);
    
    if (!churchData) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // receipt-service에서 해당 교회의 영수증 조회
    const response = await fetch(`http://receipt-service:3003/api/receipts/church/${churchData.mainId}/${churchData.subId}`);
    
    if (!response.ok) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const receipts = await response.json();
    
    // BT 관련 영수증만 필터링 (이벤트 이름에 'BT'가 포함된 것들)
    const btReceipts = Array.isArray(receipts) 
      ? receipts.filter((receipt: any) => 
          receipt.eventId && (
            receipt.eventId.includes('BT') || 
            receipt.description?.includes('BT')
          )
        )
      : [];

    res.json({
      success: true,
      data: btReceipts,
    });
  } catch (error) {
    next(error);
  }
};

// Church Integration Controllers
export const searchChurches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.',
      });
    }

    const response = await fetch(`http://church-service:3002/api/churches/search?query=${encodeURIComponent(query as string)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Church service에서 교회 검색 실패');
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// BT Teacher Controllers
export const createBTTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const btTeacher: IBTTeacher = new BTTeacher(req.body);
    const savedBTTeacher = await btTeacher.save();
    
    res.status(201).json({
      success: true,
      message: 'BT 교사가 성공적으로 등록되었습니다.',
      data: savedBTTeacher,
    });
  } catch (error) {
    next(error);
  }
};

export const getBTTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, churchManagerId, eventId, status } = req.query;
    const query: any = {};

    if (churchManagerId) query.churchManagerId = churchManagerId;
    if (eventId) query.eventId = eventId;
    if (status) query.status = status;

    const btTeachers = await BTTeacher.find(query)
      .populate('churchManagerId', 'churchName managerName')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await BTTeacher.countDocuments(query);

    res.json({
      success: true,
      data: btTeachers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBTTeachersByChurchManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { churchManagerId } = req.params;
    
    const btTeachers = await BTTeacher.find({ churchManagerId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: btTeachers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBTTeacherStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    const btTeacher = await BTTeacher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!btTeacher) {
      return res.status(404).json({
        success: false,
        message: 'BT 교사 정보를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '상태가 업데이트되었습니다.',
      data: btTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// Statistics
export const getBTStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const churchManagerStats = await ChurchManager.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const individualTeacherStats = await IndividualTeacher.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // receipt-service에서 BT 영수증 통계 조회
    let btReceiptStats: Array<{ _id: string; count: number; totalAmount: number }> = [];
    let totalBTReceipts = 0;
    
    try {
      const response = await fetch('http://receipt-service:3003/api/receipts?eventIds=상반기 연합 BT 2025,하반기 연합 BT 2025,수시 BT 2025&limit=1000');
      const data = await response.json();
      
      if (data.success && data.data) {
        totalBTReceipts = data.data.length;
        
        // 상태별 통계 계산
        const statusCount: { [key: string]: { count: number; totalAmount: number } } = {};
        
        data.data.forEach((receipt: any) => {
          const status = receipt.paymentStatus || 'pending';
          if (!statusCount[status]) {
            statusCount[status] = { count: 0, totalAmount: 0 };
          }
          statusCount[status].count++;
          statusCount[status].totalAmount += receipt.costs || 0;
        });
        
        btReceiptStats = Object.entries(statusCount).map(([status, stats]) => ({
          _id: status,
          count: stats.count,
          totalAmount: stats.totalAmount,
        }));
      }
    } catch (error) {
      console.error('Receipt service 통계 조회 오류:', error);
    }

    const btTeacherStats = await BTTeacher.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalChurchManagers = await ChurchManager.countDocuments();
    const totalIndividualTeachers = await IndividualTeacher.countDocuments();
    const totalBTTeachers = await BTTeacher.countDocuments();

    res.json({
      success: true,
      data: {
        churchManagers: {
          total: totalChurchManagers,
          byStatus: churchManagerStats,
        },
        individualTeachers: {
          total: totalIndividualTeachers,
          byStatus: individualTeacherStats,
        },
        btReceipts: {
          total: totalBTReceipts,
          byStatus: btReceiptStats,
        },
        btTeachers: {
          total: totalBTTeachers,
          byStatus: btTeacherStats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
