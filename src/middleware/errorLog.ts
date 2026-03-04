import { logEvents } from "./logEvents";
import { Request, Response, NextFunction } from "express";

export const logErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
    console.log(`${err.name}: ${err.message}`);
    next();
}