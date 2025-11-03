import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { churchApi } from '@/services/api/churchApi';
import { Church, ChurchSearchParams } from '@/types/church';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useChurches = (params?: ChurchSearchParams) => {
  return useQuery({
    queryKey: ['churches', params],
    queryFn: () => churchApi.searchChurches(params),
  });
};

export const useAllChurches = () => {
  return useQuery({
    queryKey: ['churches', 'all'],
    queryFn: churchApi.getAllChurches,
  });
};

export const useChurch = (id: string) => {
  return useQuery({
    queryKey: ['church', id],
    queryFn: () => churchApi.getChurchById(id),
    enabled: !!id,
  });
};

export const useCreateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

export const useUpdateChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

export const useDeleteChurch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
