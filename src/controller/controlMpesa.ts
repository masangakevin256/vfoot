import {pool} from "../database/connectDb";
import {Request, Response} from "express";
import { initiateStkPush } from "../modules/payments/mpesaServices";

export const triggerStkPush = async ( req: Request, res: Response) => {
    const user_id = req.user?.id;

    const payload = { ...req.body, user_id };
    // console.log(payload)

    const result: any = await initiateStkPush(payload);

    if (!result.success) {
        return res.status(400).json(result);
    }

    

    return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        data: result.data
    });

}

export const mpesaCallback = async (req: Request, res: Response) => {

  const callback = req.body.Body.stkCallback;
  console.log(req.body)

  const checkoutRequestId = callback.CheckoutRequestID;
  const resultCode = callback.ResultCode;
  const resultDesc = callback.ResultDesc;

  // Check if payment already processed
  const existingPayment = await pool.query(
    `SELECT status FROM payments WHERE checkout_request_id=$1`,
    [checkoutRequestId]
  );

  if (existingPayment.rows.length === 0) {
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const paymentStatus = existingPayment.rows[0].status;

  //Idempotency protection
  if (paymentStatus === "SUCCESS") {
    console.log("Duplicate callback ignored:", checkoutRequestId);
    return res.json({ ResultCode: 0, ResultDesc: "Already processed" });
  }

  if (resultCode === 0) {

    const metadata = callback.CallbackMetadata.Item;

    const mpesaReceipt = metadata.find(
      (item: any) => item.Name === "MpesaReceiptNumber"
    )?.Value;

    await pool.query(
      `
      UPDATE payments
      SET status='SUCCESS',
          mpesa_receipt=$1,
          updated_at=NOW()
      WHERE checkout_request_id=$2
      `,
      [mpesaReceipt, checkoutRequestId]
    );

    await pool.query(
      `
      INSERT INTO wallets (user_id, is_activated)
      VALUES (
        (SELECT user_id FROM payments WHERE checkout_request_id=$1),
        true
      )
      `,
      [checkoutRequestId]
    )

    await pool.query(`
        UPDATE users
        SET registration_status = 'ACTIVE',
            is_verified = true
        WHERE id = (
          SELECT user_id FROM payments
          WHERE checkout_request_id = $1
        )
    `, [checkoutRequestId]);

  } else {

    await pool.query(
      `
      UPDATE payments
      SET status='FAILED',
          failure_reason=$1,
          updated_at=NOW()
      WHERE checkout_request_id=$2
      `,
      [resultDesc, checkoutRequestId]
    );

  }

  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};



