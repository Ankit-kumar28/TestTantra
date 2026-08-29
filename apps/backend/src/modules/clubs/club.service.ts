import { prisma } from "../../config/database.js";
import type { CreateClubInput } from "./club.types.js";

export async function createClub(
  input: CreateClubInput,
  userId: string
) {
  const existingClub = await prisma.club.findUnique({
    where: {
      slug: input.slug
    }
  });

  if (existingClub) {
    throw new Error("CLUB_SLUG_ALREADY_EXISTS");
  }

  const result = await prisma.$transaction(async (tx) => {
    const club = await tx.club.create({
      data: {
        name: input.name,
        slug: input.slug,
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