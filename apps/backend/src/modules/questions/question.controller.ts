import type { Response } from "express";

import type {
  AuthenticatedRequest
} from "../../middleware/auth.middleware";

import {
  createQuestionSchema,
  updateQuestionSchema
} from "./question.validation";

import {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion
} from "./question.service";



export async function createQuestionController(
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

  const input =
    createQuestionSchema.parse(req.body);

  const question =
    await createQuestion(
      clubId,
      req.user.id,
      input
    );

  return res.status(201).json({
    success: true,
    data: {
      question
    }
  });
}

export async function getQuestionsController(
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

  const questions =
    await getQuestions(clubId);

  return res.status(200).json({
    success: true,
    data: {
      questions
    }
  });
}


export async function getQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    questionId
  } = req.params;

  if (!clubId || !questionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Question ID are required"
      }
    });
  }

  const question =
    await getQuestion(
      clubId,
      questionId
    );

  return res.status(200).json({
    success: true,
    data: {
      question
    }
  });
}



export async function updateQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    questionId
  } = req.params;

  if (!clubId || !questionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Question ID are required"
      }
    });
  }

  const input =
    updateQuestionSchema.parse(req.body);

  const question =
    await updateQuestion(
      clubId,
      questionId,
      input
    );

  return res.status(200).json({
    success: true,
    data: {
      question
    }
  });
}


export async function deleteQuestionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    questionId
  } = req.params;

  if (!clubId || !questionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Question ID are required"
      }
    });
  }

  await deleteQuestion(
    clubId,
    questionId
  );

  return res.status(200).json({
    success: true,
    message: "Question deleted successfully"
  });
}