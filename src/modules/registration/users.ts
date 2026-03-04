import { jwtPayload } from './../../types/types';
import { pool } from "../../database/connectDb";
import { userSchema } from "../../schema/schemaCheck";
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