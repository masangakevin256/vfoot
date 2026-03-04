"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthController = exports.registerController = exports.getAllUsers = void 0;
const connectDb_1 = require("../database/connectDb");
const users_1 = require("../modules/registration/users");
const auth_1 = require("../modules/googleAuth/auth");
const getAllUsers = async (req, res) => {
    try {
        const results = await connectDb_1.pool.query(`SELECT * FROM users`);
        const users = results.rows;
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getAllUsers = getAllUsers;
const registerController = async (req, res) => {
    const result = await (0, users_1.registerUser)(req.body);
    if (!result.success) {
        return res.status(400).json(result);
    }
    //  Set refresh token as HTTP-only cookie
    res.cookie("jwt", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.status(201).json({
        success: true,
        data: result.data,
        accessToken: result.accessToken
    });
};
exports.registerController = registerController;
const googleAuthController = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ message: "No Google token provided" });
    }
    const result = await (0, auth_1.googleAuth)(idToken);
    if (!result.success) {
        return res.status(401).json(result);
    }
    // Set refresh token cookie
    res.cookie("jwt", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // i will change this in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
        user: result.user,
        accessToken: result.accessToken
    });
};
exports.googleAuthController = googleAuthController;
