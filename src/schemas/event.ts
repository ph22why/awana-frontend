import { z } from 'zod';

export const eventSchema = z.object({
  event_Name: z.string().min(1, '이벤트명을 입력해주세요').max(100, '이벤트명은 100자 이내로 입력해주세요'),
  event_Place: z.string().min(1, '장소를 입력해주세요').max(100, '장소는 100자 이내로 입력해주세요'),
  event_Location: z.string().min(1, '주소를 입력해주세요').max(200, '주소는 200자 이내로 입력해주세요'),
  event_Year: z.number().min(2000, '년도는 2000년 이후여야 합니다').max(2100, '년도는 2100년 이전이어야 합니다'),
  event_Start_Date: z.date({ required_error: '시작일을 선택해주세요' }),
  event_End_Date: z.date({ required_error: '종료일을 선택해주세요' }),
  event_Registration_Start_Date: z.date({ required_error: '접수 시작일을 선택해주세요' }),
  event_Registration_End_Date: z.date({ required_error: '접수 종료일을 선택해주세요' }),
  event_Registration_Start_Time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다 (HH:MM)'),
  event_Registration_End_Time: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식이 올바르지 않습니다 (HH:MM)'),
  event_Open_Available: z.enum(['공개', '비공개'], {
    required_error: '공개 여부를 선택해주세요',
  }),
  event_Link: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  event_Description: z.string().max(1000, '설명은 1000자 이내로 입력해주세요').optional(),
}).refine(
  (data) => data.event_End_Date >= data.event_Start_Date,
  {
    message: '종료일은 시작일 이후여야 합니다',
    path: ['event_End_Date'],
  }
).refine(
  (data) => data.event_Registration_End_Date >= data.event_Registration_Start_Date,
  {
    message: '접수 종료일은 접수 시작일 이후여야 합니다',
    path: ['event_Registration_End_Date'],
  }
);

export type EventFormData = z.infer<typeof eventSchema>;
