import { pool } from "../../database/connectDb";
import { paymentTriggerSchema, paymentConfirmationSchema } from "../../schema/schemaCheck";
//will be integrated later 
export const triggerPayment = async (input: unknown) => {
  const parsed = paymentTriggerSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { user_id, amount, phone } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT registration_status FROM users WHERE id=$1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    if (userCheck.rows[0].registration_status !== "STEP_3_COMPLETED") {
      return { success: false, message: "Complete Step 3 first" };
    }

    const payment = await pool.query(
      `INSERT INTO payments (user_id, amount, phone, status)
       VALUES ($1,$2,$3,'PENDING')
       RETURNING id, status`,
      [user_id, amount, phone]
    );

    await pool.query(
      `UPDATE users
       SET registration_status='PAYMENT_PENDING'
       WHERE id=$1`,
      [user_id]
    );

    return {
      success: true,
      data: payment.rows[0]
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

export const confirmPayment = async (input: unknown) => {
  const parsed = paymentConfirmationSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { user_id, payment_id } = parsed.data;

  try {
    const paymentCheck = await pool.query(
      `SELECT status FROM payments WHERE id=$1 AND user_id=$2`,
      [payment_id, user_id]
    );

    if (paymentCheck.rows.length === 0) {
      return { success: false, message: "Payment not found" };
    }

    if (paymentCheck.rows[0].status === "SUCCESS") {
      return { success: false, message: "Payment already confirmed" };
    }

    await pool.query(
      `UPDATE payments
       SET status='SUCCESS',
           updated_at=NOW()
       WHERE id=$1 AND user_id=$2`,
      [payment_id, user_id]
    );

    await pool.query(
      `UPDATE users
       SET registration_status='ACTIVE',
           updated_at=NOW()
       WHERE id=$1`,
      [user_id]
    );

    return {
      success: true,
      message: "Payment confirmed and user activated"
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};