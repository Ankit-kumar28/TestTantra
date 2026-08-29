import { prisma } from "../../config/database";

import type {
  CreateExamQuestionInput
} from "./exam-question.types";

export async function createExamQuestion(
  clubId: string,
  examId: string,
  sessionId: string,
  input: CreateExamQuestionInput
) {
  // 1. Verify exam belongs to club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Don't modify published/archived exams
  if (exam.status !== "DRAFT") {
    throw new Error("EXAM_NOT_EDITABLE");
  }

  // 3. Verify session belongs to this exam
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId
    },
    select: {
      id: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  // 4. Verify question belongs to same club
  const question = await prisma.question.findFirst({
    where: {
      id: input.questionId,
      clubId
    },
    select: {
      id: true
    }
  });

  if (!question) {
    throw new Error("QUESTION_NOT_IN_CLUB");
  }

  // 5. Check duplicate question in same session
  const existingQuestion =
    await prisma.examQuestion.findUnique({
      where: {
        examSessionId_questionId: {
          examSessionId: sessionId,
          questionId: input.questionId
        }
      },
      select: {
        id: true
      }
    });

  if (existingQuestion) {
    throw new Error("QUESTION_ALREADY_ASSIGNED");
  }

  // 6. Check duplicate position
  const existingPosition =
    await prisma.examQuestion.findUnique({
      where: {
        examSessionId_position: {
          examSessionId: sessionId,
          position: input.position
        }
      },
      select: {
        id: true
      }
    });

  if (existingPosition) {
    throw new Error("POSITION_ALREADY_USED");
  }

  // 7. Create assignment
  const examQuestion =
  await prisma.examQuestion.create({
    data: {
      examSessionId: sessionId,
      questionId: input.questionId,

      position: input.position,

      marks: input.marks,

      negativeMarks:
        input.negativeMarks ?? 0
    },

    select: {
      id: true,
      examSessionId: true,
      questionId: true,

      position: true,
      marks: true,
      negativeMarks: true,

      // 👇 Session details in response
      examSession: {
        select: {
          id: true,
          name: true,
          accessMode: true,
          startTime: true,
          endTime: true,
          status: true
        }
      },

      // 👇 Question details in response
      question: {
        select: {
          id: true,
          questionText: true,
          type: true,
          difficulty: true
        }
      },

      createdAt: true,
      updatedAt: true
    }
  });

  return examQuestion;
}




export async function getExamQuestions(
  clubId: string,
  examId: string,
  sessionId: string
) {
  // Verify exam belongs to club
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

  // Verify session belongs to exam
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId
    },
    select: {
      id: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  const examQuestions =
    await prisma.examQuestion.findMany({
      where: {
        examSessionId: sessionId
      },

      orderBy: {
        position: "asc"
      },

      select: {
        id: true,
        examSessionId: true,
        questionId: true,
        position: true,
        marks: true,
        negativeMarks: true,

        question: {
          select: {
            id: true,
            questionText: true,
            type: true,
            difficulty: true,

            options: {
              orderBy: {
                position: "asc"
              },

              select: {
                id: true,
                optionText: true,
                position: true,
                isCorrect: true
              }
            }
          }
        },

        createdAt: true,
        updatedAt: true
      }
    });

  return {
    session,
    questions: examQuestions
  };
}




export async function updateExamQuestion(
  clubId: string,
  examId: string,
  sessionId: string,
  examQuestionId: string,
  input: UpdateExamQuestionInput
) {
  // 1. Verify exam
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  if (exam.status !== "DRAFT") {
    throw new Error("EXAM_NOT_EDITABLE");
  }

  // 2. Verify session
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId
    },
    select: {
      id: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  // 3. Find assigned question
  const examQuestion =
    await prisma.examQuestion.findFirst({
      where: {
        id: examQuestionId,
        examSessionId: sessionId
      },
      select: {
        id: true
      }
    });

  if (!examQuestion) {
    throw new Error("EXAM_QUESTION_NOT_FOUND");
  }

  // 4. If changing position,
  // check that position isn't already used
  if (input.position !== undefined) {
    const existingPosition =
      await prisma.examQuestion.findFirst({
        where: {
          examSessionId: sessionId,
          position: input.position,
          NOT: {
            id: examQuestionId
          }
        },
        select: {
          id: true
        }
      });

    if (existingPosition) {
      throw new Error("POSITION_ALREADY_USED");
    }
  }

  // 5. Update
  const updated =
    await prisma.examQuestion.update({
      where: {
        id: examQuestionId
      },

      data: {
        ...(input.position !== undefined && {
          position: input.position
        }),

        ...(input.marks !== undefined && {
          marks: input.marks
        }),

        ...(input.negativeMarks !== undefined && {
          negativeMarks: input.negativeMarks
        })
      },

      select: {
        id: true,
        examSessionId: true,
        questionId: true,
        position: true,
        marks: true,
        negativeMarks: true,

        examSession: {
          select: {
            id: true,
            name: true,
            accessMode: true,
            startTime: true,
            endTime: true,
            status: true
          }
        },

        question: {
          select: {
            id: true,
            questionText: true,
            type: true,
            difficulty: true
          }
        },

        createdAt: true,
        updatedAt: true
      }
    });

  return updated;
}


export async function deleteExamQuestion(
  clubId: string,
  examId: string,
  sessionId: string,
  examQuestionId: string
) {
  // 1. Verify exam
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  if (exam.status !== "DRAFT") {
    throw new Error("EXAM_NOT_EDITABLE");
  }

  // 2. Verify session
  const session = await prisma.examSession.findFirst({
    where: {
      id: sessionId,
      examId
    },
    select: {
      id: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  // 3. Find assignment
  const examQuestion =
    await prisma.examQuestion.findFirst({
      where: {
        id: examQuestionId,
        examSessionId: sessionId
      },
      select: {
        id: true
      }
    });

  if (!examQuestion) {
    throw new Error("EXAM_QUESTION_NOT_FOUND");
  }

  // 4. Delete assignment only
  await prisma.examQuestion.delete({
    where: {
      id: examQuestionId
    }
  });
}