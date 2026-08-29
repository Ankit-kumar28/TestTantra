import type { Request, Response } from "express";

import {
    getExamAnalytics,
    getExamAttemptDetails,
  getExamAttempts,
  getExamLeaderboard,
  getQuestionAnalytics,
  getSessionAnalytics,
  getStudentPerformance
} from "./exam-attempt.service.js";

export async function getExamAttemptsController(
  req: Request,
  res: Response
) {
  const { clubId, examId } = req.params;

  if (!clubId || !examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Exam ID are required"
      }
    });
  }

  const data = await getExamAttempts(
    clubId,
    examId
  );

  return res.status(200).json({
    success: true,
    data
  });
}



export async function getExamAttemptDetailsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId,
    attemptId
  } = req.params;

  if (!clubId || !examId || !attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID, Exam ID and Attempt ID are required"
      }
    });
  }

  const data =
    await getExamAttemptDetails(
      clubId,
      examId,
      attemptId
    );

  return res.status(200).json({
    success: true,
    data
  });
}


export async function getExamAnalyticsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId
  } = req.params;

  if (!clubId || !examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Exam ID are required"
      }
    });
  }

  const analytics =
    await getExamAnalytics(
      clubId,
      examId
    );

  return res.status(200).json({
    success: true,
    data: {
      analytics
    }
  });
}


export async function getSessionAnalyticsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId
  } = req.params;

  if (!clubId || !examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Exam ID are required"
      }
    });
  }

  const analytics =
    await getSessionAnalytics(
      clubId,
      examId
    );

  return res.status(200).json({
    success: true,
    data: analytics
  });
}


export async function getQuestionAnalyticsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId
  } = req.params;

  if (!clubId || !examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Exam ID are required"
      }
    });
  }

  const analytics =
    await getQuestionAnalytics(
      clubId,
      examId
    );

  return res.status(200).json({
    success: true,
    data: analytics
  });
}




export async function getStudentPerformanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    studentId
  } = req.params;

  if (!clubId || !studentId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Student ID are required"
      }
    });
  }

  const data =
    await getStudentPerformance(
      clubId,
      studentId
    );

  return res.status(200).json({
    success: true,
    data
  });
}



export async function getExamLeaderboardController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    clubId,
    examId
  } = req.params;

  if (!clubId || !examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Club ID and Exam ID are required"
      }
    });
  }

  const data =
    await getExamLeaderboard(
      clubId,
      examId
    );

  return res.status(200).json({
    success: true,
    data
  });
}