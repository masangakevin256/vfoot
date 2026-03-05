"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlStepThree = exports.controlStepTwo = exports.controlStepOne = exports.googleAuthController = exports.registerAdminController = exports.registerController = exports.getAllUsers = void 0;
const connectDb_1 = require("../database/connectDb");
const users_1 = require("../modules/registration/users");
const auth_1 = require("../modules/googleAuth/auth");
const getAllUsers = async (req, res) => {
    try {
        const results = await connectDb_1.pool.query(`SELECT id, username, email, phone, role, registration_status, is_verified, created_at, updated_at FROM users`);
        const users = results.rows;
        res.status(200).json({ success: true, data: users });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getAllUsers = getAllUsers;
//for normal users
const registerController = async (req, res) => {
    const result = await (0, users_1.registerUser)(req.body, false);
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
//for admins
const registerAdminController = async (req, res) => {
    const result = await (0, users_1.registerUser)(req.body, true); // 'true' = admin request
    if (!result.success) {
        return res.status(400).json(result);
    }
    return res.status(201).json({
        success: true,
        data: result.data,
        accessToken: result.accessToken
    });
};
exports.registerAdminController = registerAdminController;
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
const controlStepOne = async (req, res) => {
    const user_id = req.user?.id;
    const payload = { ...req.body, user_id };
    const result = await (0, users_1.submitStep1)(payload);
    if (!result.success) {
        return res.status(400).json(result);
    }
    return res.status(201).json({
        success: true,
        message: "Successfully submitted step 1",
        data: result.data
    });
};
exports.controlStepOne = controlStepOne;
const controlStepTwo = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const payload = { ...req.body, user_id };
        const result = await (0, users_1.submitStep2)(payload);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json({
            success: true,
            message: "Successfully submitted step 2",
            data: result.data
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
exports.controlStepTwo = controlStepTwo;
const controlStepThree = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const payload = { ...req.body, user_id };
        const result = await (0, users_1.submitStep3)(payload);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json({
            success: true,
            message: "Successfully submitted step 3",
            data: result.data
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
exports.controlStepThree = controlStepThree;
