"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const userRoutes_1 = require("./userRoutes");
const login_1 = require("./login");
exports.router = express_1.default.Router();
//user routes
exports.router.use('/users', userRoutes_1.userRoutes);
//login routes
exports.router.use('/login', login_1.LoginRouter);
