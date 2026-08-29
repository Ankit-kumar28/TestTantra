import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import { createClubSchema } from "./club.validation.js";
import { createClub } from "./club.service.js";

export async function registerClub(
  req: AuthenticatedRequest,
  res: Response
) {
  const input = createClubSchema.parse(req.body);

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
      }
    });
  }

  const result = await createClub(
    input,
    req.user.id
  );

  return res.status(201).json({
    success: true,
    data: result
  });
}