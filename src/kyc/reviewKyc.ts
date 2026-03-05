import { pool } from "../database/connectDb";
import { z } from "zod";


export const reviewKyc = async (
  input: { user_id: string; decision: "APPROVED" | "REJECTED"; rejection_reason?: string },
  adminId: string
) => {
  // Use strict UUID validation
  const parsed = z.object({
    user_id: z.string().uuid("Invalid User ID format"),
    decision: z.enum(["APPROVED", "REJECTED"]),
    rejection_reason: z.string().optional()
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { user_id, decision, rejection_reason } = parsed.data;

  try {
    // Check if KYC exists
    const kycCheck = await pool.query(
      `SELECT * FROM kyc_submissions WHERE user_id = $1`,
      [user_id]
    );

    if (kycCheck.rows.length === 0) {
      return { success: false, message: "KYC submission not found" };
    }

    // Update KYC submission
    await pool.query(
      `UPDATE kyc_submissions
       SET status = $1,
           reviewed_by = $2,
           reviewed_at = NOW(),
           rejection_reason = $3
       WHERE user_id = $4`,
      [decision, adminId, rejection_reason || null, user_id]
    );

    // Update user registration status
    if (decision === "APPROVED") {
      await pool.query(
        `UPDATE users 
         SET registration_status = 'KYC_APPROVED'
         WHERE id = $1`,
        [user_id]
      );
    } else {
      await pool.query(
        `UPDATE users 
         SET registration_status = 'STEP_1_COMPLETED'
         WHERE id = $1`,
        [user_id]
      );
    }

    return { success: true, message: `KYC ${decision}` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};