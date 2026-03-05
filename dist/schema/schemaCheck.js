"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentConfirmationSchema = exports.paymentTriggerSchema = exports.step3SubmissionSchema = exports.step2SubmissionSchema = exports.step1SubmissionSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email().max(120),
    phone: zod_1.z.string().max(20).optional(),
    password: zod_1.z.string(),
    role: zod_1.z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
    registration_status: zod_1.z.enum([
        "NOT_STARTED",
        "STEP_1_COMPLETED",
        "STEP_2_COMPLETED",
        "KYC_APPROVED",
        "KYC_REJECTED",
        "STEP_3_COMPLETED",
        "PAYMENT_PENDING",
        "PAYMENT_CONFIRMED",
        "ACTIVE"
    ]).default("NOT_STARTED"),
    secret_code: zod_1.z.string().optional(),
    is_verified: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date().default(() => new Date()),
    updated_at: zod_1.z.date().default(() => new Date()),
});
exports.step1SubmissionSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    full_name: zod_1.z.string().optional(),
    pes_game_name: zod_1.z.string().optional(),
    team_name: zod_1.z.string(),
    konami_id: zod_1.z.string(),
    konami_username: zod_1.z.string().optional()
});
exports.step2SubmissionSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    id_front_url: zod_1.z.string(),
    id_back_url: zod_1.z.string(),
    selfie_url: zod_1.z.string(),
    date_of_birth: zod_1.z.string(),
    nationality: zod_1.z.string(),
    status: zod_1.z.enum(["ACTIVE", "PENDING"]).default("PENDING")
});
exports.step3SubmissionSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    county_code: zod_1.z.number(),
    campus_id: zod_1.z.string().uuid(),
    registration_number: zod_1.z.string().min(3),
    year_of_study: zod_1.z.number().int().min(1).max(10),
    department: zod_1.z.string().min(2),
    invitation_code: zod_1.z.string().optional(),
    id_number: zod_1.z.string().min(5)
});
exports.paymentTriggerSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    phone: zod_1.z.string().min(10)
});
exports.paymentConfirmationSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    payment_id: zod_1.z.string().uuid()
});
