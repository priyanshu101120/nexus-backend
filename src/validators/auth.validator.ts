import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Nmae must be at least 3 character"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "password must be at least 8 character"),
});

export const loginSchema = z.object({
  email: z.string().email("invalid email address"),
  password: z.string().min(1, "passwod is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
