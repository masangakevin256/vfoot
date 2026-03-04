"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connectDb_1 = require("../../database/connectDb");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// console.log(process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID not found");
const googleAuth = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.sub) {
            return { success: false, message: "Invalid Google payload" };
        }
        const { email, name, sub: googleId } = payload;
        // Check if Google account already linked
        const googleUser = await connectDb_1.pool.query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
        let user;
        if (googleUser.rows.length > 0) {
            //Already linked → login
            user = googleUser.rows[0];
        }
        else {
            //  Check if email exists (local account)
            const emailUser = await connectDb_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
            if (emailUser.rows.length > 0) {
                // LINK ACCOUNT
                await connectDb_1.pool.query(`UPDATE users 
           SET google_id = $1 
           WHERE email = $2`, [googleId, email]);
                user = emailUser.rows[0];
            }
            else {
                // Create brand new Google user
                const newUser = await connectDb_1.pool.query(`INSERT INTO users 
           (username, email, google_id, auth_provider, is_verified, registration_status)
           VALUES ($1, $2, $3, 'GOOGLE', true, 'ACTIVE')
           RETURNING *`, [name, email, googleId]);
                user = newUser.rows[0];
            }
        }
        // Generate tokens 
        const jwtPayload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        const accessToken = jsonwebtoken_1.default.sign({ userInfo: jwtPayload }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: "15m" });
        const refreshToken = jsonwebtoken_1.default.sign({ userInfo: jwtPayload }, process.env.SECRET_REFRESH_TOKEN, { expiresIn: "7d" });
        await connectDb_1.pool.query(`UPDATE users SET refresh_token = $1 WHERE id = $2`, [refreshToken, user.id]);
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                registration_status: user.registration_status
            },
            accessToken,
            refreshToken
        };
    }
    catch (err) {
        console.error(err);
        return { success: false, message: err?.message };
    }
};
exports.googleAuth = googleAuth;
