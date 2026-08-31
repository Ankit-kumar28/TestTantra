import bcrypt from "bcrypt";
import { prisma } from "../../config/database.js";
import type { RegisterInput, LoginInput } from "./auth.types.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true
    }
  });

  return user;
}




export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    },
    include: {
      memberships: {
        include: {
          club: true
        }
      }
    }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("USER_ACCOUNT_INACTIVE");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      isPlatformAdmin: user.isPlatformAdmin,
      clubMemberships: user.memberships
    },
    accessToken
  };
}