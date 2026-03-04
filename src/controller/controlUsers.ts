import { pool } from "../database/connectDb";
import  { Request, Response } from "express";
import { User } from "../types/types";
import { registerUser, submitStep1, submitStep2, submitStep3, triggerPayment, confirmPayment } from "../modules/registration/users";
import { googleAuth } from "../modules/googleAuth/auth";


export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const results = await pool.query <User>(
            `SELECT * FROM users`
        );
        const users: User[] = results.rows;
        res.status(200).json({ success: true, data: users });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const registerController = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  //  Set refresh token as HTTP-only cookie
  res.cookie("jwt", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.status(201).json({
    success: true,
    data: result.data,
    accessToken: result.accessToken
  });
};

export const googleAuthController = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "No Google token provided" });
  }

  const result = await googleAuth(idToken);

  if (!result.success) {
    return res.status(401).json(result);
  }

  // Set refresh token cookie
  res.cookie("jwt", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // i will change this in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    user: result.user,
    accessToken: result.accessToken
  });
};

export const controlStepOne = async (req: Request, res: Response) => {
  const user_id = req.user?.id;
  const payload = {...req.body, user_id}
  const result = await submitStep1(payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.status(201).json({
    success: true,
    message: "Successfully submitted step 1",
    data: result.data
  });
};

export const controlStepTwo = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const payload = { ...req.body, user_id };

    const result = await submitStep2(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json({
      success: true,
      message: "Successfully submitted step 2",
      data: result.data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const controlStepThree = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const payload = { ...req.body, user_id };

    const result = await submitStep3(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Successfully submitted step 3",
      data: result.data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const controlTriggerPayment = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const payload = { ...req.body, user_id };

    const result = await triggerPayment(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result.data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const controlConfirmPayment = async (req: Request, res: Response) => {
  try {
    const payload = {
      user_id: req.body.user_id,
      payment_id: req.body.payment_id
    };

    const result = await confirmPayment(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Payment confirmed and user activated"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};