import { Request, Response, NextFunction } from "express";

// Roles can be passed as parameters
export const verifyRoles = (...allowedRoles: ("USER" | "ADMIN" | "SUPER_ADMIN")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};