"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCounties = void 0;
const connectDb_1 = require("../database/connectDb");
const getAllCounties = async (req, res) => {
    try {
        const results = await connectDb_1.pool.query(`SELECT county_code, name FROM counties`);
        res.status(200).json({ success: true, data: results.rows });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllCounties = getAllCounties;
