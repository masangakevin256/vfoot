import { Request, Response } from "express";
import { reviewKyc } from "../kyc/reviewKyc";

export const controlReviewKyc = async (req: Request, res: Response) => {
  try {
    // 1 Ensure user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const adminId = req.user.id;
    const { user_id, decision, rejection_reason } = req.body;

    // 2 Basic validation
    if (!user_id || !decision) {
      return res.status(400).json({
        success: false,
        message: "user_id and decision are required"
      });
    }

    if (!["APPROVED", "REJECTED"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be APPROVED or REJECTED"
      });
    }

    const result = await reviewKyc(
      { user_id, decision, rejection_reason },
      adminId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: `KYC ${decision} successfully`,
    //   data: result?.data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};