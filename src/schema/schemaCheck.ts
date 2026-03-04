import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3).max(50),
  email: z.string().email().max(120),
  phone: z.string().max(20).optional(),
  password: z.string(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
  registration_status: z.enum([
    "NOT_STARTED",
    "STEP_1_COMPLETED",
    "STEP_2_COMPLETED",
    "STEP_3_COMPLETED",
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED",
    "ACTIVE"
  ]).default("NOT_STARTED"),
  is_verified: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});
