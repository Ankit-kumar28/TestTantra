import { prisma } from "../../config/database.js";

export async function getExamAttempts(
  clubId: string,
  examId: string
) {
  // Verify exam belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },

    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  const attempts =
    await prisma.attempt.findMany({
      where: {
        examSession: {
          examId
        }
      },

      orderBy: {
        startedAt: "desc"
      },

      select: {
        id: true,
        userId: true,
        examSessionId: true,
        startedAt: true,
        expiresAt: true,
        submittedAt: true,
        status: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },

        examSession: {
          select: {
            id: true,
            name: true
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

  return {
    exam,
    attempts
  };
}


export async function getExamAttemptDetails(
  clubId: string,
  examId: string,
  attemptId: string
) {
  // Verify exam belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,

      examSession: {
        examId
      }
    },

    select: {
      id: true,
      userId: true,
      examSessionId: true,
      startedAt: true,
      expiresAt: true,
      submittedAt: true,
      status: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      examSession: {
        select: {
          id: true,
          name: true
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
      },

      answers: {
        orderBy: {
          answeredAt: "asc"
        },

        select: {
          id: true,
          questionId: true,
          selectedOptionId: true,
          answerText: true,
          isCorrect: true,
          marksObtained: true,
          answeredAt: true,

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

          selectedOption: {
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

  if (!attempt) {
    throw new Error("ATTEMPT_NOT_FOUND");
  }

  return {
    exam,
    attempt
  };
}


///----------


export async function getExamAnalytics(
  clubId: string,
  examId: string
) {
  // 1. Verify exam belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Get all attempts of this exam
  const attempts = await prisma.attempt.findMany({
    where: {
      examSession: {
        examId
      }
    },
    select: {
      id: true,
      status: true,
      result: {
        select: {
          score: true,
          totalMarks: true,
          percentage: true
        }
      }
    }
  });

  const totalAttempts = attempts.length;

  const submitted = attempts.filter(
    (attempt) =>
      attempt.status === "SUBMITTED"
  ).length;

  const autoSubmitted = attempts.filter(
    (attempt) =>
      attempt.status === "AUTO_SUBMITTED"
  ).length;

  const inProgress = attempts.filter(
    (attempt) =>
      attempt.status === "IN_PROGRESS"
  ).length;

  const abandoned = attempts.filter(
    (attempt) =>
      attempt.status === "ABANDONED"
  ).length;

  // Only evaluated attempts
  const evaluatedAttempts =
    attempts.filter(
      (attempt) => attempt.result !== null
    );

  const scores = evaluatedAttempts.map(
    (attempt) =>
      Number(attempt.result!.score)
  );

  const percentages =
    evaluatedAttempts.map(
      (attempt) =>
        Number(attempt.result!.percentage)
    );

  const averageScore =
    scores.length > 0
      ? scores.reduce(
          (sum, score) => sum + score,
          0
        ) / scores.length
      : 0;

  const averagePercentage =
    percentages.length > 0
      ? percentages.reduce(
          (sum, percentage) =>
            sum + percentage,
          0
        ) / percentages.length
      : 0;

  const highestScore =
    scores.length > 0
      ? Math.max(...scores)
      : 0;

  const lowestScore =
    scores.length > 0
      ? Math.min(...scores)
      : 0;

  return {
    exam,

    attempts: {
      total: totalAttempts,
      submitted,
      autoSubmitted,
      inProgress,
      abandoned
    },

    performance: {
      evaluated: evaluatedAttempts.length,
      averageScore: Number(
        averageScore.toFixed(2)
      ),
      highestScore,
      lowestScore,
      averagePercentage: Number(
        averagePercentage.toFixed(2)
      )
    }
  };
}


export async function getSessionAnalytics(
  clubId: string,
  examId: string
) {
  // 1. Verify exam belongs to club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Get all sessions of this exam
  const sessions = await prisma.examSession.findMany({
    where: {
      examId
    },

    orderBy: {
      createdAt: "asc"
    },

    select: {
      id: true,
      name: true,
      accessMode: true,
      startTime: true,
      endTime: true,
      status: true,

      attempts: {
        select: {
          id: true,
          status: true,

          result: {
            select: {
              score: true,
              totalMarks: true,
              percentage: true
            }
          }
        }
      }
    }
  });

  const sessionAnalytics = sessions.map(
    (session) => {
      const attempts = session.attempts;

      const totalAttempts =
        attempts.length;

      const submitted = attempts.filter(
        (attempt) =>
          attempt.status === "SUBMITTED"
      ).length;

      const autoSubmitted = attempts.filter(
        (attempt) =>
          attempt.status === "AUTO_SUBMITTED"
      ).length;

      const inProgress = attempts.filter(
        (attempt) =>
          attempt.status === "IN_PROGRESS"
      ).length;

      const abandoned = attempts.filter(
        (attempt) =>
          attempt.status === "ABANDONED"
      ).length;

      const evaluatedAttempts =
        attempts.filter(
          (attempt) =>
            attempt.result !== null
        );

      const scores =
        evaluatedAttempts.map(
          (attempt) =>
            Number(
              attempt.result!.score
            )
        );

      const percentages =
        evaluatedAttempts.map(
          (attempt) =>
            Number(
              attempt.result!.percentage
            )
        );

      const averageScore =
        scores.length > 0
          ? scores.reduce(
              (sum, score) =>
                sum + score,
              0
            ) / scores.length
          : 0;

      const averagePercentage =
        percentages.length > 0
          ? percentages.reduce(
              (sum, percentage) =>
                sum + percentage,
              0
            ) / percentages.length
          : 0;

      const highestScore =
        scores.length > 0
          ? Math.max(...scores)
          : 0;

      const lowestScore =
        scores.length > 0
          ? Math.min(...scores)
          : 0;

      return {
        session: {
          id: session.id,
          name: session.name,
          accessMode: session.accessMode,
          startTime: session.startTime,
          endTime: session.endTime,
          status: session.status
        },

        attempts: {
          total: totalAttempts,
          submitted,
          autoSubmitted,
          inProgress,
          abandoned
        },

        performance: {
          evaluated: evaluatedAttempts.length,

          averageScore: Number(
            averageScore.toFixed(2)
          ),

          highestScore,

          lowestScore,

          averagePercentage: Number(
            averagePercentage.toFixed(2)
          )
        }
      };
    }
  );

  return {
    exam,
    sessions: sessionAnalytics
  };
}


export async function getQuestionAnalytics(
  clubId: string,
  examId: string
) {
  // 1. Verify exam belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Get all questions used in this exam
  const examQuestions =
    await prisma.examQuestion.findMany({
      where: {
        examSession: {
          examId
        }
      },

      orderBy: {
        position: "asc"
      },

      select: {
        id: true,
        questionId: true,
        examSessionId: true,
        position: true,
        marks: true,
        negativeMarks: true,

        examSession: {
          select: {
            id: true,
            name: true
          }
        },

        question: {
          select: {
            id: true,
            questionText: true,
            type: true,
            difficulty: true
          }
        }
      }
    });

  // 3. Get submitted/evaluated attempts
  const attempts = await prisma.attempt.findMany({
    where: {
      examSession: {
        examId
      },

      status: {
        in: ["SUBMITTED", "AUTO_SUBMITTED"]
      }
    },

    select: {
      answers: {
        select: {
          questionId: true,
          isCorrect: true
        }
      }
    }
  });

  // 4. Create question statistics map
  const statsMap = new Map<
    string,
    {
      attempted: number;
      correct: number;
      wrong: number;
    }
  >();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const current =
        statsMap.get(answer.questionId) ?? {
          attempted: 0,
          correct: 0,
          wrong: 0
        };

      current.attempted++;

      if (answer.isCorrect === true) {
        current.correct++;
      } else {
        current.wrong++;
      }

      statsMap.set(
        answer.questionId,
        current
      );
    }
  }

  // 5. Build analytics
  const questions = examQuestions.map(
    (examQuestion) => {
      const stats =
        statsMap.get(
          examQuestion.questionId
        ) ?? {
          attempted: 0,
          correct: 0,
          wrong: 0
        };

      const accuracy =
        stats.attempted > 0
          ? (stats.correct /
              stats.attempted) *
            100
          : 0;

      return {
        question: {
          id:
            examQuestion.question.id,

          questionText:
            examQuestion.question.questionText,

          type:
            examQuestion.question.type,

          difficulty:
            examQuestion.question.difficulty
        },

        session: {
          id:
            examQuestion.examSession.id,

          name:
            examQuestion.examSession.name
        },

        position:
          examQuestion.position,

        marks:
          examQuestion.marks,

        negativeMarks:
          examQuestion.negativeMarks,

        statistics: {
          attempted: stats.attempted,
          correct: stats.correct,
          wrong: stats.wrong,

          skipped:
            attempts.length -
            stats.attempted,

          accuracy: Number(
            accuracy.toFixed(2)
          )
        }
      };
    }
  );

  return {
    exam,
    totalEvaluatedAttempts:
      attempts.length,
    questions
  };
}



export async function getStudentPerformance(
  clubId: string,
  studentId: string
) {
  // 1. Verify student belongs to this club
  const membership =
  await prisma.clubMembership.findFirst({
    where: {
      clubId,
      userId: studentId,

      status: "ACTIVE"
    },

    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

if (!membership) {
  throw new Error("STUDENT_NOT_FOUND");
}

  if (!membership) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  // 2. Get evaluated attempts
  const attempts = await prisma.attempt.findMany({
    where: {
      userId: studentId,

      examSession: {
        exam: {
          clubId
        }
      },

      status: {
        in: [
          "SUBMITTED",
          "AUTO_SUBMITTED"
        ]
      },

      result: {
        isNot: null
      }
    },

    orderBy: {
      submittedAt: "desc"
    },

    select: {
      id: true,
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
              title: true
            }
          }
        }
      },

      result: {
        select: {
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

  const performances = attempts.map(
    (attempt) => ({
      attemptId: attempt.id,

      exam: {
        id: attempt.examSession.exam.id,
        title: attempt.examSession.exam.title
      },

      session: {
        id: attempt.examSession.id,
        name: attempt.examSession.name
      },

      status: attempt.status,

      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,

      result: attempt.result
    })
  );

  const scores = attempts.map(
    (attempt) =>
      Number(attempt.result!.score)
  );

  const percentages = attempts.map(
    (attempt) =>
      Number(attempt.result!.percentage)
  );

  const totalAttempts = attempts.length;

  const averageScore =
    totalAttempts > 0
      ? scores.reduce(
          (sum, score) => sum + score,
          0
        ) / totalAttempts
      : 0;

  const averagePercentage =
    totalAttempts > 0
      ? percentages.reduce(
          (sum, percentage) =>
            sum + percentage,
          0
        ) / totalAttempts
      : 0;

  const bestScore =
    scores.length > 0
      ? Math.max(...scores)
      : 0;

  return {
    student: membership.user,

    summary: {
      totalAttempts,

      averageScore: Number(
        averageScore.toFixed(2)
      ),

      bestScore,

      averagePercentage: Number(
        averagePercentage.toFixed(2)
      )
    },

    performances
  };
}


///leaderboard


export async function getExamLeaderboard(
  clubId: string,
  examId: string
) {
  // 1. Verify exam belongs to this club
  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      clubId
    },
    select: {
      id: true,
      title: true
    }
  });

  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }

  // 2. Get all evaluated attempts
  const attempts = await prisma.attempt.findMany({
    where: {
      examSession: {
        examId
      },

      status: {
        in: [
          "SUBMITTED",
          "AUTO_SUBMITTED"
        ]
      },

      result: {
        isNot: null
      }
    },

    orderBy: [
      {
        result: {
          score: "desc"
        }
      },
      {
        submittedAt: "asc"
      }
    ],

    select: {
      id: true,
      userId: true,
      submittedAt: true,
      status: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },

      examSession: {
        select: {
          id: true,
          name: true
        }
      },

      result: {
        select: {
          score: true,
          totalMarks: true,
          percentage: true,
          correctAnswers: true,
          wrongAnswers: true,
          attemptedQuestions: true
        }
      }
    }
  });

  // 3. Keep only best attempt per student
  const bestAttempts = new Map<
    string,
    (typeof attempts)[number]
  >();

  for (const attempt of attempts) {
    const existing =
      bestAttempts.get(attempt.userId);

    if (!existing) {
      bestAttempts.set(
        attempt.userId,
        attempt
      );
      continue;
    }

    const currentScore = Number(
      attempt.result!.score
    );

    const existingScore = Number(
      existing.result!.score
    );

    if (currentScore > existingScore) {
      bestAttempts.set(
        attempt.userId,
        attempt
      );
    }
  }

  // 4. Convert to leaderboard
  const leaderboard = Array.from(
    bestAttempts.values()
  )
    .sort((a, b) => {
      const scoreA = Number(
        a.result!.score
      );

      const scoreB = Number(
        b.result!.score
      );

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // Tie breaker:
      // student who submitted earlier ranks higher
      const timeA =
        a.submittedAt?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      const timeB =
        b.submittedAt?.getTime() ??
        Number.MAX_SAFE_INTEGER;

      return timeA - timeB;
    })
    .map((attempt, index) => ({
      rank: index + 1,

      student: {
        id: attempt.user.id,
        name: attempt.user.name,
        email: attempt.user.email
      },

      attempt: {
        id: attempt.id,
        status: attempt.status,
        submittedAt:
          attempt.submittedAt
      },

      session: {
        id: attempt.examSession.id,
        name: attempt.examSession.name
      },

      result: attempt.result
    }));

  return {
    exam,

    totalStudents:
      leaderboard.length,

    leaderboard
  };
}