import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.ts";

import { createExamSessionSchema } from "./exam-session.validation.js";

import {
  createExamSession,
  getExamSessions,
  getExamSession,
    openExamSession,
  closeExamSession,
  cancelExamSession
} from "./exam-session.service.js";

export async function createExamSessionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  if (!examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "EXAM_ID_REQUIRED",
        message: "Exam ID is required"
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

  const input = createExamSessionSchema.parse(req.body);

  const session = await createExamSession(
    clubId,
    examId,
    req.user.id,
    input
  );

  return res.status(201).json({
    success: true,
    data: {
      session
    }
  });
}






export async function getExamSessionsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId } = req.params;

  if (!clubId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CLUB_ID_REQUIRED",
        message: "Club ID is required"
      }
    });
  }

  if (!examId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "EXAM_ID_REQUIRED",
        message: "Exam ID is required"
      }
    });
  }

  const sessions = await getExamSessions(
    clubId,
    examId
  );

  return res.status(200).json({
    success: true,
    data: {
      sessions
    }
  });
}



export async function getExamSessionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId, sessionId } = req.params;

  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message: "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  const session = await getExamSession(
    clubId,
    examId,
    sessionId
  );

  return res.status(200).json({
    success: true,
    data: {
      session
    }
  });
}


///----


export async function openExamSessionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId, sessionId } = req.params;

  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message: "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  const session = await openExamSession(
    clubId,
    examId,
    sessionId
  );

  return res.status(200).json({
    success: true,
    data: {
      session
    }
  });
}

///-----


export async function closeExamSessionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId, sessionId } = req.params;

  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message: "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  const session = await closeExamSession(
    clubId,
    examId,
    sessionId
  );

  return res.status(200).json({
    success: true,
    data: {
      session
    }
  });
}


///-----

export async function cancelExamSessionController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { clubId, examId, sessionId } = req.params;

  if (!clubId || !examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message: "Club ID, Exam ID and Session ID are required"
      }
    });
  }

  const session = await cancelExamSession(
    clubId,
    examId,
    sessionId
  );

  return res.status(200).json({
    success: true,
    data: {
      session
    }
  });
}

