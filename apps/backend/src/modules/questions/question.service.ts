import { prisma } from "../../config/database";

import type {
  CreateQuestionInput,
  UpdateQuestionInput
} from "./question.types";

export async function createQuestion(
  clubId: string,
  userId: string,
  input: CreateQuestionInput
) {
  // Check club
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  if (club.status !== "APPROVED") {
    throw new Error("CLUB_NOT_APPROVED");
  }

  // Create question + options in one transaction
  const question = await prisma.question.create({
    data: {
      clubId,
      createdById: userId,

      questionText: input.questionText,
      type: input.type,
      difficulty: input.difficulty,
      explanation: input.explanation ?? null,

      options: input.options
        ? {
            create: input.options.map((option) => ({
              optionText: option.optionText,
              position: option.position,
              isCorrect: option.isCorrect
            }))
          }
        : undefined
    },

    select: {
      id: true,
      clubId: true,
      createdById: true,
      questionText: true,
      type: true,
      difficulty: true,
      explanation: true,

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
      },

      createdAt: true,
      updatedAt: true
    }
  });

  return question;
}


export async function getQuestions(
  clubId: string
) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    },
    select: {
      id: true
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  const questions = await prisma.question.findMany({
    where: {
      clubId
    },

    select: {
      id: true,
      clubId: true,
      createdById: true,
      questionText: true,
      type: true,
      difficulty: true,
      explanation: true,

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
      },

      createdAt: true,
      updatedAt: true
    },

    orderBy: {
      createdAt: "desc"
    }
  });

  return questions;
}




export async function getQuestion(
  clubId: string,
  questionId: string
) {
  const question =
    await prisma.question.findFirst({
      where: {
        id: questionId,
        clubId
      },

      select: {
        id: true,
        clubId: true,
        createdById: true,
        questionText: true,
        type: true,
        difficulty: true,
        explanation: true,

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
        },

        createdAt: true,
        updatedAt: true
      }
    });

  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  return question;
}

export async function deleteQuestion(
  clubId: string,
  questionId: string
) {
  const question =
    await prisma.question.findFirst({
      where: {
        id: questionId,
        clubId
      },

      include: {
        examQuestions: true
      }
    });

  if (!question) {
    throw new Error("QUESTION_NOT_FOUND");
  }

  if (question.examQuestions.length > 0) {
    throw new Error(
      "QUESTION_ALREADY_ASSIGNED"
    );
  }

  await prisma.question.delete({
    where: {
      id: questionId
    }
  });
}