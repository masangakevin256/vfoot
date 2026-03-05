"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampuses = void 0;
const connectDb_1 = require("../database/connectDb");
const getCampuses = async (req, res) => {
    try {
        const results = await connectDb_1.pool.query(`SELECT id, name , county_code FROM campuses`);
        res.status(200).json({ success: true, data: results.rows });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getCampuses = getCampuses;
