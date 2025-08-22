import Joi from 'joi';

export const churchManagerSchema = Joi.object({
  churchName: Joi.string().required().trim().messages({
    'string.empty': '교회명을 입력해주세요.',
    'any.required': '교회명은 필수 항목입니다.',
  }),
  churchAddress: Joi.string().required().trim().messages({
    'string.empty': '교회 주소를 입력해주세요.',
    'any.required': '교회 주소는 필수 항목입니다.',
  }),
  churchPhone: Joi.string().required().trim().messages({
    'string.empty': '교회 전화번호를 입력해주세요.',
    'any.required': '교회 전화번호는 필수 항목입니다.',
  }),
  managerName: Joi.string().required().trim().messages({
    'string.empty': '담당자 이름을 입력해주세요.',
    'any.required': '담당자 이름은 필수 항목입니다.',
  }),
  managerPhone: Joi.string().required().trim().messages({
    'string.empty': '담당자 전화번호를 입력해주세요.',
    'any.required': '담당자 전화번호는 필수 항목입니다.',
  }),
  managerEmail: Joi.string().email().required().trim().messages({
    'string.email': '올바른 이메일 형식을 입력해주세요.',
    'string.empty': '담당자 이메일을 입력해주세요.',
    'any.required': '담당자 이메일은 필수 항목입니다.',
  }),
  participants: Joi.number().min(0).optional().messages({
    'number.min': '참가자 수는 0 이상이어야 합니다.',
  }),
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
});
