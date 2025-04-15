import { Request, Response } from 'express';
import { Event, IEvent } from '../models/Event';
import { SampleEvent, ISampleEvent } from '../models/SampleEvent';

// 이벤트 목록 조회 (연도별, 공개/비공개 필터링 지원)
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { year, isPublic } = req.query;
    const query: any = {};
    
    if (year) {
      query.eventYear = parseInt(year as string);
    }
    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    const events = await Event.find(query).sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

// 단일 이벤트 조회
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error });
  }
};

// 이벤트 생성
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData = {
      ...req.body,
      eventYear: new Date(req.body.eventDate).getFullYear()
    };
    const event = new Event(eventData);
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
};

// 이벤트 수정
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventData = {
      ...req.body,
      eventYear: new Date(req.body.eventDate).getFullYear()
    };
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
};

// 이벤트 삭제
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
};

// 샘플 이벤트 목록 조회
export const getSampleEvents = async (req: Request, res: Response) => {
  try {
    const sampleEvents = await SampleEvent.find({ isOpenAvailable: true });
    res.json(sampleEvents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sample events', error });
  }
};

// 샘플 이벤트를 실제 이벤트로 복사
export const createEventFromSample = async (req: Request, res: Response) => {
  try {
    const { sampleEventId } = req.params;
    const sampleEvent = await SampleEvent.findById(sampleEventId);
    
    if (!sampleEvent) {
      return res.status(404).json({ message: 'Sample event not found' });
    }

    if (!sampleEvent.isOpenAvailable) {
      return res.status(400).json({ message: 'This sample event is not available for use' });
    }

    const eventData = {
      ...sampleEvent.toObject(),
      _id: undefined,
      eventYear: new Date().getFullYear(),
      eventDate: new Date(),
      registrationStartDate: new Date(),
      registrationEndDate: new Date(),
      eventStartDate: new Date(),
      eventEndDate: new Date()
    };

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event from sample', error });
  }
}; 