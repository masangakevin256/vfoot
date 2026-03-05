import {pool} from "../database/connectDb";
import {Request, Response} from "express"

export const getCampuses = async ( req: Request, res: Response) => {
    try{
        const results = await pool.query(
            `SELECT id, name , county_code FROM campuses`
        )
        res.status(200).json({success: true, data: results.rows})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }

}