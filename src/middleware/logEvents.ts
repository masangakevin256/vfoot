import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { Request, Response, NextFunction } from "express";
import {format} from "date-fns";


export const logEvents = async (message: string, fileName: string) => {
    const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
    const logItem = `${dateTime}: ${message}\n`;
    const logDir = path.join(__dirname, "..",".." ,"logs");

    try {
        if (!fs.existsSync(logDir)) {
            await fsPromises.mkdir(logDir);
        }
        await fsPromises.appendFile(path.join(logDir, fileName), logItem);
    } catch (err) {
        console.log(err);
    }
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method}: ${req.path}`);
    next();
}

