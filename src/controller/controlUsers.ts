import { pool } from "../database/connectDb";
import  { Request, Response } from "express";


export const getAllUsers = async (req: Request, res: Response) => {
    try{
        const results = await pool.query(
            `SELECT * FROM users`
        );
        res.status(200).json({ success: true, data: results.rows });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}