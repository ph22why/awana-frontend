import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "아이디를 입력해주세요")
    .min(3, "아이디는 최소 3자 이상이어야 합니다")
    .max(50, "아이디는 최대 50자까지 가능합니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "아이디를 입력해주세요")
      .min(3, "아이디는 최소 3자 이상이어야 합니다")
      .max(50, "아이디는 최대 50자까지 가능합니다")
      .regex(/^[a-zA-Z0-9_]+$/, "아이디는 영문, 숫자, 언더스코어만 사용 가능합니다"),
    email: z
      .string()
      .min(1, "이메일을 입력해주세요")
      .email("올바른 이메일 형식이 아닙니다")
      .max(255, "이메일은 최대 255자까지 가능합니다"),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요")
      .min(6, "비밀번호는 최소 6자 이상이어야 합니다")
      .max(100, "비밀번호는 최대 100자까지 가능합니다")
      .regex(/[A-Za-z]/, "비밀번호는 최소 1개의 영문자를 포함해야 합니다")
      .regex(/[0-9]/, "비밀번호는 최소 1개의 숫자를 포함해야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
