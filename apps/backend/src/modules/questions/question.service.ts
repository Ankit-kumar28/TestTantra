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


export async function submitAttempt(
  userId: string,
  attemptId: string
) {
  const now = new Date();

  // 1. Verify attempt belongs to student
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },
    select: {
      id: true,
      examSessionId: true,
      startedAt: true,
      expiresAt: true,
      status: true
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // 2. Already submitted?
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  // 3. Get all questions for this session
  const examQuestions =
    await prisma.examQuestion.findMany({
      where: {
        examSessionId: attempt.examSessionId
      },

      orderBy: {
        position: "asc"
      },

      select: {
        questionId: true,
        marks: true,
        negativeMarks: true,

        question: {
          select: {
            id: true,

            options: {
              select: {
                id: true,
                isCorrect: true
              }
            }
          }
        }
      }
    });

  // 4. Get student's answers
  const answers = await prisma.answer.findMany({
    where: {
      attemptId
    },

    select: {
      id: true,
      questionId: true,
      selectedOptionId: true,
      answerText: true
    }
  });

  // Map answers for fast lookup
  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId,
      answer
    ])
  );

  let correctAnswers = 0;
  let wrongAnswers = 0;
  let attemptedQuestions = 0;

  let totalMarks = 0;
  let score = 0;

  // 5. Evaluate each question
  for (const examQuestion of examQuestions) {
    const marks = Number(examQuestion.marks);
    const negativeMarks = Number(
      examQuestion.negativeMarks
    );

    totalMarks += marks;

    const answer = answerMap.get(
      examQuestion.questionId
    );

    // Not attempted
    if (!answer) {
      continue;
    }

    attemptedQuestions++;

    let isCorrect = false;

    // MCQ evaluation
    if (answer.selectedOptionId) {
      const selectedOption =
        examQuestion.question.options.find(
          (option) =>
            option.id ===
            answer.selectedOptionId
        );

      if (selectedOption?.isCorrect) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      correctAnswers++;
      score += marks;

      await prisma.answer.update({
        where: {
          id: answer.id
        },

        data: {
          isCorrect: true,
          marksObtained: marks
        }
      });
    } else {
      wrongAnswers++;
      score -= negativeMarks;

      await prisma.answer.update({
        where: {
          id: answer.id
        },

        data: {
          isCorrect: false,
          marksObtained: -negativeMarks
        }
      });
    }
  }

  // 6. Prevent negative final score if desired
  score = Math.max(score, 0);

  const percentage =
    totalMarks > 0
      ? (score / totalMarks) * 100
      : 0;

  // 7. Update attempt + create result atomically
  const result = await prisma.$transaction(
    async (tx) => {
      const updatedAttempt =
        await tx.attempt.update({
          where: {
            id: attemptId
          },

          data: {
            status: "SUBMITTED",
            submittedAt: now
          }
        });

      const createdResult =
        await tx.result.create({
          data: {
            attemptId,
            totalQuestions:
              examQuestions.length,
            attemptedQuestions,
            correctAnswers,
            wrongAnswers,
            score,
            totalMarks,
            percentage
          },

          select: {
            id: true,
            attemptId: true,
            totalQuestions: true,
            attemptedQuestions: true,
            correctAnswers: true,
            wrongAnswers: true,
            score: true,
            totalMarks: true,
            percentage: true,
            evaluatedAt: true
          }
        });

      return {
        attempt: updatedAttempt,
        result: createdResult
      };
    }
  );

  return result;
}