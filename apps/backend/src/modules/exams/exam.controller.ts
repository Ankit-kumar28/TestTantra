import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import { createExamSchema } from "./exam.validation.js";
import { createExam,getExams } from "./exam.service.js";


export async function createExamController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  const input = createExamSchema.parse(req.body);

  const exam = await createExam(
    clubId,
    req.user.id,
    input
  );

  return res.status(201).json({
    success: true,
    data: {
      exam
    }
  });
}

export async function getExamsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  const exams = await getExams(clubId);

  return res.status(200).json({
    success: true,
    data: {
      exams
    }
  });
}