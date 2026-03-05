"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlReviewKyc = void 0;
const reviewKyc_1 = require("../kyc/reviewKyc");
const controlReviewKyc = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { user_id, decision, rejection_reason } = req.body;
        // Validation
        if (!user_id || !decision) {
            return res.status(400).json({ success: false, message: "user_id and decision are required" });
        }
        if (!["APPROVED", "REJECTED"].includes(decision)) {
            return res.status(400).json({ success: false, message: "Decision must be APPROVED or REJECTED" });
        }
        // Call review function
        const result = await (0, reviewKyc_1.reviewKyc)({ user_id, decision, rejection_reason }, adminId);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json({
            success: true,
            message: `KYC ${decision} successfully`,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message,
        });
    }
};
exports.controlReviewKyc = controlReviewKyc;
