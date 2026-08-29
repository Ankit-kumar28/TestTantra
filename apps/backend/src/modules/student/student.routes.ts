import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import {
  joinClubController,
  getMyClubsController,
  getMyExamsController,
  getStudentExamDetailsController,
  startAttemptController,
  getAttemptQuestionsController,
  saveAnswerController,
  submitAttemptController,
  getAttemptResultController,
  getAttemptReviewController
} from "./student.controller.js";

const router = Router();

router.get(
  "/clubs",
  authenticate,
  getMyClubsController
);

router.get(
  "/exams",
  authenticate,
  getMyExamsController
);

router.get(
  "/exams/:examId",
  authenticate,
  getStudentExamDetailsController
);

router.post(
  "/clubs/:clubId/join",
  authenticate,
  joinClubController
);

router.post(
  "/exams/:examId/sessions/:sessionId/start",
  authenticate,
  startAttemptController
);

router.get(
  "/attempts/:attemptId/questions",
  authenticate,
  getAttemptQuestionsController
);

router.post(
  "/attempts/:attemptId/answers",
  authenticate,
  saveAnswerController
);

router.post(
  "/attempts/:attemptId/submit",
  authenticate,
  submitAttemptController
);


router.get(
  "/attempts/:attemptId/result",
  authenticate,
  getAttemptResultController
);

router.get(
  "/attempts/:attemptId/review",
  authenticate,
  getAttemptReviewController
);
export default router;