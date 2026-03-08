import { JwtPayload } from './../../types/types';
import { pool } from "../../database/connectDb";
import { userSchema, step1SubmissionSchema, step2SubmissionSchema, step3SubmissionSchema } from "../../schema/schemaCheck";
import { formatZodError } from "../../utils/formatZodError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser = async (input: unknown, isAdminRequest = false) => {
  const parsed = userSchema.pick({
    username: true,
    email: true,
    phone: true,
    password: true,
    role: true, // optional, only used for admin requests
    secret_code: true // for admin verification
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: formatZodError(parsed.error) };
  }

  let { username, email, phone, password, role, secret_code } = parsed.data;

  try {
    // Check if user exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2 OR phone = $3`,
      [email, username, phone]
    );

    if (existingUser.rows.length > 0) {
      return { success: false, message: "Email or username or phone already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // --------- ADMIN LOGIC ----------
    let finalRole: "USER" | "ADMIN" | "SUPER_ADMIN" = "USER";

    if (isAdminRequest) {
      // Must provide the secret code
      if (secret_code !== process.env.secretRegistrationNumber) {
        return { success: false, message: "Invalid secret code for admin registration" };
      }

      if (!role || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
        return { success: false, message: "Invalid role for admin creation" };
      }

      // Check limits
      if (role === "SUPER_ADMIN") {
        const superAdminCheck = await pool.query(`SELECT id FROM users WHERE role='SUPER_ADMIN'`);
        if (superAdminCheck.rows.length > 0) {
          return { success: false, message: "SUPER_ADMIN already exists" };
        }
      }

      if (role === "ADMIN") {
        const adminCheck = await pool.query(`SELECT id FROM users WHERE role='ADMIN'`);
        if (adminCheck.rows.length >= 5) {
          return { success: false, message: "Maximum 5 ADMIN users allowed" };
        }
      }

      finalRole = role;
    }

    // Insert user
    const results = await pool.query(
      `INSERT INTO users (username, email, phone, password_hash, role, is_verified, registration_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, username, email, role, registration_status`,
      [username, email, phone, hashedPassword, finalRole, finalRole !== "USER", finalRole !== "USER" ? "ACTIVE" : "NOT_STARTED"]
    );

    const newUser = results.rows[0];

    // JWT payload
    const payload: JwtPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };

    const accessToken = jwt.sign({ userInfo: payload }, process.env.SECRET_ACCESS_TOKEN!, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userInfo: payload }, process.env.SECRET_REFRESH_TOKEN!, { expiresIn: "7d" });

    await pool.query(`UPDATE users SET refresh_token=$1 WHERE id=$2`, [refreshToken, newUser.id]);

    return {
      success: true,
      data: newUser,
      accessToken,
      refreshToken
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
};


export const submitStep1 = async (input: unknown) => {
  const parsed = step1SubmissionSchema.pick({
    user_id: true,
    team_name: true,
    konami_id: true,
    full_name: true,
    pes_game_name: true,
    konami_username: true
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: formatZodError(parsed.error) };
  }

  const { user_id, team_name, konami_id, full_name, pes_game_name, konami_username } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    // console.log(userCheck.rows[0]);

    const result = await pool.query(
      `INSERT INTO registration_profiles 
        (user_id, team_name, konami_id, full_name, pes_game_name, konami_username)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET
         team_name = EXCLUDED.team_name,
         konami_id = EXCLUDED.konami_id,
         full_name = EXCLUDED.full_name,
         pes_game_name = EXCLUDED.pes_game_name,
         konami_username = EXCLUDED.konami_username
       RETURNING *`,
      [user_id, team_name, konami_id, full_name, pes_game_name, konami_username]
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
    selfie_url: true,
    nationality: true,
    date_of_birth: true,
    status: true,
  }).safeParse(input);

  if (!parsed.success) {
    return { success: false, message: formatZodError(parsed.error) };
  }

  const { user_id, id_back_url, id_front_url, nationality, date_of_birth, status, selfie_url } = parsed.data;

  try {
    const userCheck = await pool.query(
      `SELECT id, registration_status  FROM users WHERE id = $1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      return { success: false, message: "User not found" };
    }
    //check if step one is complete
    if (userCheck.rows[0].registration_status !== "STEP_1_COMPLETED") {
      return { success: false, message: "Step 1 is not completed" };
    }

    const result = await pool.query(
      `INSERT INTO kyc_submissions
        (user_id, id_back_url, id_front_url, selfie_url,nationality, date_of_birth, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         id_back_url = EXCLUDED.id_back_url,
         id_front_url = EXCLUDED.id_front_url,
         nationality = EXCLUDED.nationality,
         selfie_url = EXCLUDED.selfie_url,
         date_of_birth = EXCLUDED.date_of_birth,
         status = EXCLUDED.status
       RETURNING *`,
      [user_id, id_back_url, id_front_url, selfie_url, nationality, date_of_birth, status]
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
    return {
      success: false,
      message: formatZodError(parsed.error)
    };
  }

  const {
    user_id,
    county_code,
    campus_id,
    registration_number,
    year_of_study,
    department,
    invitation_code,
    id_number
  } = parsed.data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* ------------------ CHECK USER ------------------ */

    const userCheck = await client.query(
      `SELECT id, registration_status FROM users WHERE id=$1`,
      [user_id]
    );

    if (userCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "User not found" };
    }

    if (userCheck.rows[0].registration_status !== "KYC_APPROVED") {
      await client.query("ROLLBACK");
      return { success: false, message: "KYC not approved yet" };
    }

    /* ------------------ CHECK KYC ------------------ */

    const kycCheck = await client.query(
      `SELECT status FROM kyc_submissions WHERE user_id=$1`,
      [user_id]
    );

    if (kycCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "KYC not submitted" };
    }

    if (kycCheck.rows[0].status !== "APPROVED") {
      await client.query("ROLLBACK");
      return { success: false, message: "KYC not approved yet" };
    }

    /* ------------------ VALIDATE CAMPUS + COUNTY ------------------ */

    const campusCheck = await client.query(
      `SELECT id FROM campuses
       WHERE id=$1 AND county_code=$2`,
      [campus_id, county_code]
    );

    if (campusCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Campus does not belong to selected county"
      };
    }

    /* ------------------ UPDATE PROFILE ------------------ */

    const result = await client.query(
      `UPDATE registration_profiles
       SET county_code=$1,
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
        county_code,
        campus_id,
        registration_number,
        year_of_study,
        department,
        invitation_code || null,
        id_number,
        user_id
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Registration profile not found" };
    }

    /* ------------------ UPDATE USER STEP ------------------ */

    await client.query(
      `UPDATE users
       SET registration_status='STEP_3_COMPLETED',
           updated_at=NOW()
       WHERE id=$1`,
      [user_id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      data: result.rows[0]
    };

  } catch (err: any) {
    await client.query("ROLLBACK");
    return { success: false, message: err.message };

  } finally {
    client.release();
  }
};


