import Joi from 'joi';

export const churchManagerSchema = Joi.object({
  // UI에서 입력받는 필수 필드만
  churchName: Joi.string().required().trim().messages({
    'string.empty': '교회명을 입력해주세요.',
    'any.required': '교회명은 필수 항목입니다.',
  }),
  churchAddress: Joi.string().required().trim().messages({
    'string.empty': '교회 주소를 입력해주세요.',
    'any.required': '교회 주소는 필수 항목입니다.',
  }),
  managerPhone: Joi.string().required().trim().messages({
    'string.empty': '담당자 전화번호를 입력해주세요.',
    'any.required': '담당자 전화번호는 필수 항목입니다.',
  }),
  
  // 선택 필드들 (UI에서 입력받지 않음)
  churchPhone: Joi.string().optional().trim(),
  managerName: Joi.string().optional().trim(),
  managerEmail: Joi.string().email().optional().trim().messages({
    'string.email': '올바른 이메일 형식을 입력해주세요.',
  }),
  participants: Joi.number().min(0).optional().messages({
    'number.min': '참가자 수는 0 이상이어야 합니다.',
  }),
  eventId: Joi.string().optional().trim(),
  totalCost: Joi.number().min(0).optional(),
  
  // 교회 ID 정보 (선택)
  churchId: Joi.object({
    mainId: Joi.string().optional(),
    subId: Joi.string().optional(),
  }).optional(),
});

export const individualTeacherSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    'string.empty': '이름을 입력해주세요.',
    'any.required': '이름은 필수 항목입니다.',
  }),
  phone: Joi.string().required().trim().messages({
    'string.empty': '전화번호를 입력해주세요.',
    'any.required': '전화번호는 필수 항목입니다.',
  }),
  email: Joi.string().email().required().trim().messages({
    'string.email': '올바른 이메일 형식을 입력해주세요.',
    'string.empty': '이메일을 입력해주세요.',
    'any.required': '이메일은 필수 항목입니다.',
  }),
  address: Joi.string().required().trim().messages({
    'string.empty': '주소를 입력해주세요.',
    'any.required': '주소는 필수 항목입니다.',
  }),
  churchName: Joi.string().optional().trim(),
  position: Joi.string().valid('교사', '전도사', '목사', '장로', '권사', '집사', '기타').optional().messages({
    'any.only': '올바른 직책을 선택해주세요.',
  }),
  experience: Joi.string().optional().trim(),
  certification: Joi.string().optional().trim(),
  motivation: Joi.string().required().trim().messages({
    'string.empty': '참가 동기를 입력해주세요.',
    'any.required': '참가 동기는 필수 항목입니다.',
  }),
});

export const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required().messages({
    'any.only': '올바른 상태값을 선택해주세요. (pending, approved, rejected)',
    'any.required': '상태값은 필수 항목입니다.',
  }),
  // 승인 시 추가 정보 (선택적)
  eventId: Joi.string().optional().trim().messages({
    'string.empty': '이벤트 ID를 입력해주세요.',
  }),
  costs: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().pattern(/^\d+$/).allow('')
  ).optional().messages({
    'number.min': '비용은 0 이상이어야 합니다.',
    'string.pattern.base': '비용은 숫자만 입력해주세요.',
  }),
  partTeacher: Joi.alternatives().try(
    Joi.number().min(1),
    Joi.string().pattern(/^\d+$/).allow('')
  ).optional().messages({
    'number.min': '참가 교사 수는 1 이상이어야 합니다.',
    'string.pattern.base': '참가 교사 수는 숫자만 입력해주세요.',
  }),
});
