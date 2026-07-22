import { Request, Response, NextFunction } from "express";
import { config } from "../config/config";

// Must run after authMiddleware, which populates req.user from the verified Privy token
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.user?.userId;

  if (!userId || !config.ADMIN_USER_IDS.includes(userId)) {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
};
