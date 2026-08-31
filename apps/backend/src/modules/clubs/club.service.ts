import { prisma } from "../../config/database.js";
import type { CreateClubInput } from "./club.types.js";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createClub(
  input: CreateClubInput,
  userId: string
) {
  let slug = input.slug
    ? generateSlug(input.slug)
    : generateSlug(input.name);

  if (!slug) slug = "club";

  // Collision resolution: append counter (-2, -3, etc.) if slug exists
  let existingClub = await prisma.club.findUnique({
    where: { slug }
  });

  let counter = 2;
  const baseSlug = slug;
  while (existingClub) {
    slug = `${baseSlug}-${counter}`;
    existingClub = await prisma.club.findUnique({
      where: { slug }
    });
    counter++;
  }

  const result = await prisma.$transaction(async (tx) => {
    const club = await tx.club.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        collegeName: input.collegeName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        status: "PENDING"
      }
    });

    const membership = await tx.clubMembership.create({
      data: {
        userId,
        clubId: club.id,
        role: "ADMIN",
        status: "PENDING"
      }
    });

    return {
      club,
      membership
    };
  });

  return result;
}



//// dashboard

export async function getClubDashboard(
  clubId: string
) {
  // 1. Verify club exists
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  // 2. Exam statistics
  const totalExams =
    await prisma.exam.count({
      where: {
        clubId
      }
    });

  const publishedExams =
    await prisma.exam.count({
      where: {
        clubId,
        status: "PUBLISHED"
      }
    });

  const draftExams =
    await prisma.exam.count({
      where: {
        clubId,
        status: "DRAFT"
      }
    });

  const archivedExams =
    await prisma.exam.count({
      where: {
        clubId,
        status: "ARCHIVED"
      }
    });

  // 3. Student count
  const totalStudents =
    await prisma.clubMembership.count({
      where: {
        clubId,
        status: "ACTIVE",
        role: "MEMBER"
      }
    });

  // 4. Attempts belonging to this club
  const attempts =
    await prisma.attempt.findMany({
      where: {
        examSession: {
          exam: {
            clubId
          }
        }
      },

      select: {
        status: true,

        result: {
          select: {
            score: true,
            percentage: true
          }
        }
      }
    });

  const totalAttempts =
    attempts.length;

  const completedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" ||
        attempt.status === "AUTO_SUBMITTED"
    ).length;

  const autoSubmittedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status === "AUTO_SUBMITTED"
    ).length;

  const inProgressAttempts =
    attempts.filter(
      (attempt) =>
        attempt.status === "IN_PROGRESS"
    ).length;

  // 5. Average performance
  const evaluatedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.result !== null
    );

  const scores =
    evaluatedAttempts.map(
      (attempt) =>
        Number(attempt.result!.score)
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

  // 6. Upcoming sessions
  const upcomingSessions =
    await prisma.examSession.findMany({
      where: {
        exam: {
          clubId
        },

        startTime: {
          gt: new Date()
        },

        status: "SCHEDULED"
      },

      orderBy: {
        startTime: "asc"
      },

      take: 5,

      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        status: true,

        exam: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

  // 7. Recent exams
  const recentExams =
    await prisma.exam.findMany({
      where: {
        clubId
      },

      orderBy: {
        createdAt: "desc"
      },

      take: 5,

      select: {
        id: true,
        title: true,
        status: true,
        durationMinutes: true,
        createdAt: true,

        _count: {
          select: {
            sessions: true
          }
        }
      }
    });

  return {
    club,

    exams: {
      total: totalExams,
      published: publishedExams,
      draft: draftExams,
      archived: archivedExams
    },

    students: {
      total: totalStudents
    },

    attempts: {
      total: totalAttempts,
      completed: completedAttempts,
      autoSubmitted: autoSubmittedAttempts,
      inProgress: inProgressAttempts
    },

    performance: {
      evaluatedAttempts:
        evaluatedAttempts.length,

      averageScore: Number(
        averageScore.toFixed(2)
      ),

      averagePercentage: Number(
        averagePercentage.toFixed(2)
      )
    },

    upcomingSessions,

    recentExams
  };
}


