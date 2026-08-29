import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import { joinClub ,getMyClubs ,getMyExams, getStudentExamDetails,startAttempt, getAttemptQuestions,saveAnswer,getAttemptResult, getAttemptReview} from "./student.service.js";
import { saveAnswerSchema } from "./student.validation.js";
import { submitAttempt } from "../questions/question.service.js";

export async function joinClubController(
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

  const membership = await joinClub(
    req.user.id,
    clubId
  );

  return res.status(201).json({
    success: true,
    data: {
      membership
    },
    message: "Joined club successfully"
  });
}

export async function getMyClubsController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  const memberships = await getMyClubs(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    data: {
      clubs: memberships
    }
  });
}


export async function getMyExamsController(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  const exams = await getMyExams(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    data: {
      exams
    }
  });
}

export async function getStudentExamDetailsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { examId } = req.params;

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

  const exam = await getStudentExamDetails(
    req.user.id,
    examId
  );

  return res.status(200).json({
    success: true,
    data: {
      exam
    }
  });
}


export async function startAttemptController(
  req: AuthenticatedRequest,
  res: Response
) {
  const {
    examId,
    sessionId
  } = req.params;

  if (!examId || !sessionId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PARAMS",
        message:
          "Exam ID and Session ID are required"
      }
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message:
          "Authentication required"
      }
    });
  }

  const input = {
    password: req.body?.password
  };

  const attempt = await startAttempt(
    req.user.id,
    examId,
    sessionId,
    input
  );

  return res.status(201).json({
    success: true,
    data: {
      attempt
    },
    message: "Exam attempt started successfully"
  });
}

export async function getAttemptQuestionsController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { attemptId } = req.params;

  if (!attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ATTEMPT_ID_REQUIRED",
        message: "Attempt ID is required"
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

  const result = await getAttemptQuestions(
    req.user.id,
    attemptId
  );

  return res.status(200).json({
    success: true,
    data: result
  });
}


export async function saveAnswerController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { attemptId } = req.params;

  if (!attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ATTEMPT_ID_REQUIRED",
        message: "Attempt ID is required"
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

  const input = saveAnswerSchema.parse(
    req.body
  );

  const answer = await saveAnswer(
    req.user.id,
    attemptId,
    input
  );

  return res.status(200).json({
    success: true,
    data: {
      answer
    },
    message: "Answer saved successfully"
  });
}


export async function submitAttemptController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { attemptId } = req.params;

  if (!attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ATTEMPT_ID_REQUIRED",
        message: "Attempt ID is required"
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

  const result = await submitAttempt(
    req.user.id,
    attemptId
  );

  return res.status(200).json({
    success: true,
    data: result,
    message: "Exam submitted successfully"
  });
}


export async function getAttemptResultController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { attemptId } = req.params;

  if (!attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ATTEMPT_ID_REQUIRED",
        message: "Attempt ID is required"
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

  const result = await getAttemptResult(
    req.user.id,
    attemptId
  );

  return res.status(200).json({
    success: true,
    data: result
  });
}


export async function getAttemptReviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  const { attemptId } = req.params;

  if (!attemptId) {
    return res.status(400).json({
      success: false,
      error: {
        code: "ATTEMPT_ID_REQUIRED",
        message: "Attempt ID is required"
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

  const review = await getAttemptReview(
    req.user.id,
    attemptId
  );

  return res.status(200).json({
    success: true,
    data: review
  });
}