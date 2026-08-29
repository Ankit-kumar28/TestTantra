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