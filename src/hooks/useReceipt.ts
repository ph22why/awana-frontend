import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptApi } from '@/services/api/receiptApi';
import { Receipt } from '@/types/receipt';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/apiError';

export const useReceipt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const useReceipts = () => {
    return useQuery({
      queryKey: ['receipts'],
      queryFn: receiptApi.getAllReceipts,
    });
  };

  const useReceipt = (id: string) => {
    return useQuery({
      queryKey: ['receipt', id],
      queryFn: () => receiptApi.getReceiptById(id),
      enabled: !!id,
    });
  };

  const useSearchReceipts = (query: {
    eventId?: string;
    churchName?: string;
    managerPhone?: string;
    registrationNumber?: string;
  }) => {
    return useQuery({
      queryKey: ['receipts', 'search', query],
      queryFn: () => receiptApi.searchReceipts(query),
      enabled: Object.values(query).some((v) => !!v),
    });
  };

  const useCreateReceipt = () => {
    return useMutation({
      mutationFn: (data: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) =>
        receiptApi.createReceipt(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        toast({
          title: '성공',
          description: '영수증이 생성되었습니다.',
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

  const useUpdateReceipt = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Receipt> }) =>
        receiptApi.updateReceipt(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        toast({
          title: '성공',
          description: '영수증이 수정되었습니다.',
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

  const useDeleteReceipt = () => {
    return useMutation({
      mutationFn: (id: string) => receiptApi.deleteReceipt(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        toast({
          title: '성공',
          description: '영수증이 삭제되었습니다.',
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
    useReceipts,
    useReceipt,
    useSearchReceipts,
    useCreateReceipt,
    useUpdateReceipt,
    useDeleteReceipt,
  };
};
