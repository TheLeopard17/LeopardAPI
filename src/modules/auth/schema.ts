import { z } from 'zod';
export const LoginSchema = z.object({
  operatorCode: z.string().min(3),
  pin: z.string().min(4).max(12)
});
export type LoginDto = z.infer<typeof LoginSchema>;
