"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlCorsOption = void 0;
const whiteList_1 = require("../config/whiteList");
exports.controlCorsOption = {
    origin: (origin, callback) => {
        if (whiteList_1.allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
