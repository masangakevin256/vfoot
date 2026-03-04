"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJwt = (req, res, next) => {
    const authHeader = (req.headers.authorization || req.headers.Authorization);
    if (!authHeader)
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Invalid token format"
        });
    }
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    jsonwebtoken_1.default.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
        if (err)
            return res.status(401).json({
                success: false,
                message: "Failed to verify token"
            });
        const payload = decoded;
        req.user = payload.userInfo;
        next();
    });
};
exports.verifyJwt = verifyJwt;
