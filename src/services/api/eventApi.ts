import { api } from '@/lib/api';
import { IEvent, IEventCreate, IEventGroup, SampleEvent } from '@/types/event';

export interface EventApiResponse {
  success: boolean;
  data: IEvent[];
  error?: string;
}

export interface SingleEventApiResponse {
  success: boolean;
  data: IEvent;
  error?: string;
}

export interface SampleEventApiResponse {
  success: boolean;
  data: SampleEvent[];
  error?: string;
}

export interface EventGroupApiResponse {
  success: boolean;
  data: IEventGroup[];
  error?: string;
}

export const eventApi = {
  getEvents: async (): Promise<IEvent[]> => {
    const response = await api.get('/api/events');
    return Array.isArray(response) ? response : response.data || [];
  },

  getPublicEvents: async (): Promise<IEvent[]> => {
    const response = await api.get('/api/events/public');
    return Array.isArray(response) ? response : response.data || [];
  },

  getEventById: async (id: string): Promise<IEvent> => {
    const response = await api.get(`/api/events/${id}`);
    return response.data || response;
  },

  getEventsByYear: async (year: number): Promise<EventApiResponse> => {
    const response = await api.get(`/api/events?year=${year}`);
    return {
      success: true,
      data: Array.isArray(response) ? response : response.data || [],
    };
  },

  createEvent: async (eventData: IEventCreate): Promise<IEvent> => {
    const response = await api.post('/api/events', eventData);
    return response.data || response;
  },

  updateEvent: async (id: string, eventData: Partial<IEventCreate>): Promise<IEvent> => {
    const response = await api.put(`/api/events/${id}`, eventData);
    return response.data || response;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/api/events/${id}`);
  },

  getSampleEvents: async (): Promise<SampleEventApiResponse> => {
    const response = await api.get('/api/events/samples');
    return { success: true, data: Array.isArray(response) ? response : response.data || [] };
  },

  getEventGroups: async (): Promise<IEventGroup[]> => {
    const response = await api.get('/api/events/groups');
    return Array.isArray(response) ? response : response.data || [];
  },

  getEventGroupById: async (id: string): Promise<IEventGroup> => {
    const response = await api.get(`/api/events/groups/${id}`);
    return response.data || response;
  },

  createEventGroup: async (groupData: Omit<IEventGroup, '_id' | 'createdAt' | 'updatedAt'>): Promise<IEventGroup> => {
    const response = await api.post('/api/events/groups', groupData);
    return response.data || response;
  },

  updateEventGroup: async (id: string, groupData: Partial<Omit<IEventGroup, '_id' | 'createdAt' | 'updatedAt'>>): Promise<IEventGroup> => {
    const response = await api.put(`/api/events/groups/${id}`, groupData);
    return response.data || response;
  },

  deleteEventGroup: async (id: string): Promise<void> => {
    await api.delete(`/api/events/groups/${id}`);
  },
};

export type { IEvent, IEventCreate, IEventGroup, SampleEvent };
