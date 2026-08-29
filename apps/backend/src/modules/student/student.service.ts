import { prisma } from "../../config/database.js";
import bcrypt from "bcrypt";

export async function joinClub(
  userId: string,
  clubId: string
) {
  // 1. Verify club exists and is approved
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      status: "APPROVED"
    },
    select: {
      id: true,
      name: true,
      status: true
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  // 2. Check if student is already a member
  const existingMembership =
    await prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId
        }
      },
      select: {
        id: true,
        role: true,
        status: true
      }
    });

  if (existingMembership) {
    throw new Error("ALREADY_MEMBER");
  }

  // 3. Create membership
  const membership =
    await prisma.clubMembership.create({
      data: {
        userId,
        clubId,
        role: "MEMBER",
        status: "ACTIVE"
      },

      select: {
        id: true,
        userId: true,
        clubId: true,
        role: true,
        status: true,
        joinedAt: true,

        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

  return membership;
}


export async function getMyClubs(userId: string) {
  const memberships =
    await prisma.clubMembership.findMany({
      where: {
        userId,
        status: "ACTIVE"
      },

      select: {
        id: true,
        role: true,
        status: true,
        joinedAt: true,

        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            description: true,
            collegeName: true,
            status: true
          }
        }
      },

      orderBy: {
        joinedAt: "desc"
      }
    });

  return memberships;
}


export async function getMyExams(userId: string) {
  const exams = await prisma.exam.findMany({
    where: {
      status: "PUBLISHED",

      club: {
        memberships: {
          some: {
            userId,
            status: "ACTIVE"
          }
        }
      }
    },

    select: {
      id: true,
      clubId: true,
      title: true,
      description: true,
      instructions: true,
      durationMinutes: true,
      status: true,

      club: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },

      sessions: {
        where: {
          status: {
            not: "CANCELLED"
          }
        },

        select: {
          id: true,
          name: true,
          accessMode: true,
          startTime: true,
          endTime: true,
          status: true
        },

        orderBy: {
          startTime: "asc"
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


export async function getStudentExamDetails(
  userId: string,
  examId: string
) {
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,

      // Student must belong to the club
      club: {
        memberships: {
          some: {
            userId,
            status: "ACTIVE"
          }
        }
      },

      // Only published exams
      status: "PUBLISHED"
    },

    select: {
      id: true,
      clubId: true,
      title: true,
      description: true,
      instructions: true,
      durationMinutes: true,
      status: true,

      club: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },

      sessions: {
        where: {
          status: {
            not: "CANCELLED"
          }
        },

        select: {
          id: true,
          name: true,
          accessMode: true,
          startTime: true,
          endTime: true,
          status: true
        },

        orderBy: {
          startTime: "asc"
        }
      }
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  return exam;
}



export async function startAttempt(
  userId: string,
  examId: string,
  sessionId: string,
  input: StartAttemptInput
) {
  const now = new Date();

  // 1. Verify student has access to the club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      status: "PUBLISHED",

      club: {
        memberships: {
          some: {
            userId,
            status: "ACTIVE"
          }
        }
      }
    },

    select: {
      id: true,
      clubId: true,
      title: true,
      durationMinutes: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Verify session belongs to this exam
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
      status: true,
      passwordHash: true
    }
  });

  if (!session) {
    throw new Error("SESSION_NOT_FOUND");
  }

  // 3. Check session access
  if (session.accessMode === "SCHEDULED") {
    if (!session.startTime || !session.endTime) {
      throw new Error("INVALID_SESSION_TIME");
    }

    if (now < session.startTime) {
      throw new Error("SESSION_NOT_OPEN");
    }

    if (now >= session.endTime) {
      throw new Error("SESSION_CLOSED");
    }
  }

  if (session.accessMode === "DYNAMIC") {
    if (session.status !== "OPEN") {
      if (session.status === "CLOSED") {
        throw new Error("SESSION_CLOSED");
      }

      throw new Error("SESSION_NOT_OPEN");
    }
  }

  // 4. Check password
  if (session.passwordHash) {
    if (!input.password) {
      throw new Error("PASSWORD_REQUIRED");
    }

    const validPassword =
      await bcrypt.compare(
        input.password,
        session.passwordHash
      );

    if (!validPassword) {
      throw new Error("INVALID_PASSWORD");
    }
  }

  // 5. Prevent multiple active attempts
  const existingAttempt =
    await prisma.attempt.findFirst({
      where: {
        userId,
        examSessionId: sessionId,
        status: "IN_PROGRESS"
      },

      select: {
        id: true,
        startedAt: true,
        expiresAt: true,
        status: true
      }
    });

  if (existingAttempt) {
    return existingAttempt;
  }

  // 6. Calculate attempt expiry
  const expiresAt = new Date(
    now.getTime() +
      exam.durationMinutes * 60 * 1000
  );

  // Never allow attempt to go beyond session end
  if (
    session.accessMode === "SCHEDULED" &&
    session.endTime &&
    expiresAt > session.endTime
  ) {
    expiresAt.setTime(
      session.endTime.getTime()
    );
  }

  // 7. Create attempt
  const attempt = await prisma.attempt.create({
    data: {
      userId,
      examSessionId: sessionId,
      startedAt: now,
      expiresAt,
      status: "IN_PROGRESS"
    },

    select: {
      id: true,
      userId: true,
      examSessionId: true,
      startedAt: true,
      expiresAt: true,
      status: true,

      examSession: {
        select: {
          id: true,
          name: true,
          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true
            }
          }
        }
      }
    }
  });

  return attempt;
}

