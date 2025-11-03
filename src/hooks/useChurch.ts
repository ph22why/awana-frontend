import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { churchApi } from '@/services/api/churchApi';
import { Church, ChurchSearchParams } from '@/types/church';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useChurches = (params?: ChurchSearchParams) => {
    return useQuery({
      queryKey: ['churches', params],
      queryFn: () => churchApi.searchChurches(params),
    });
  };

  const useAllChurches = () => {
    return useQuery({
      queryKey: ['churches', 'all'],
      queryFn: churchApi.getAllChurches,
    });
  };

  const useChurch = (id: string) => {
    return useQuery({
      queryKey: ['church', id],
      queryFn: () => churchApi.getChurchById(id),
      enabled: !!id,
    });
  };

  const useCreateChurch = () => {
    return useMutation({
      mutationFn: (data: Omit<Church, 'id' | '_id' | 'createdAt' | 'updatedAt'>) =>
        churchApi.createChurch(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['churches'] });
        toast({
          title: '성공',
          description: '교회가 생성되었습니다.',
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

  const useUpdateChurch = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Church> }) =>
        churchApi.updateChurch(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['churches'] });
        toast({
          title: '성공',
          description: '교회 정보가 수정되었습니다.',
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

  const useDeleteChurch = () => {
    return useMutation({
      mutationFn: (id: string) => churchApi.deleteChurch(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['churches'] });
        toast({
          title: '성공',
          description: '교회가 삭제되었습니다.',
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
    useChurches,
    useAllChurches,
    useChurch,
    useCreateChurch,
    useUpdateChurch,
    useDeleteChurch,
  };
};
