import { jwtPayload } from './../../types/types';
import { pool } from "../../database/connectDb";
import { userSchema, step1SubmissionSchema, step2SubmissionSchema, step3SubmissionSchema , paymentTriggerSchema, paymentConfirmationSchema} from "../../schema/schemaCheck";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser = async (input: unknown) => {
  const parsed = userSchema.pick({
    username: true,
    email: true,
    phone: true,
    password: true
  }).safeParse(input);

  if(!parsed.success){
      const message = parsed.error.issues[0].message;
      return { success: false, message };
  }

  const { username, email, phone, password } = parsed.data;

  try {
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2`,
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return {
        success: false,
        message: "Email or username already exists"
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const results = await pool.query(
      `INSERT INTO users (username, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, registration_status`,
      [username, email, phone, hashedPassword]
    );

    const newUser = results.rows[0];

    const payload: jwtPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = jwt.sign(
      { userInfo: payload },
      process.env.SECRET_ACCESS_TOKEN as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userInfo: payload },
      process.env.SECRET_REFRESH_TOKEN as string,
      { expiresIn: "7d" }
    );

    await pool.query(
      `UPDATE users SET refresh_token = $1 WHERE id = $2`,
      [refreshToken, newUser.id]
    );

    return {
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        registration_status: newUser.registration_status
      },
      accessToken,
      refreshToken
    };

  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      message: err?.message
    };
  }
};


export const submitStep1 = async (input: unknown) => {
  const parsed = step1SubmissionSchema.pick({
    user_id: true,
    team_name: true,
    konami_id: true,
    full_name: true,
    pes_game_name: true
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { user_id, team_name, konami_id, full_name, pes_game_name } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    const result = await pool.query(
      `INSERT INTO registration_profiles 
        (user_id, team_name, konami_id, full_name, pes_game_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         team_name = EXCLUDED.team_name,
         konami_id = EXCLUDED.konami_id,
         full_name = EXCLUDED.full_name,
         pes_game_name = EXCLUDED.pes_game_name
       RETURNING *`,
      [user_id, team_name, konami_id, full_name, pes_game_name]
    );

    await pool.query(
      `UPDATE users SET registration_status = $1 WHERE id = $2`,
      ["STEP_1_COMPLETED", user_id]
    );

    return {
      success: true,
      data: result.rows[0]
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
export const submitStep2 = async (input: unknown) => {
  const parsed = step2SubmissionSchema.pick({
    user_id: true,
    id_back_url: true,
    id_front_url: true,
    nationality: true,
    date_of_birth: true,
    status: true,
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { user_id, id_back_url, id_front_url, nationality, date_of_birth, status } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }
    //check if step one is complete
    if(userCheck.rows[0].registration_status !== "STEP_1_COMPLETED"){
      return { success: false, message: "Step 1 is not completed" };
    }

    const result = await pool.query(
      `INSERT INTO kyc_submissions
        (user_id, id_back_url, id_front_url, nationality, date_of_birth, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         id_back_url = EXCLUDED.id_back_url,
         id_front_url = EXCLUDED.id_front_url,
         nationality = EXCLUDED.nationality,
         date_of_birth = EXCLUDED.date_of_birth,
         status = EXCLUDED.status
       RETURNING *`,
      [user_id, id_back_url, id_front_url, nationality, date_of_birth, status]
    );

    await pool.query(
      `UPDATE users SET registration_status = $1 WHERE id = $2`,
      ["STEP_2_COMPLETED", user_id]
    );

    return {
      success: true,
      data: result.rows[0]
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

export const submitStep3 = async (input: unknown) => {
  const parsed = step3SubmissionSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const {
    user_id,
    county,
    campus_id,
    registration_number,
    year_of_study,
    department,
    invitation_code,
    id_number
  } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT registration_status FROM users WHERE id=$1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    if (userCheck.rows[0].registration_status !== "KYC_APPROVED") {
      return { success: false, message: "KYC must be approved first" };
    }

    const result = await pool.query(
      `UPDATE registration_profiles
       SET county=$1,
           campus_id=$2,
           registration_number=$3,
           year_of_study=$4,
           department=$5,
           invitation_code=$6,
           id_number=$7,
           updated_at=NOW()
       WHERE user_id=$8
       RETURNING *`,
      [
        county,
        campus_id,
        registration_number,
        year_of_study,
        department,
        invitation_code || null,
        id_number,
        user_id
      ]
    );

    await pool.query(
      `UPDATE users
       SET registration_status='STEP_3_COMPLETED'
       WHERE id=$1`,
      [user_id]
    );

    return {
      success: true,
      data: result.rows[0]
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
};


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