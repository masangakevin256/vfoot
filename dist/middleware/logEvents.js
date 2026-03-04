"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.logEvents = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const logEvents = async (message, fileName) => {
    const dateTime = `${Date.now()}`;
    const logItem = `${dateTime}: ${message}\n`;
    const logDir = path_1.default.join(__dirname, "..", "..", "logs");
    try {
        if (!fs_1.default.existsSync(logDir)) {
            await promises_1.default.mkdir(logDir);
        }
        await promises_1.default.appendFile(path_1.default.join(logDir, fileName), logItem);
    }
    catch (err) {
        console.log(err);
    }
};
exports.logEvents = logEvents;
const logger = (req, res, next) => {
    (0, exports.logEvents)(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method}: ${req.path}: ${req.url}`);
    next();
};
exports.logger = logger;
