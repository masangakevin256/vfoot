import {pool } from "../database/connectDb";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtPayload, loginPlayLoad } from "../types/types";
import { success } from "zod";



export const LoginUser = async (req: Request, res: Response) => {
    const {email, password} = req.body as loginPlayLoad;

    if(!email || !password){
        return res.status(400).json({success: false, message: "Email and password are required"});
    }

    try {
        const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if(user.rows.length === 0){
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if(!validPassword){
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }
         //I will send an email for this part
        // if(user.rows[0].is_verified === false){
        //     return res.status(403).json({
        //         success: false,
        //         message: "Please verify your email to log in"
        //     })
        // }

    

        const playLoad : jwtPayload = {
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email,
            role: user.rows[0].role
        }

        const accessToken = jwt.sign(
              { userInfo: playLoad },
              process.env.SECRET_ACCESS_TOKEN as string,
              { expiresIn: "15m" }
            );
        
            const refreshToken = jwt.sign(
              { userInfo: playLoad },
              process.env.SECRET_REFRESH_TOKEN as string,
              { expiresIn: "7d" }
            );

        //update user refresh token in db
        await pool.query(
            `UPDATE users SET refresh_token = $1 WHERE id = $2`,
            [refreshToken, user.rows[0].id]
        );

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json(
            {
                success: true,
                message: "Login successful",
                accessToken,
                // refreshToken
            }

        )
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
    
}