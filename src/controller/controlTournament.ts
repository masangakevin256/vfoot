import {Request, Response} from "express";
import { createTournament, getAllTournaments, getTournamentById, updateTournament, deleteTournament } from "../modules/tournaments/tournament";

export const controlCreateTournament = async (req: Request, res: Response) => {
    try {
        const result = await createTournament(req.body);

        if(!result.success){
            return res.status(400).json(result);
        }

        res.status(201).json({
            message: "Tournament created successfully",
            data: result
        });
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

export const controlGetAllTournaments = async (req: Request, res: Response) => {
    try {
        const tournaments = await getAllTournaments();
        res.status(200).json({
            success: true,
            data: tournaments
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export const controlGetTournamentById = async (req: Request, res: Response) => {
    try {
        const tournament = await getTournamentById(req.params.id);
        res.status(200).json({
            success: true,
            data: tournament
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

//update tournament
export const controlUpdateTournament = async (req: Request, res: Response) => {
    try {
        const result = await updateTournament(req.params.id, req.body);

        // If updateTournament returned a structured error object
        if (result && result.success === false) {
            return res.status(400).json(result);
        }
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};


//delete tournament
export const controlDeleteTournament = async (req: Request, res: Response) => {
    try {
        await deleteTournament(req.params.id);
        res.status(200).json({
            success: true,
            message: "Tournament deleted successfully"
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}
