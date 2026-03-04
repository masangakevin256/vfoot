"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = void 0;
const connectDb_1 = require("../database/connectDb");
const getAllUsers = async (req, res) => {
    try {
        const results = await connectDb_1.pool.query(`SELECT * FROM users`);
        res.status(200).json({ success: true, data: results.rows });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getAllUsers = getAllUsers;
