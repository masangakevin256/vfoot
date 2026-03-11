import { pool } from "../database/connectDb";
import  { Request, Response } from "express";
import { User } from "../types/types";
import { registerUser, submitStep1, submitStep2, submitStep3, } from "../modules/registration/users";
import { googleAuth } from "../modules/googleAuth/auth";
import { success } from "zod";


export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const results = await pool.query <User>(
            `SELECT id, username, email, phone, role, registration_status, is_verified, created_at, updated_at FROM users`
        );
        const users: User[] = results.rows;
        res.status(200).json({ success: true, data: users });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
//for normal users
export const registerController = async (req: Request, res: Response) => {
  const result = await registerUser(req.body, false);

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

//for admins
export const registerAdminController = async (req: Request, res: Response) => {
  const result = await registerUser(req.body, true); // 'true' = admin request

  if (!result.success) {
    return res.status(400).json(result);
  }

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
export const getUserById = async (req: Request, res: Response) => {
  const user = req.user;
  const {id} = req.params;

  try{
    if(user && user.role === "USER"){
      if(user.id !== id){
          return res.status(403).json({
            success: false,
            message: "Unauthorize"
          })
        }
    }


    const result = await pool.query(
      `SELECT 
            id, username, email, phone, 
            role, registration_status, is_verified, 
            created_at, updated_at FROM users  
             WHERE id = $1
      `,
      [id]
    )

    if(result.rows.length === 0){
      return res.status(404).json({
        success: false,
        message: "User not found"
      })

      
    }
    res.status(200).json({
      success: true,
      data: result.rows[0]
    })


  }catch(error: any){
    res.status(500).json({
      success: false,
      error: error?.message
    })
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const loggedInUser = req.user; // the one making the request
  const { id } = req.params;     // the target user to delete

  try {
    // First, fetch the target user
    const targetResult = await pool.query(
      `SELECT id, role FROM users WHERE id = $1`,
      [id]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    const targetUser = targetResult.rows[0];

    // Role-based deletion logic
    if ( loggedInUser && loggedInUser.role === "USER") {
      // Normal users can only delete themselves
      if (loggedInUser && loggedInUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: you can only delete your own account",
        });
      }
    } else if (loggedInUser && loggedInUser.role === "ADMIN") {
      // Admins can delete themselves or normal users
      if (loggedInUser.id !== id && targetUser.role !== "USER") {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: admins cannot delete other admins or super admins",
        });
      }
    } 

    // Perform deletion
    const deleteResult = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deleteResult.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};





