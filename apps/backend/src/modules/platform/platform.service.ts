import { prisma } from "../../config/database.js";

export async function approveClub(clubId: string) {
  return prisma.$transaction(async (tx) => {
    const club = await tx.club.findUnique({
      where: {
        id: clubId
      }
    });

    if (!club) {
      throw new Error("CLUB_NOT_FOUND");
    }

    if (club.status === "APPROVED") {
      throw new Error("CLUB_ALREADY_APPROVED");
    }

    const updatedClub = await tx.club.update({
      where: {
        id: clubId
      },
      data: {
        status: "APPROVED"
      }
    });

    await tx.clubMembership.updateMany({
      where: {
        clubId,
        role: "ADMIN",
        status: "PENDING"
      },
      data: {
        status: "ACTIVE",
        joinedAt: new Date()
      }
    });

    return updatedClub;
  });
}


export async function rejectClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  if (club.status !== "PENDING") {
    throw new Error("CLUB_CANNOT_BE_REJECTED");
  }

  return prisma.club.update({
    where: {
      id: clubId
    },
    data: {
      status: "REJECTED"
    }
  });
}

export async function suspendClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  if (club.status !== "APPROVED") {
    throw new Error("CLUB_CANNOT_BE_SUSPENDED");
  }

  return prisma.club.update({
    where: {
      id: clubId
    },
    data: {
      status: "SUSPENDED"
    }
  });
}

export async function restoreClub(clubId: string) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  if (club.status !== "SUSPENDED") {
    throw new Error("CLUB_CANNOT_BE_RESTORED");
  }

  return prisma.club.update({
    where: {
      id: clubId
    },
    data: {
      status: "APPROVED"
    }
  });
}



export async function listClubs(params: {
  page: number;
  limit: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
}) {
  const { page, limit, status } = params;

  const skip = (page - 1) * limit;

  const where = status
    ? {
        status
      }
    : {};

  const [clubs, total] = await prisma.$transaction([
    prisma.club.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        slug: true,
        collegeName: true,
        contactEmail: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    }),

    prisma.club.count({
      where
    })
  ]);

  return {
    clubs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}


export async function getClubDetails(
  clubId: string
) {
  const club = await prisma.club.findUnique({
    where: {
      id: clubId
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      collegeName: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          memberships: true,
          exams: true
        }
      },

      memberships: {
        where: {
          status: "ACTIVE"
        },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          joinedAt: "desc"
        }
      }
    }
  });

  if (!club) {
    throw new Error("CLUB_NOT_FOUND");
  }

  return club;
}




export async function getPlatformOverview() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,

    totalClubs,
    pendingClubs,
    approvedClubs,
    rejectedClubs,
    suspendedClubs,

    totalExams,
    publishedExams,
    draftExams,
    archivedExams,

    totalAttempts,
    completedAttempts,
    inProgressAttempts,
    abandonedAttempts
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        status: "ACTIVE"
      }
    }),

    prisma.user.count({
      where: {
        status: "SUSPENDED"
      }
    }),

    prisma.club.count(),

    prisma.club.count({
      where: {
        status: "PENDING"
      }
    }),

    prisma.club.count({
      where: {
        status: "APPROVED"
      }
    }),

    prisma.club.count({
      where: {
        status: "REJECTED"
      }
    }),

    prisma.club.count({
      where: {
        status: "SUSPENDED"
      }
    }),

    prisma.exam.count(),

    prisma.exam.count({
      where: {
        status: "PUBLISHED"
      }
    }),

    prisma.exam.count({
      where: {
        status: "DRAFT"
      }
    }),

    prisma.exam.count({
      where: {
        status: "ARCHIVED"
      }
    }),

    prisma.attempt.count(),

    prisma.attempt.count({
      where: {
        status: {
          in: ["SUBMITTED", "AUTO_SUBMITTED"]
        }
      }
    }),

    prisma.attempt.count({
      where: {
        status: "IN_PROGRESS"
      }
    }),

    prisma.attempt.count({
      where: {
        status: "ABANDONED"
      }
    })
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers
    },

    clubs: {
      total: totalClubs,
      pending: pendingClubs,
      approved: approvedClubs,
      rejected: rejectedClubs,
      suspended: suspendedClubs
    },

    exams: {
      total: totalExams,
      published: publishedExams,
      draft: draftExams,
      archived: archivedExams
    },

    attempts: {
      total: totalAttempts,
      completed: completedAttempts,
      inProgress: inProgressAttempts,
      abandoned: abandonedAttempts
    }
  };
}