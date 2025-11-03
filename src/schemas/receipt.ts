import { z } from 'zod';

export const receiptSchema = z.object({
  eventId: z.string().min(1, '이벤트를 선택해주세요'),
  churchId: z.object({
    mainId: z.string().min(4, 'Main ID는 4자리여야 합니다').max(4, 'Main ID는 4자리여야 합니다'),
    subId: z.string().min(2, 'Sub ID는 2자리여야 합니다').max(2, 'Sub ID는 2자리여야 합니다'),
  }),
  churchName: z.string().min(1, '교회명을 입력해주세요'),
  managerName: z.string().min(1, '담당자 이름을 입력해주세요').max(50, '담당자 이름은 50자 이내로 입력해주세요'),
  managerPhone: z.string()
    .min(1, '연락처를 입력해주세요')
    .regex(/^[0-9-+()]*$/, '올바른 전화번호 형식이 아닙니다'),
  partTotal: z.number().min(0, '총 인원은 0 이상이어야 합니다'),
  partStudent: z.number().min(0, '학생 수는 0 이상이어야 합니다'),
  partTeacher: z.number().min(0, '교사 수는 0 이상이어야 합니다'),
  partYM: z.number().min(0, '청년부 수는 0 이상이어야 합니다'),
  costs: z.number().min(0, '비용은 0 이상이어야 합니다'),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentDate: z.string().optional(),
}).refine(
  (data) => data.partStudent + data.partTeacher + data.partYM <= data.partTotal,
  {
    message: '학생, 교사, 청년부 합계가 총 인원을 초과할 수 없습니다',
    path: ['partTotal'],
  }
);

export type ReceiptFormData = z.infer<typeof receiptSchema>;
