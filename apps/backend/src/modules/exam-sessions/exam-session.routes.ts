import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import { requireClubRole } from "../../middleware/club-authorization.middleware.js";

import {
  createExamSessionController,
  getExamSessionsController,
  getExamSessionController,
  openExamSessionController,
  closeExamSessionController,
  cancelExamSessionController
} from "./exam-session.controller.js";

// const router = Router();

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  requireClubRole(["ADMIN"]),
  createExamSessionController
);
router.get(
  "/",
  authenticate,
  requireClubRole(["ADMIN"]),
  getExamSessionsController
);

router.get(
  "/:sessionId",
  authenticate,
  requireClubRole(["ADMIN"]),
  getExamSessionController
);


router.patch(
  "/:sessionId/open",
  authenticate,
  requireClubRole(["ADMIN"]),
  openExamSessionController
);

router.patch(
  "/:sessionId/close",
  authenticate,
  requireClubRole(["ADMIN"]),
  closeExamSessionController
);

router.patch(
  "/:sessionId/cancel",
  authenticate,
  requireClubRole(["ADMIN"]),
  cancelExamSessionController
);
export default router;