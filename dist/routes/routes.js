"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const verifyRoles_1 = require("../middleware/verifyRoles");
const verifyJwt_1 = require("../middleware/verifyJwt");
const controlUsers_1 = require("../controller/controlUsers");
const mpesa_1 = require("../modules/wallet/mpesa");
const controlLogin_1 = require("../controller/controlLogin");
const controlReviewKyc_1 = require("../controller/controlReviewKyc");
const controlCounties_1 = require("../controller/controlCounties");
const controlCampuses_1 = require("../controller/controlCampuses");
exports.router = express_1.default.Router();
//unprotected routes
exports.router.post('/auth/login/user', controlLogin_1.LoginUser);
exports.router.post('/auth/google', controlUsers_1.googleAuthController);
exports.router.post('/users', controlUsers_1.registerController); //register new user
exports.router.post('/users/admin', controlUsers_1.registerAdminController); //register new admin
//protected routes
exports.router.use(verifyJwt_1.verifyJwt);
exports.router.get('/users', (0, verifyRoles_1.verifyRoles)("ADMIN", "SUPER_ADMIN"), controlUsers_1.getAllUsers);
//registration steps
exports.router.post('/users/step1', (0, verifyRoles_1.verifyRoles)('USER'), controlUsers_1.controlStepOne);
exports.router.post('/users/step2', (0, verifyRoles_1.verifyRoles)('USER'), controlUsers_1.controlStepTwo);
exports.router.post('/users/step3', (0, verifyRoles_1.verifyRoles)('USER'), controlUsers_1.controlStepThree);
exports.router.post('/users/trigger-payment', (0, verifyRoles_1.verifyRoles)('USER'), mpesa_1.controlTriggerPayment);
exports.router.post('/users/confirm-payment', (0, verifyRoles_1.verifyRoles)('USER'), mpesa_1.controlConfirmPayment);
//campuses and counties
exports.router.get("/counties", (0, verifyRoles_1.verifyRoles)("SUPER_ADMIN", "ADMIN", "USER"), controlCounties_1.getAllCounties);
exports.router.get("/campuses", (0, verifyRoles_1.verifyRoles)("SUPER_ADMIN", "ADMIN", "USER"), controlCampuses_1.getCampuses);
//review kyc
exports.router.post('/kyc/review', (0, verifyRoles_1.verifyRoles)("ADMIN", "SUPER_ADMIN"), controlReviewKyc_1.controlReviewKyc);
