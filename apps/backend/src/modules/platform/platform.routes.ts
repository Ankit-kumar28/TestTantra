import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePlatformAdmin } from "../../middleware/platform-admin.middleware.js";

import {
  approveClubController,
  rejectClubController,
  suspendClubController,
  restoreClubController,
  listClubsController,
  getClubDetailsController,
    getPlatformOverviewController
} from "./platform.controller.js";

const router = Router();

router.patch(
  "/clubs/:clubId/approve",
  authenticate,
  requirePlatformAdmin,
  approveClubController
);

router.patch(
  "/clubs/:clubId/reject",
  authenticate,
  requirePlatformAdmin,
  rejectClubController
);

router.patch(
  "/clubs/:clubId/suspend",
  authenticate,
  requirePlatformAdmin,
  suspendClubController
);

router.patch(
  "/clubs/:clubId/restore",
  authenticate,
  requirePlatformAdmin,
  restoreClubController
);

router.get(
  "/clubs",
  authenticate,
  requirePlatformAdmin,
  listClubsController
);

router.get(
  "/clubs/:clubId",
  authenticate,
  requirePlatformAdmin,
  getClubDetailsController
);

router.get(
  "/analytics/overview",
  authenticate,
  requirePlatformAdmin,
  getPlatformOverviewController
);




export default router;