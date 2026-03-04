"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
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
        "STEP_3_COMPLETED",
        "PAYMENT_PENDING",
        "PAYMENT_CONFIRMED",
        "ACTIVE"
    ]).default("NOT_STARTED"),
    is_verified: zod_1.z.boolean().default(false),
    created_at: zod_1.z.date().default(() => new Date()),
    updated_at: zod_1.z.date().default(() => new Date()),
});
