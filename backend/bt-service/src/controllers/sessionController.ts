import { Request, Response, NextFunction } from 'express';
import BTSession from '../models/BTSession';
import BTAttendance from '../models/BTAttendance';

// 새 세션 생성
export const createBTSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      sessionType,
      date,
      startTime,
      endTime,
      location,
      maxParticipants,
      eventId,
      instructors,
      materials,
      requirements,
      createdBy
    } = req.body;

    // 세션 ID 자동 생성
    const sessionDate = new Date(date);
    const sessionId = (BTSession as any).generateSessionId(sessionDate, sessionType);

    // 중복 세션 확인
    const existingSession = await BTSession.findOne({ sessionId });
    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: '해당 날짜와 시간에 이미 세션이 존재합니다.',
      });
    }

    const session = new BTSession({
      sessionId,
      title,
      description,
      sessionType,
      date: sessionDate,
      startTime,
      endTime,
      location,
      maxParticipants: maxParticipants || 50,
      eventId,
      instructors: instructors || [],
      materials: materials || [],
      requirements,
      createdBy: createdBy || 'admin', // 임시로 admin 사용
    });

    const savedSession = await session.save();

    res.status(201).json({
      success: true,
      message: '세션이 성공적으로 생성되었습니다.',
      data: savedSession,
    });
  } catch (error) {
    next(error);
  }
};

// 세션 목록 조회
export const getBTSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      eventId, 
      status, 
      sessionType, 
      startDate, 
      endDate,
      page = 1,
      limit = 10 
    } = req.query;

    const filter: any = {};
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;
    if (sessionType) filter.sessionType = sessionType;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sessions = await BTSession.find(filter)
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await BTSession.countDocuments(filter);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// 특정 세션 조회
export const getBTSessionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const session = await BTSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// 세션 ID로 세션 조회
export const getBTSessionBySessionId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    
    const session = await BTSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// 세션 수정
export const updateBTSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 세션 ID와 생성자는 수정 불가
    delete updateData.sessionId;
    delete updateData.createdBy;

    const session = await BTSession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '세션이 성공적으로 수정되었습니다.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// 세션 삭제
export const deleteBTSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const session = await BTSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    // 활성 상태이거나 참가자가 있는 세션은 삭제 불가
    if (session.status === 'active' || session.currentParticipants > 0) {
      return res.status(400).json({
        success: false,
        message: '활성 상태이거나 참가자가 있는 세션은 삭제할 수 없습니다.',
      });
    }

    await BTSession.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '세션이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
};

// 세션 상태 변경
export const updateBTSessionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const session = await BTSession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    // 상태 변경 로직에 따른 메서드 호출
    switch (status) {
      case 'active':
        await (session as any).activate();
        break;
      case 'completed':
        await (session as any).complete();
        break;
      case 'cancelled':
        await (session as any).cancel();
        break;
      default:
        session.status = status;
        await session.save();
    }

    res.json({
      success: true,
      message: `세션 상태가 ${status}로 변경되었습니다.`,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// 세션별 출결 통계
export const getBTSessionAttendanceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const session = await BTSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.',
      });
    }

    const attendanceStats = await BTAttendance.aggregate([
      { $match: { sessionId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAttendance = await BTAttendance.countDocuments({ sessionId });
    const present = attendanceStats.find(s => s._id === 'present')?.count || 0;
    const late = attendanceStats.find(s => s._id === 'late')?.count || 0;
    const absent = attendanceStats.find(s => s._id === 'absent')?.count || 0;
    const earlyLeave = attendanceStats.find(s => s._id === 'early-leave')?.count || 0;

    res.json({
      success: true,
      data: {
        sessionInfo: session,
        attendance: {
          total: totalAttendance,
          present,
          late,
          absent,
          earlyLeave,
          attendanceRate: totalAttendance > 0 ? Math.round(((present + late) / totalAttendance) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
