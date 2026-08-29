import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";

import { prisma } from "../config/database.js";

export async function requirePlatformAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    },
    select: {
      isPlatformAdmin: true
    }
  });

  if (!user?.isPlatformAdmin) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Platform admin access required"
      }
    });
  }

  next();
}