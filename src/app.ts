import express  from "express";
import { router } from "./routes/routes";
import { logger } from "./middleware/logEvents";
import { logErrors } from "./middleware/errorLog";

export const app = express();
//custom middlewares
app.use(logger);
app.use(logErrors);
//built-in middleware
app.use(express.json());

app.use("/api/v1/", router);