import { app } from "./app";
import "dotenv/config";
import { pool } from "./database/connectDb";

const PORT = process.env.PORT || 3000;


async function startServer() {
    try {
        await pool.connect();
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (err) {
        console.error("Failed to connect to DB", err);
        process.exit(1);
    }
}

startServer();