import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";

import {
  requireClubRole
} from "../../middleware/club-authorization.middleware";

import {
  createQuestionController,
  getQuestionsController,
  getQuestionController,
  updateQuestionController,
  deleteQuestionController
} from "./question.controller";

const router = Router({ mergeParams: true });
router.post(
  "/",
  authenticate,
  requireClubRole(["ADMIN"]),
  createQuestionController
);

router.get(
  "/",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getQuestionsController
);

router.get(
  "/:questionId",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getQuestionController
);

router.patch(
  "/:questionId",
  authenticate,
  requireClubRole(["ADMIN"]),
  updateQuestionController
);

router.delete(
  "/:questionId",
  authenticate,
  requireClubRole(["ADMIN"]),
  deleteQuestionController
);

export default router;