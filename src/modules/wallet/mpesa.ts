import { Request, Response } from "express";
import { triggerPayment, confirmPayment } from "../payments/mpesaServices";

export const controlTriggerPayment = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const payload = { ...req.body, user_id };

    const result = await triggerPayment(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: result.data
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const controlConfirmPayment = async (req: Request, res: Response) => {
  try {
    const payload = {
      user_id: req.body.user_id,
      payment_id: req.body.payment_id
    };

    const result = await confirmPayment(payload);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Payment confirmed and user activated"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};