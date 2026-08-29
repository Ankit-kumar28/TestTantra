import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { getClubDashboardController, registerClub } from "./club.controller.js";
import { requireClubRole } from "../../middleware/club-authorization.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  registerClub
);


router.get(
  "/:clubId/dashboard",
  authenticate,
  requireClubRole([
    "ADMIN",
    "COORDINATOR"
  ]),
  getClubDashboardController
);
export default router;