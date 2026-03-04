"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const connectDb_1 = require("../../database/connectDb");
const schemaCheck_1 = require("../../schema/schemaCheck");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (input) => {
    const parsed = schemaCheck_1.userSchema.pick({
        username: true,
        email: true,
        phone: true,
        password: true
    }).safeParse(input);
    if (!parsed.success) {
        const message = parsed.error.issues[0].message;
        return { success: false, message };
    }
    const { username, email, phone, password } = parsed.data;
    try {
        const existingUser = await connectDb_1.pool.query(`SELECT id FROM users WHERE email = $1 OR username = $2`, [email, username]);
        if (existingUser.rows.length > 0) {
            return {
                success: false,
                message: "Email or username already exists"
            };
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const results = await connectDb_1.pool.query(`INSERT INTO users (username, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, registration_status`, [username, email, phone, hashedPassword]);
        const newUser = results.rows[0];
        const payload = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        };
        const accessToken = jsonwebtoken_1.default.sign({ userInfo: payload }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ userInfo: payload }, process.env.SECRET_REFRESH_TOKEN, { expiresIn: "7d" });
        await connectDb_1.pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [refreshToken, newUser.id]);
        return {
            success: true,
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                registration_status: newUser.registration_status
            },
            accessToken,
            refreshToken
        };
    }
    catch (err) {
        console.error(err);
        return {
            success: false,
            message: err?.message
        };
    }
};
exports.registerUser = registerUser;
