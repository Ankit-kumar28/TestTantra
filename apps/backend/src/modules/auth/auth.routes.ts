import { Router } from "express";

import {
  register,
  login
} from "./auth.controller.js";

import {
  authenticate,
  type AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import { prisma } from "../../config/database.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/me",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          isPlatformAdmin: true,
          memberships: {
            include: { club: true }
          }
        }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } });
      }

      const formattedUser = {
        ...user,
        clubMemberships: user.memberships
      };

      res.status(200).json({
        success: true,
        data: { user: formattedUser }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } });
    }
  }
);

export default router;