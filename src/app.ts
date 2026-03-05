import express, { Request, Response } from "express";
import path from "path";
import { router } from "./routes/routes";
import { logger } from "./middleware/logEvents";
import { logErrors } from "./middleware/errorLog";
import cookieParser from "cookie-parser";
import { controlCorsOption } from "./controller/controlCorsOption";
import cors from "cors";

export const app = express();
//custom middlewares
app.use(logger);
app.use(cors(controlCorsOption));

//built-in middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use("/api/v1/", router);

//for error log
app.use(logErrors);
//for routes that don't exist
app.all(/.*/, (req: Request, res: Response) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile("/views/404.html", { root: __dirname });
    } else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    } else {
        res.type("txt").send("404 Not Found");
    }
});