export async function getAttemptQuestions(
  userId: string,
  attemptId: string
) {
  // 1. Find attempt belonging to logged-in student
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },

    select: {
      id: true,
      userId: true,
      examSessionId: true,
      startedAt: true,
      expiresAt: true,
      submittedAt: true,
      status: true,

      examSession: {
        select: {
          id: true,
          name: true,

          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true
            }
          }
        }
      }
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // 2. Only an active attempt can access the question paper
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  // 3. Check expiry
const expired = await autoSubmitIfExpired(
  userId,
  attemptId
);

if (expired) {
  throw new Error("ATTEMPT_EXPIRED");
}

  // 4. Get questions assigned to this session
  const questions = await prisma.examQuestion.findMany({
    where: {
      examSessionId: attempt.examSessionId
    },

    orderBy: {
      position: "asc"
    },

    select: {
      id: true,
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

          // IMPORTANT:
          // Do NOT select isCorrect
          options: {
            orderBy: {
              position: "asc"
            },

            select: {
              id: true,
              optionText: true,
              position: true
            }
          }
        }
      }
    }
  });

  return {
    attempt,
    questions
  };
}


export async function saveAnswer(
  userId: string,
  attemptId: string,
  input: SaveAnswerInput
) {
  // 1. Verify attempt belongs to student
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },

    select: {
      id: true,
      examSessionId: true,
      status: true,
      expiresAt: true
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // 2. Attempt must be active
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  // 3. Check expiry
  const now = new Date();

  if (now >= attempt.expiresAt) {
    throw new Error("ATTEMPT_EXPIRED");
  }

  // 4. Verify question belongs to this session
  const examQuestion =
    await prisma.examQuestion.findFirst({
      where: {
        examSessionId: attempt.examSessionId,
        questionId: input.questionId
      },

      select: {
        id: true,
        questionId: true,
        question: {
          select: {
            id: true,
            type: true
          }
        }
      }
    });

  if (!examQuestion) {
    throw new Error(
      "QUESTION_NOT_IN_ATTEMPT"
    );
  }

  // 5. If MCQ option provided,
  // verify that option belongs to this question
  if (input.selectedOptionId) {
    const option =
      await prisma.questionOption.findFirst({
        where: {
          id: input.selectedOptionId,
          questionId: input.questionId
        },

        select: {
          id: true
        }
      });

    if (!option) {
      throw new Error(
        "INVALID_OPTION"
      );
    }
  }

  // 6. Check whether answer already exists
  const existingAnswer =
    await prisma.answer.findFirst({
      where: {
        attemptId,
        questionId: input.questionId
      },

      select: {
        id: true
      }
    });

  // 7. Update existing answer
  if (existingAnswer) {
    return await prisma.answer.update({
      where: {
        id: existingAnswer.id
      },

      data: {
        selectedOptionId:
          input.selectedOptionId ?? null,

        answerText:
          input.answerText ?? null
      },

      select: {
        id: true,
        attemptId: true,
        questionId: true,
        selectedOptionId: true,
        answerText: true,
        answeredAt: true
      }
    });
  }

  // 8. Create new answer
  return await prisma.answer.create({
    data: {
      attemptId,
      questionId: input.questionId,

      selectedOptionId:
        input.selectedOptionId ?? null,

      answerText:
        input.answerText ?? null,

      answeredAt: now
    },

    select: {
      id: true,
      attemptId: true,
      questionId: true,
      selectedOptionId: true,
      answerText: true,
      answeredAt: true
    }
  });
}


