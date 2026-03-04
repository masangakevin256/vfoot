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
    "KYC_APPROVED",
    "STEP_3_COMPLETED",
    "PAYMENT_PENDING",
    "PAYMENT_CONFIRMED",
    "ACTIVE"
  ]).default("NOT_STARTED"),
  is_verified: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

export const step1SubmissionSchema =  z.object({

  user_id: z.string().uuid(),
  full_name: z.string().optional(),
  pes_game_name: z.string().optional(),
  team_name: z.string(),
  konami_id: z.string(),
  
})

export const step2SubmissionSchema = z.object({
  user_id: z.string().uuid(),
  id_front_url: z.string(),
  id_back_url: z.string(),
  selfie_url: z.string(),
  date_of_birth: z.string(),
  nationality: z.string(),
  status: z.enum(["ACTIVE", "PENDING"]).default("PENDING")
}) 

export const step3SubmissionSchema = z.object({
  user_id: z.string().uuid(),
  county: z.string().min(2),
  campus_id: z.string().uuid(),
  registration_number: z.string().min(3),
  year_of_study: z.number().int().min(1).max(10),
  department: z.string().min(2),
  invitation_code: z.string().optional(),
  id_number: z.string().min(5)
});

export const paymentTriggerSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  phone: z.string().min(10)
});

export const paymentConfirmationSchema = z.object({
  user_id: z.string().uuid(),
  payment_id: z.string().uuid()
});