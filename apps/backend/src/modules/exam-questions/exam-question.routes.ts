import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import {
  requireClubRole
} from "../../middleware/club-authorization.middleware.js";

import {
  createExamQuestionController,
  getExamQuestionsController,
  updateExamQuestionController,
  deleteExamQuestionController
} from "./exam-question.controller.js";
const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  requireClubRole(["ADMIN"]),
  createExamQuestionController
);

router.get(
  "/",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getExamQuestionsController
);

router.patch(
  "/:examQuestionId",
  authenticate,
  requireClubRole(["ADMIN"]),
  updateExamQuestionController
);

router.delete(
  "/:examQuestionId",
  authenticate,
  requireClubRole(["ADMIN"]),
  deleteExamQuestionController
);

export default router;