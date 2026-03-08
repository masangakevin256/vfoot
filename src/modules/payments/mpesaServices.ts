import moment from "moment"
import axios from "axios"
import { pool } from "../../database/connectDb";
import { mpesaPaymentTriggerSchema, mpesaStkPayload } from "../../schema/schemaCheck";
import { formatZodError } from "../../utils/formatZodError";

const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.replace(/[^0-9]/g, "");
  if (formatted.length < 9) return formatted;
  if (formatted.startsWith("254") && formatted.length === 12) return formatted;
  if (formatted.startsWith("0")) formatted = "254" + formatted.substring(1);
  if (formatted.length === 9) formatted = "254" + formatted;
  return formatted;
};

export const initiateStkPush = async (input: unknown) => {
  const parsed = mpesaPaymentTriggerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: formatZodError(parsed.error)
    };
  }

  try {
    const { user_id } = parsed.data;
    const amount = Math.floor(parsed.data.amount); // Ensure integer
    const phone = formatPhoneNumber(parsed.data.phone);
    const accessToken = await getAccessToken();

    const userCheck = await pool.query(
      `SELECT registration_status FROM users WHERE id=$1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    if (userCheck.rows[0].registration_status !== "STEP_3_COMPLETED" && userCheck.rows[0].registration_status !== "PAYMENT_PENDING") {
      return { success: false, message: "Complete Step 3 first or payment is already pending" };
    }

    const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const auth = "Bearer " + accessToken;
    const timestamp = moment().format("YYYYMMDDHHmmss");

    const shortCode = (process.env.MPESA_SHORT_CODE || "").trim();
    const passKey = (process.env.MPESA_PASS_kEY || "").trim();

    // Generate base64 encoded password
    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: (process.env.NGROK_URL || "").trim() + "/api/v1/mpesa/callback",
      AccountReference: "VFOOT",
      TransactionDesc: "Payment"
    }
    console.log(process.env.NGROK_URL);

    const result = mpesaStkPayload.safeParse(payload);

    if (!result.success) {
      console.error("STK Payload Validation Error:", result.error.format());
      return { success: false, message: "Internal payload validation error", data: result.error.format() };
    }

    try {
      const response = await axios.post(url, payload, {
        headers: { 
          Authorization: auth,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        timeout: 20000
      });

      console.log("STK Push response received. Status:", response.status);
      console.log("Response Body:", response.data);

      if (response.status === 200) {
        await pool.query(
          `INSERT INTO payments (user_id, amount, phone, status, checkout_request_id, merchant_request_id)
               VALUES ($1,$2,$3,'PENDING',$4,$5)
               RETURNING id, status`,
          [user_id, amount, phone, response.data.CheckoutRequestID, response.data.MerchantRequestID]
        );
        await pool.query(
          `UPDATE users
               SET registration_status='PAYMENT_PENDING'
               WHERE id=$1`,
          [user_id]
        );
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.data?.errorMessage || response.data?.ResponseDescription || "Safaricom API Error";
        return { success: false, message: errorMessage, data: response.data };
      }
    } catch (error: any) {
      console.error("STK Push Request Error:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.errorMessage || error.response?.data || error.message;
      return { success: false, message: "Safaricom API Error", data: errorMessage };
    }
  } catch (err: any) {
    console.error("initiateStkPush error:", err);
    return { success: false, message: err?.message || "Internal server error" };
  }
};

async function getAccessToken() {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_SECRET_KEY}`).toString("base64");

  try {
    const response = await axios.get(url, {
      headers: { Authorization: "Basic " + auth }
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error("Access token not found in response");
    }
  } catch (error: any) {
    console.error("Failed to get Safaricom access token:", error.response?.data || error.message);
    throw new Error(`Invalid response from Safaricom API: ${JSON.stringify(error.response?.data || error.message)}`);
  }
}



