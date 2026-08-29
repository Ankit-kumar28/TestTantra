import bcrypt from "bcrypt";

import { prisma } from "../../config/database.js";

import type {
  CreateExamSessionInput
} from "./exam-session.types.js";

const SALT_ROUNDS = 12;


export async function createExamSession(
  clubId: string,
  examId: string,
  userId: string,
  input: CreateExamSessionInput
) {
  // 1. Check exam exists and belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      clubId: true,
      status: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Exam must be in DRAFT before adding sessions
  if (exam.status !== "DRAFT") {
    throw new Error("EXAM_NOT_EDITABLE");
  }

  // 3. Validate session access mode

  if (input.accessMode === "SCHEDULED") {
    if (!input.startTime || !input.endTime) {
      throw new Error("SESSION_TIME_REQUIRED");
    }

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    if (Number.isNaN(startTime.getTime())) {
      throw new Error("INVALID_START_TIME");
    }

    if (Number.isNaN(endTime.getTime())) {
      throw new Error("INVALID_END_TIME");
    }

    if (endTime <= startTime) {
      throw new Error("INVALID_SESSION_TIME");
    }
  }

  if (input.accessMode === "DYNAMIC") {
    if (input.startTime || input.endTime) {
      throw new Error(
        "DYNAMIC_SESSION_CANNOT_HAVE_FIXED_TIME"
      );
    }
  }

  // 4. Hash password
  let passwordHash: string | null = null;

  if (input.password) {
    passwordHash = await bcrypt.hash(
      input.password,
      SALT_ROUNDS
    );
  }

  // 5. Create session
  const session = await prisma.examSession.create({
    data: {
      examId,

      name: input.name ?? null,

      accessMode: input.accessMode,

      startTime: input.startTime
        ? new Date(input.startTime)
        : null,

      endTime: input.endTime
        ? new Date(input.endTime)
        : null,

      passwordHash,

      status: "SCHEDULED"
    },

    select: {
      id: true,
      examId: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return session;
}

//----------

export async function getExamSessions(
  clubId: string,
  examId: string
) {
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  return prisma.examSession.findMany({
    where: {
      examId
    },
    select: {
      id: true,
      examId: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      startTime: "asc"
    }
  });
}



//---
export async function getExamSession(
  clubId: string,
  examId: string,
  sessionId: string
) {
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId,
      exam: {
        clubId
      }
    },
    select: {
      id: true,
      examId: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  return session;
}




//-----


export async function openExamSession(
  clubId: string,
  examId: string,
  sessionId: string
) {
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId,
      exam: {
        clubId
      }
    },
    select: {
      id: true,
      status: true,
      accessMode: true,
      startTime: true,
      endTime: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.status === "CLOSED") {
    throw new Error("SESSION_ALREADY_CLOSED");
  }

  if (session.status === "CANCELLED") {
    throw new Error("SESSION_CANCELLED");
  }

  if (session.status === "OPEN") {
    throw new Error("SESSION_ALREADY_OPEN");
  }

  // Scheduled session cannot be opened before its start time
  if (
    session.accessMode === "SCHEDULED" &&
    session.startTime &&
    new Date() < session.startTime
  ) {
    throw new Error("SESSION_NOT_STARTED");
  }

  return prisma.examSession.update({
    where: {
      id: sessionId
    },
    data: {
      status: "OPEN"
    },
    select: {
      id: true,
      examId: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true,
      updatedAt: true
    }
  });
}

//----
export async function closeExamSession(
  clubId: string,
  examId: string,
  sessionId: string
) {
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId,
      exam: {
        clubId
      }
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.status === "CLOSED") {
    throw new Error("SESSION_ALREADY_CLOSED");
  }

  if (session.status === "CANCELLED") {
    throw new Error("SESSION_CANCELLED");
  }

  return prisma.examSession.update({
    where: {
      id: sessionId
    },
    data: {
      status: "CLOSED"
    },
    select: {
      id: true,
      examId: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true,
      updatedAt: true
    }
  });
}


//-----------


export async function cancelExamSession(
  clubId: string,
  examId: string,
  sessionId: string
) {
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId,
      exam: {
        clubId
      }
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  if (session.status === "CLOSED") {
    throw new Error("SESSION_ALREADY_CLOSED");
  }

  if (session.status === "CANCELLED") {
    throw new Error("SESSION_ALREADY_CANCELLED");
  }

  return prisma.examSession.update({
    where: {
      id: sessionId
    },
    data: {
      status: "CANCELLED"
    },
    select: {
      id: true,
      examId: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true,
      updatedAt: true
    }
  });
}

//-------


