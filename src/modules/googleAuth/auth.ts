import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { pool } from "../../database/connectDb";
import { JwtPayload } from "../../types/types";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// console.log(process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID not found");

export const googleAuth = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payloadRaw = ticket.getPayload();

    if (!payloadRaw?.email || !payloadRaw.sub) {
      return { success: false, message: "Invalid Google payload" };
    }

    const { email, name, sub: googleId } = payloadRaw;

    // Check if Google account already linked
    const googleUser = await pool.query(
      `SELECT * FROM users WHERE google_id = $1`,
      [googleId]
    );

    let user;

    if (googleUser.rows.length > 0) {
      //Already linked → login
      user = googleUser.rows[0];

    } else {
      //  Check if email exists (local account)
      const emailUser = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      );

      if (emailUser.rows.length > 0) {
        // LINK ACCOUNT
        await pool.query(
          `UPDATE users 
           SET google_id = $1 
           WHERE email = $2`,
          [googleId, email]
        );

        user = emailUser.rows[0];

      } else {
        // Create brand new Google user
        const newUser = await pool.query(
          `INSERT INTO users 
           (username, email, google_id, auth_provider, is_verified, registration_status)
           VALUES ($1, $2, $3, 'GOOGLE', true, 'ACTIVE')
           RETURNING *`,
          [name, email, googleId]
        );

        user = newUser.rows[0];
      }
    }

    // Generate tokens 
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
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
      [refreshToken, user.id]
    );

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        registration_status: user.registration_status
      },
      accessToken,
      refreshToken
    };

  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message };
  }
};