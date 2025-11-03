import { z } from 'zod';

export const churchSchema = z.object({
  name: z.string().min(1, '교회명을 입력해주세요').max(100, '교회명은 100자 이내로 입력해주세요'),
  location: z.string().min(1, '주소를 입력해주세요').max(200, '주소는 200자 이내로 입력해주세요'),
  mainId: z.string()
    .min(4, 'Main ID는 4자리여야 합니다')
    .max(4, 'Main ID는 4자리여야 합니다')
    .regex(/^\d{4}$/, 'Main ID는 4자리 숫자여야 합니다'),
  subId: z.string()
    .min(2, 'Sub ID는 2자리여야 합니다')
    .max(2, 'Sub ID는 2자리여야 합니다')
    .regex(/^\d{2}$/, 'Sub ID는 2자리 숫자여야 합니다'),
  phone: z.string()
    .regex(/^[0-9-+()]*$/, '올바른 전화번호 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email('올바른 이메일 형식이 아닙니다')
    .optional()
    .or(z.literal('')),
});

export type ChurchFormData = z.infer<typeof churchSchema>;
