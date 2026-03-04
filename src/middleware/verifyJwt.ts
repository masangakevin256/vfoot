import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { success } from "zod";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: "USER" | "ADMIN" | "SUPER_ADMIN";
      };
    }
  }
}

export const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;

  if (!authHeader) return res.status(401).json({ 
    success: false,
    message: "No token provided" 
  });

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token format"
     });
  }

  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ 
    success: false,
    message: "No token provided" 
  });

  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN as string, (err, decoded) => {
    if (err) return res.status(401).json({ 
      success: false,
      message: "Failed to verify token"
     });

  
    const payload = decoded as { userInfo: { id: string; username: string; email: string; role: "USER" | "ADMIN" | "SUPER_ADMIN" } };
    req.user = payload.userInfo;

    next();
  });
};