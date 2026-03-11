import { Request, Response } from "express";
import { createLeague, updateLeague, getLeagueById, deleteLeague } from "../modules/leagues/leagues";
import { pool } from "../database/connectDb";

export const createLeagueController = async (req: Request, res: Response) => {
    try {
        const { title, campus_id, category, season, year, status, start_date, end_date, max_players } = req.body;

        const league = await createLeague({ title, campus_id, category, season, year, status, start_date, end_date, max_players });

        if (!league.success) {
            return res.status(400).json(league);
        }

        res.status(201).json(league);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create league"
        });
    }
}


export const getAllLeagues = async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM leagues`);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No leagues found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Leagues retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve leagues"
        });
    }
}

export const updateLeagueController = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { title, campus_id, category, season, year, status, start_date, end_date, max_players } = req.body;

        const league = await updateLeague({ id, title, campus_id, category, season, year, status, start_date, end_date, max_players });

        if (!league.success) {
            return res.status(400).json(league);
        }

        res.status(201).json(league);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update league"
        });
    }
}

export const getLeagueByIdController = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const league = await getLeagueById(id);

        if (!league.success) {
            return res.status(400).json(league);
        }

        res.status(200).json(league);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve league"
        });
    }
}

export const deleteLeagueController = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const league = await deleteLeague(id);

    if (!league.success) {
        return res.status(404).json(league);
    }

    res.status(200).json(league);
}
