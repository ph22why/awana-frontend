import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/services/api/eventApi';
import { IEvent, IEventCreate, IEventGroup } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: eventApi.getEvents,
  });
};

export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['events', 'public'],
    queryFn: eventApi.getPublicEvents,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
  });
};

export const useEventsByYear = (year: number) => {
  return useQuery({
    queryKey: ['events', 'year', year],
    queryFn: () => eventApi.getEventsByYear(year),
    enabled: !!year,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: IEventCreate) => eventApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: '성공',
        description: '행사가 생성되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IEventCreate> }) =>
      eventApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: '성공',
        description: '행사 정보가 수정되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: '성공',
        description: '행사가 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

export const useSampleEvents = () => {
  return useQuery({
    queryKey: ['sampleEvents'],
    queryFn: eventApi.getSampleEvents,
  });
};

export const useEventGroups = () => {
  return useQuery({
    queryKey: ['eventGroups'],
    queryFn: eventApi.getEventGroups,
  });
};

export const useEventGroup = (id: string) => {
  return useQuery({
    queryKey: ['eventGroup', id],
    queryFn: () => eventApi.getEventGroupById(id),
    enabled: !!id,
  });
};

export const useCreateEventGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<IEventGroup, '_id' | 'createdAt' | 'updatedAt'>) =>
      eventApi.createEventGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventGroups'] });
      toast({
        title: '성공',
        description: '행사 그룹이 생성되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEventGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<IEventGroup, '_id' | 'createdAt' | 'updatedAt'>>;
    }) => eventApi.updateEventGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventGroups'] });
      toast({
        title: '성공',
        description: '행사 그룹이 수정되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEventGroup = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEventGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventGroups'] });
      toast({
        title: '성공',
        description: '행사 그룹이 삭제되었습니다.',
      });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};
