"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
require("dotenv/config");
const connectDb_1 = require("./database/connectDb");
const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await connectDb_1.pool.connect();
        app_1.app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    }
    catch (err) {
        console.error("Failed to connect to DB", err);
        process.exit(1);
    }
}
startServer();
