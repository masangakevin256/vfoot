"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRouter = void 0;
const express_1 = __importDefault(require("express"));
const controlLogin_1 = require("../controller/controlLogin");
exports.LoginRouter = express_1.default.Router();
exports.LoginRouter.post("/auth/user", controlLogin_1.LoginUser);
