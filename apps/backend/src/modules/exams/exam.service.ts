import { prisma } from "../../config/database.js";
import type { CreateExamInput } from "./exam.types.js";

export async function createExam(
  clubId: string,
  userId: string,
  input: CreateExamInput
) {
  const exam = await prisma.exam.create({
    data: {
      clubId,
      createdById: userId,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      durationMinutes: input.durationMinutes,
      accessMode: input.accessMode,
      status: "DRAFT"
    },
    select: {
      id: true,
      title: true,
      description: true,
      instructions: true,
      durationMinutes: true,
      accessMode: true,
      status: true,
      clubId: true,
      createdById: true,
      createdAt: true,
      updatedAt: true
    }
  });


  
  return exam;
}

export async function getExams(clubId: string) {
  const exams = await prisma.exam.findMany({
    where: {
      clubId
    },
    select: {
      id: true,
      clubId: true,
      createdById: true,
      title: true,
      description: true,
      instructions: true,
      durationMinutes: true,
      status: true,

      sessions: {
        select: {
          id: true,
          name: true,
          accessMode: true,
          startTime: true,
          endTime: true,
          status: true
        },
        orderBy: {
          createdAt: "asc"
        }
      },

      createdAt: true,
      updatedAt: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });

  return exams;
}


export async function publishExam(
  clubId: string,
  examId: string
) {
  // 1. Find exam and verify club ownership
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      status: true,

      sessions: {
        select: {
          id: true,

          _count: {
            select: {
              questions: true
            }
          }
        }
      }
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Only DRAFT exam can be published
  if (exam.status !== "DRAFT") {
    throw new Error("EXAM_NOT_DRAFT");
  }

  // 3. Exam must have at least one session
  if (exam.sessions.length === 0) {
    throw new Error("NO_SESSIONS");
  }

  // 4. Every session must have at least one question
  const emptySession = exam.sessions.find(
    (session) => session._count.questions === 0
  );

  if (emptySession) {
    throw new Error(
      "SESSION_HAS_NO_QUESTIONS"
    );
  }

  // 5. Publish exam
  const publishedExam =
    await prisma.exam.update({
      where: {
        id: exam.id
      },

      data: {
        status: "PUBLISHED"
      },

      select: {
        id: true,
        clubId: true,
        createdById: true,
        title: true,
        description: true,
        instructions: true,
        durationMinutes: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

  return publishedExam;
}