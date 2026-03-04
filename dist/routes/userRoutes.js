"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controlUsers_1 = require("../controller/controlUsers");
exports.userRoutes = express_1.default.Router();
exports.userRoutes.get('/', controlUsers_1.getAllUsers);
exports.userRoutes.post('/', controlUsers_1.registerController);
exports.userRoutes.post("/auth/google", controlUsers_1.googleAuthController);
