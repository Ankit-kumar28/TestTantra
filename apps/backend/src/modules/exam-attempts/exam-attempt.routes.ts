import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { requireClubRole } from "../../middleware/club-authorization.middleware.js";

import {
  getExamAnalyticsController,
  getExamAttemptDetailsController,
  getExamAttemptsController,
  getExamLeaderboardController,
  getQuestionAnalyticsController,
  getSessionAnalyticsController,
  getStudentPerformanceController
} from "./exam-attempt.controller.js";

const router = Router({
  mergeParams: true
});

// =========================
// Exam Attempts
// =========================

router.get(
  "/exams/:examId/attempts",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getExamAttemptsController
);

router.get(
  "/exams/:examId/attempts/:attemptId",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getExamAttemptDetailsController
);

// =========================
// Exam Analytics
// =========================

router.get(
  "/exams/:examId/analytics",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getExamAnalyticsController
);

router.get(
  "/exams/:examId/analytics/sessions",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getSessionAnalyticsController
);

router.get(
  "/exams/:examId/analytics/questions",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getQuestionAnalyticsController
);

// =========================
// Student Performance
// =========================

router.get(
  "/students/:studentId/performance",
  authenticate,
  requireClubRole(["ADMIN", "COORDINATOR"]),
  getStudentPerformanceController
);



router.get(
  "/exams/:examId/leaderboard",
  authenticate,
  requireClubRole([
    "ADMIN",
    "COORDINATOR"
  ]),
  getExamLeaderboardController
);

export default router;