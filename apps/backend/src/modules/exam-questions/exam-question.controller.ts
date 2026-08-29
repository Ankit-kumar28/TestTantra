import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware.js";

import {
  createExamQuestionSchema,
  updateExamQuestionSchema
} from "./exam-question.validation.js";

import {
  createExamQuestion,
  getExamQuestions,
  updateExamQuestion,
  deleteExamQuestion
} from "./exam-question.service.js";

export async function createExamQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId,
    sessionId
  } = req.params;

  // Validate params
  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  // Check authentication
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  // Validate request body
  const input =
    createExamQuestionSchema.parse(req.body);

  // Assign question to session
  const examQuestion =
    await createExamQuestion(
      clubId,
      examId,
      sessionId,
      input
    );

  return res.status(201).json({
    success: true,
    data: {
      examQuestion
    }
  });
}


export async function getExamQuestionsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId,
    sessionId
  } = req.params;

  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  const result = await getExamQuestions(
    clubId,
    examId,
    sessionId
  );

  return res.status(200).json({
    success: true,
    data: result
  });
}



export async function updateExamQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId,
    sessionId,
    examQuestionId
  } = req.params;

  if (
    !clubId ||
    !examId ||
    !sessionId ||
    !examQuestionId
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Required parameters are missing"
      }
    });
  }

  const input =
    updateExamQuestionSchema.parse(req.body);

  const examQuestion =
    await updateExamQuestion(
      clubId,
      examId,
      sessionId,
      examQuestionId,
      input
    );

  return res.status(200).json({
    success: true,
    data: {
      examQuestion
    }
  });
}



export async function deleteExamQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId,
    sessionId,
    examQuestionId
  } = req.params;

  if (
    !clubId ||
    !examId ||
    !sessionId ||
    !examQuestionId
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Required parameters are missing"
      }
    });
  }

  await deleteExamQuestion(
    clubId,
    examId,
    sessionId,
    examQuestionId
  );

  return res.status(200).json({
    success: true,
    message:
      "Question removed from session successfully"
  });
}