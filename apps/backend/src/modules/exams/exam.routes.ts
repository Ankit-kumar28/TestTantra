import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import { requireClubRole } from "../../middleware/club-authorization.middleware.js";

import {
  createExamController,
  getExamsController
} from "./exam.controller.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  requireClubRole(["ADMIN"]),
  createExamController
);

router.get(
  "/",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getExamsController
);

export default router;