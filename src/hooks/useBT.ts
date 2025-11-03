import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { btApi, ChurchManager } from '@/services/api/btApi';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useBT = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useChurchManagers = () => {
    return useQuery({
      queryKey: ['churchManagers'],
      queryFn: btApi.getChurchManagers,
    });
  };

  const useUpdateChurchManagerStatus = () => {
    return useMutation({
      mutationFn: ({
        managerId,
        status,
        eventId,
        costs,
        partTeacher,
      }: {
        managerId: string;
        status: string;
        eventId?: string;
        costs?: number;
        partTeacher?: number;
      }) => btApi.updateChurchManagerStatus(managerId, status, eventId, costs, partTeacher),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['churchManagers'] });
        toast({
          title: '성공',
          description: '담당자 상태가 업데이트되었습니다.',
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

  const useBTReceiptByManager = (managerId: string) => {
    return useQuery({
      queryKey: ['btReceipts', managerId],
      queryFn: () => btApi.getBTReceiptByChurchManager(managerId),
      enabled: !!managerId,
    });
  };

  return {
    useChurchManagers,
    useUpdateChurchManagerStatus,
    useBTReceiptByManager,
  };
};
