import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import clubRoutes from "../modules/clubs/club.routes.js";
import platformRoutes from "../modules/platform/platform.routes.js";
import examRoutes from "../modules/exams/exam.routes.js";
import examSessionRoutes
  from "../modules/exam-sessions/exam-session.routes.js";

import questionRoutes from "../modules/questions/question.routes.js";
import examQuestionRoutes from "../modules/exam-questions/exam-question.routes";


const router = Router();

router.use("/auth", authRoutes);
router.use("/clubs", clubRoutes);
router.use("/platform", platformRoutes);

router.use(
  "/clubs/:clubId/exams",
  examRoutes
);

router.use(
  "/clubs/:clubId/exams/:examId/sessions",
  examSessionRoutes
);

router.use(
  "/clubs/:clubId/questions",
  questionRoutes
);


router.use(
  "/clubs/:clubId/exams/:examId/sessions/:sessionId/questions",
  examQuestionRoutes
);


export default router;