import { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import ChurchManager, { IChurchManager } from '../models/ChurchManager';
import IndividualTeacher, { IIndividualTeacher } from '../models/IndividualTeacher';
import BTTeacher, { IBTTeacher } from '../models/BTTeacher';
import BTKey from '../models/BTKey';
import BTAttendance from '../models/BTAttendance';
import BTSession from '../models/BTSession';

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

// ===== 키 관리 컨트롤러 =====

// 교회담당자 승인 시 키 생성
export const generateKeysForChurch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { churchManagerId, eventId, keyCount } = req.body;
    
    const churchManager = await ChurchManager.findById(churchManagerId);
    if (!churchManager) {
      return res.status(404).json({
        success: false,
        message: '교회담당자 정보를 찾을 수 없습니다.',
      });
    }

    if (churchManager.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: '승인된 신청만 키를 생성할 수 있습니다.',
      });
    }

    // 기존 키가 있는지 확인
    const existingKeys = await BTKey.countDocuments({ churchManagerId });
    if (existingKeys > 0) {
      return res.status(400).json({
        success: false,
        message: '이미 키가 생성되어 있습니다.',
      });
    }

    // 키 생성
    const keys = [];
    const churchId = churchManager.metadata?.mainId || '001';
    
    for (let i = 1; i <= keyCount; i++) {
      const keyCode = BTKey.generateKeyCode(churchId, i);
      const key = new BTKey({
        keyCode,
        churchManagerId,
        eventId,
        keyType: 'church',
        status: 'available',
        metadata: {
          churchName: churchManager.churchName,
          churchId: churchManager.metadata?.churchId,
          managerPhone: churchManager.managerPhone,
        },
      });
      keys.push(key);
    }

    await BTKey.insertMany(keys);
    
    // ChurchManager 업데이트
    churchManager.keysGenerated = keyCount;
    await churchManager.save();

    res.json({
      success: true,
      message: `${keyCount}개의 키가 생성되었습니다.`,
      data: {
        keys: keys.map(k => ({ keyCode: k.keyCode, status: k.status })),
        churchManagerId,
        eventId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 교회담당자별 키 목록 조회
export const getKeysByChurchManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { churchManagerId } = req.params;
    
    const keys = await BTKey.find({ churchManagerId })
      .populate('assignedTeacherId', 'teacherName teacherPhone')
      .sort({ keyCode: 1 });

    res.json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};

// 키 할당 (교사에게)
export const assignKeyToTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyCode, teacherId } = req.body;
    
    const key = await BTKey.findOne({ keyCode, status: 'available' });
    if (!key) {
      return res.status(404).json({
        success: false,
        message: '사용 가능한 키를 찾을 수 없습니다.',
      });
    }

    const teacher = await BTTeacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '교사 정보를 찾을 수 없습니다.',
      });
    }

    // 키 할당
    key.status = 'assigned';
    key.assignedTeacherId = teacherId;
    key.assignedDate = new Date();
    await key.save();

    // 교사 정보에 키 코드 연결
    teacher.keyCode = keyCode;
    await teacher.save();

    // ChurchManager 키 할당 수 업데이트
    await ChurchManager.findByIdAndUpdate(key.churchManagerId, {
      $inc: { keysAssigned: 1 }
    });

    res.json({
      success: true,
      message: '키가 교사에게 할당되었습니다.',
      data: key,
    });
  } catch (error) {
    next(error);
  }
};

// 키 사용 (QR 생성 시)
export const useKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { keyCode, teacherId } = req.body;
    
    const key = await BTKey.findOne({ keyCode, assignedTeacherId: teacherId });
    if (!key) {
      return res.status(404).json({
        success: false,
        message: '할당된 키를 찾을 수 없습니다.',
      });
    }

    if (key.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: '할당된 키만 사용할 수 있습니다.',
      });
    }

    // QR 코드 생성
    const qrCode = `${keyCode}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    
    key.status = 'used';
    key.usedDate = new Date();
    key.qrCode = qrCode;
    key.qrGeneratedAt = new Date();
    await key.save();

    // ChurchManager 키 사용 수 업데이트
    await ChurchManager.findByIdAndUpdate(key.churchManagerId, {
      $inc: { keysUsed: 1 }
    });

    res.json({
      success: true,
      message: '키가 사용되었습니다.',
      data: {
        keyCode,
        qrCode,
        usedDate: key.usedDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== 출결 관리 컨트롤러 =====

// QR 코드로 출결 체크인
export const checkInWithQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qrCode, sessionId, sessionType, location } = req.body;
    
    // QR 코드로 교사 찾기
    const teacher = await BTTeacher.findOne({ qrCode });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '유효하지 않은 QR 코드입니다.',
      });
    }

    // 이미 해당 세션에 출결했는지 확인
    const existingAttendance = await BTAttendance.findOne({
      teacherId: teacher._id,
      sessionId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: '이미 출결한 세션입니다.',
      });
    }

    // 출결 기록 생성
    const attendance = new BTAttendance({
      teacherId: teacher._id,
      keyCode: teacher.keyCode,
      eventId: teacher.eventId,
      sessionId,
      sessionType,
      checkInTime: new Date(),
      location,
      method: 'qr',
      status: 'present',
    });

    await attendance.save();

    // 교사 정보 업데이트
    teacher.lastAttendanceDate = new Date();
    teacher.attendanceRecords = teacher.attendanceRecords || [];
    teacher.attendanceRecords.push(attendance._id);
    await teacher.save();

    res.json({
      success: true,
      message: '출결이 완료되었습니다.',
      data: {
        teacherName: teacher.teacherName,
        checkInTime: attendance.checkInTime,
        sessionId,
        location,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 출결 기록 조회
export const getAttendanceRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teacherId, eventId, sessionId, startDate, endDate } = req.query;
    
    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    if (eventId) filter.eventId = eventId;
    if (sessionId) filter.sessionId = sessionId;
    if (startDate || endDate) {
      filter.checkInTime = {};
      if (startDate) filter.checkInTime.$gte = new Date(startDate as string);
      if (endDate) filter.checkInTime.$lte = new Date(endDate as string);
    }

    const attendanceRecords = await BTAttendance.find(filter)
      .populate('teacherId', 'teacherName teacherPhone churchName')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

// 출결 통계
export const getAttendanceStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, sessionId } = req.query;
    
    const filter: any = {};
    if (eventId) filter.eventId = eventId;
    if (sessionId) filter.sessionId = sessionId;

    const stats = await BTAttendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await BTAttendance.countDocuments(filter);
    const present = stats.find(s => s._id === 'present')?.count || 0;
    const late = stats.find(s => s._id === 'late')?.count || 0;
    const absent = stats.find(s => s._id === 'absent')?.count || 0;

    res.json({
      success: true,
      data: {
        total,
        present,
        late,
        absent,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
