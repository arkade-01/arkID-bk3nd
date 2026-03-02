import { Request, Response, NextFunction } from "express";
import privyClient from "../config/privyconfig";

// Extend Express Request to include user and multer file information
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
    interface Request {
      user?: {
        userId: string;
      };
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No authorization token provided"
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Privy
    const verifiedToken = await privyClient.verifyAuthToken(token);

    if (!verifiedToken) {
      res.status(401).json({
        success: false,
        message: "Invalid Privy token"
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: verifiedToken.userId
    };

    next();
  } catch (error) {
    console.error("Privy token verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Token verification failed"
    });
    return;
  }
};
