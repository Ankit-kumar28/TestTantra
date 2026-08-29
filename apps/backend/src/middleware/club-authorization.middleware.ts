import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";

import { prisma } from "../config/database.js";

export function requireClubRole(
  allowedRoles: Array<"ADMIN" | "COORDINATOR" | "MEMBER">
) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      });
    }

    const clubId = req.params.clubId;
    console.log("Club ID from params:", clubId);

    if (!clubId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CLUB_ID_REQUIRED",
          message: "Club ID is required"
        }
      });
    }

    const membership = await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: req.user.id,
          clubId
        }
      },
      select: {
        role: true,
        status: true,
        club: {
          select: {
            status: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: {
          code: "CLUB_ACCESS_DENIED",
          message: "You are not a member of this club"
        }
      });
    }

    if (membership.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        error: {
          code: "MEMBERSHIP_NOT_ACTIVE",
          message: "Your club membership is not active"
        }
      });
    }

    if (membership.club.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        error: {
          code: "CLUB_NOT_APPROVED",
          message: "This club is not approved"
        }
      });
    }

    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSION",
          message: "You do not have permission for this action"
        }
      });
    }

    next();
  };
}