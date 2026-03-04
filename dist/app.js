"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./routes/routes");
const logEvents_1 = require("./middleware/logEvents");
const errorLog_1 = require("./middleware/errorLog");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const controlCorsOption_1 = require("./controller/controlCorsOption");
const cors_1 = __importDefault(require("cors"));
exports.app = (0, express_1.default)();
//custom middlewares
exports.app.use(logEvents_1.logger);
exports.app.use((0, cors_1.default)(controlCorsOption_1.controlCorsOption));
//built-in middleware
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/api/v1/", routes_1.router);
//for error log
exports.app.use(errorLog_1.logErrors);
//for routes that don't exist
exports.app.all(/.*/, (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile("/views/404.html", { root: __dirname });
    }
    else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    }
    else {
        res.type("txt").send("404 Not Found");
    }
});
//in local auth we used is_verified false and registration status to be not_started, but in google auth we used is_vrified to be true, and registration_status- active, why
