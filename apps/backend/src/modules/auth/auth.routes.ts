import { Router } from "express";

import {
  register,
  login
} from "./auth.controller.js";

import {
  authenticate,
  type AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/me",
  authenticate,
  (req: AuthenticatedRequest, res) => {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        // name: user.name,
      name: req.user.name,
      }
    });
  }
);

export default router;