export async function getAttemptResult(
  userId: string,
  attemptId: string
) {
  // 1. Verify attempt belongs to logged-in student
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },

    select: {
      id: true,
      status: true,
      submittedAt: true,

      examSession: {
        select: {
          id: true,
          name: true,

          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,

              club: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },

      result: {
        select: {
          id: true,
          totalQuestions: true,
          attemptedQuestions: true,
          correctAnswers: true,
          wrongAnswers: true,
          score: true,
          totalMarks: true,
          percentage: true,
          evaluatedAt: true
        }
      }
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // 2. Result should only be available after submission
  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "AUTO_SUBMITTED"
  ) {
    throw new Error("RESULT_NOT_AVAILABLE");
  }

  if (!attempt.result) {
    throw new Error("RESULT_NOT_FOUND");
  }

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt
    },

    exam: {
      id: attempt.examSession.exam.id,
      title: attempt.examSession.exam.title,
      durationMinutes:
        attempt.examSession.exam.durationMinutes
    },

    club: attempt.examSession.exam.club,

    session: {
      id: attempt.examSession.id,
      name: attempt.examSession.name
    },

    result: attempt.result
  };
}


async function evaluateAndSubmitAttempt(
  userId: string,
  attemptId: string,
  status: "SUBMITTED" | "AUTO_SUBMITTED"
) {
  const now = new Date();

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },
    select: {
      id: true,
      userId: true,
      examSessionId: true,
      startedAt: true,
      expiresAt: true,
      status: true,
      submittedAt: true
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // Already completed
  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "AUTO_SUBMITTED"
  ) {
    const existingResult =
      await prisma.result.findUnique({
        where: {
          attemptId: attempt.id
        }
      });

    return {
      attempt,
      result: existingResult
    };
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  // Get questions
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

  // Get student's answers
  const answers = await prisma.answer.findMany({
    where: {
      attemptId: attempt.id
    },
    select: {
      id: true,
      questionId: true,
      selectedOptionId: true,
      answerText: true
    }
  });

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

  // Evaluate
  for (const examQuestion of examQuestions) {
    const marks = Number(
      examQuestion.marks
    );

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

    if (answer.selectedOptionId) {
      const selectedOption =
        examQuestion.question.options.find(
          (option) =>
            option.id ===
            answer.selectedOptionId
        );

      isCorrect =
        selectedOption?.isCorrect === true;
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

  // Prevent negative final score
  score = Math.max(score, 0);

  const percentage =
    totalMarks > 0
      ? (score / totalMarks) * 100
      : 0;

  // IMPORTANT:
  // Attempt + Result should be one transaction
  const result = await prisma.$transaction(
    async (tx) => {
      const updatedAttempt =
        await tx.attempt.update({
          where: {
            id: attempt.id
          },
          data: {
            status,
            submittedAt: now
          },
          select: {
            id: true,
            userId: true,
            examSessionId: true,
            startedAt: true,
            expiresAt: true,
            submittedAt: true,
            status: true
          }
        });

      const createdResult =
        await tx.result.create({
          data: {
            attemptId: attempt.id,
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


//---

async function autoSubmitIfExpired(
  userId: string,
  attemptId: string
) {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },
    select: {
      id: true,
      expiresAt: true,
      status: true
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "AUTO_SUBMITTED"
  ) {
    return false;
  }

  if (attempt.status !== "IN_PROGRESS") {
    return false;
  }

  const now = new Date();

  if (now < attempt.expiresAt) {
    return false;
  }

  await evaluateAndSubmitAttempt(
    userId,
    attemptId,
    "AUTO_SUBMITTED"
  );

  return true;
}

export async function submitAttempt(
  userId: string,
  attemptId: string
) {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },
    select: {
      id: true,
      expiresAt: true,
      status: true
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "AUTO_SUBMITTED"
  ) {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("ATTEMPT_NOT_ACTIVE");
  }

  const now = new Date();

  // If timer already expired,
  // classify as AUTO_SUBMITTED.
  if (now >= attempt.expiresAt) {
    return evaluateAndSubmitAttempt(
      userId,
      attemptId,
      "AUTO_SUBMITTED"
    );
  }

  return evaluateAndSubmitAttempt(
    userId,
    attemptId,
    "SUBMITTED"
  );
}


///----------------------------------



export async function getAttemptReview(
  userId: string,
  attemptId: string
) {
  // 1. Verify ownership
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      userId
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,

      examSession: {
        select: {
          id: true,
          name: true,

          exam: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  // 2. Review only after submission
  if (
    attempt.status !== "SUBMITTED" &&
    attempt.status !== "AUTO_SUBMITTED"
  ) {
    throw new Error("REVIEW_NOT_AVAILABLE");
  }

  // 3. Get assigned questions + student's answers
  const questions =
    await prisma.examQuestion.findMany({
      where: {
        examSessionId:
          attempt.examSession.id
      },

      orderBy: {
        position: "asc"
      },

      select: {
        id: true,
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
            }
          }
        }
      }
    });

  const answers = await prisma.answer.findMany({
    where: {
      attemptId
    },

    select: {
      questionId: true,
      selectedOptionId: true,
      answerText: true,
      isCorrect: true,
      marksObtained: true,
      answeredAt: true
    }
  });

  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId,
      answer
    ])
  );

  const review = questions.map(
    (examQuestion) => {
      const answer = answerMap.get(
        examQuestion.questionId
      );

      return {
        questionId:
          examQuestion.questionId,

        position:
          examQuestion.position,

        marks:
          examQuestion.marks,

        negativeMarks:
          examQuestion.negativeMarks,

        question: {
          id:
            examQuestion.question.id,

          questionText:
            examQuestion.question.questionText,

          type:
            examQuestion.question.type,

          difficulty:
            examQuestion.question.difficulty,

          explanation:
            examQuestion.question.explanation
        },

        options:
          examQuestion.question.options,

        answer: answer
          ? {
              selectedOptionId:
                answer.selectedOptionId,

              answerText:
                answer.answerText,

              isCorrect:
                answer.isCorrect,

              marksObtained:
                answer.marksObtained,

              answeredAt:
                answer.answeredAt
            }
          : null
      };
    }
  );

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      submittedAt: attempt.submittedAt
    },

    exam: {
      id: attempt.examSession.exam.id,
      title: attempt.examSession.exam.title
    },

    session: {
      id: attempt.examSession.id,
      name: attempt.examSession.name
    },

    questions: review
  };
}