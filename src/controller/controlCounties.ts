import {pool} from "../database/connectDb";
import {Request, Response} from "express"

export const getAllCounties = async ( req: Request, res: Response) => {
    try{
        const results = await pool.query(
            `SELECT county_code, name FROM counties`
        )
        res.status(200).json({success: true, data: results.rows})
    }catch(err: any){
        res.status(500).json({success: false, message: err.message})
    }

}