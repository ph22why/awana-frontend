import { Request, Response } from 'express';
import Event from '../models/event.model';
import { SampleEvent, initialSampleEvents } from '../models/sampleEvent.model';

export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    
    // 날짜 문자열을 Date 객체로 변환
    const dateFields = [
      'event_Start_Date',
      'event_End_Date',
      'event_Registration_Start_Date',
      'event_Registration_End_Date'
    ];
    
    dateFields.forEach(field => {
      if (eventData[field]) {
        eventData[field] = new Date(eventData[field]);
      }
    });

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('이벤트 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

export const getSampleEvents = async (req: Request, res: Response) => {
  try {
    // 샘플 이벤트 데이터가 있는지 확인
    let sampleEvents = await SampleEvent.find();
    
    // 데이터가 없으면 초기 데이터 삽입
    if (sampleEvents.length === 0) {
      sampleEvents = await SampleEvent.insertMany(initialSampleEvents);
    }

    res.status(200).json(sampleEvents);
  } catch (error) {
    console.error('샘플 이벤트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '샘플 이벤트 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { openAvailable, year, page, limit } = req.query;
    
    // 쿼리 조건 구성
    const query: any = {};
    
    // 공개/비공개 필터링
    if (openAvailable) {
      query.event_Open_Available = openAvailable;
    }
    
    // 연도 필터링
    if (year) {
      query.event_Year = parseInt(year as string);
    }
    
    // 페이지네이션 설정
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;
    
    // 이벤트 조회
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // 전체 개수 조회 (페이지네이션용)
    const totalCount = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('이벤트 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 날짜 문자열을 Date 객체로 변환
    const dateFields = [
      'event_Start_Date',
      'event_End_Date',
      'event_Registration_Start_Date',
      'event_Registration_End_Date'
    ];
    
    dateFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field]);
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: '해당 이벤트를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('이벤트 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 수정 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: '해당 이벤트를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '이벤트가 성공적으로 삭제되었습니다.',
      data: deletedEvent
    });
  } catch (error) {
    console.error('이벤트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}; 