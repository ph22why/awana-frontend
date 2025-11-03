import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/services/api/eventApi';
import { IEvent, IEventCreate, IEventGroup } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useEvents = () => {
    return useQuery({
      queryKey: ['events'],
      queryFn: eventApi.getEvents,
    });
  };

  const usePublicEvents = () => {
    return useQuery({
      queryKey: ['events', 'public'],
      queryFn: eventApi.getPublicEvents,
    });
  };

  const useEvent = (id: string) => {
    return useQuery({
      queryKey: ['event', id],
      queryFn: () => eventApi.getEventById(id),
      enabled: !!id,
    });
  };

  const useEventsByYear = (year: number) => {
    return useQuery({
      queryKey: ['events', 'year', year],
      queryFn: () => eventApi.getEventsByYear(year),
      enabled: !!year,
    });
  };

  const useCreateEvent = () => {
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

  const useUpdateEvent = () => {
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

  const useDeleteEvent = () => {
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

  const useSampleEvents = () => {
    return useQuery({
      queryKey: ['sampleEvents'],
      queryFn: eventApi.getSampleEvents,
    });
  };

  const useEventGroups = () => {
    return useQuery({
      queryKey: ['eventGroups'],
      queryFn: eventApi.getEventGroups,
    });
  };

  const useEventGroup = (id: string) => {
    return useQuery({
      queryKey: ['eventGroup', id],
      queryFn: () => eventApi.getEventGroupById(id),
      enabled: !!id,
    });
  };

  const useCreateEventGroup = () => {
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

  const useUpdateEventGroup = () => {
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

  const useDeleteEventGroup = () => {
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

  return {
    useEvents,
    usePublicEvents,
    useEvent,
    useEventsByYear,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    useSampleEvents,
    useEventGroups,
    useEventGroup,
    useCreateEventGroup,
    useUpdateEventGroup,
    useDeleteEventGroup,
  };
};
