"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlConfirmPayment = exports.controlTriggerPayment = void 0;
const mpesaServices_1 = require("../payments/mpesaServices");
const controlTriggerPayment = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const payload = { ...req.body, user_id };
        const result = await (0, mpesaServices_1.triggerPayment)(payload);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: result.data
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
exports.controlTriggerPayment = controlTriggerPayment;
const controlConfirmPayment = async (req, res) => {
    try {
        const payload = {
            user_id: req.body.user_id,
            payment_id: req.body.payment_id
        };
        const result = await (0, mpesaServices_1.confirmPayment)(payload);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json({
            success: true,
            message: "Payment confirmed and user activated"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
exports.controlConfirmPayment = controlConfirmPayment;
