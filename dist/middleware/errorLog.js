"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logErrors = void 0;
const logEvents_1 = require("./logEvents");
const logErrors = (err, req, res, next) => {
    (0, logEvents_1.logEvents)(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
    console.log(`${err.name}: ${err.message}`);
    next();
};
exports.logErrors = logErrors;
