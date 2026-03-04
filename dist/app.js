"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes/routes");
const logEvents_1 = require("./middleware/logEvents");
const errorLog_1 = require("./middleware/errorLog");
exports.app = (0, express_1.default)();
//custom middlewares
exports.app.use(logEvents_1.logger);
exports.app.use(errorLog_1.logErrors);
//built-in middleware
exports.app.use(express_1.default.json());
exports.app.use("/api/v1", routes_1.router);
