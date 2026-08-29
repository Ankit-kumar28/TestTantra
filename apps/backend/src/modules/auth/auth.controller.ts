import type { Request, Response } from "express";
import {
  registerSchema,
  loginSchema
} from "./auth.validation.js";
import {
  registerUser,
  loginUser
} from "./auth.service.js";

export async function register(
  req: Request,
  res: Response
) {
  const input = registerSchema.parse(req.body);

  const user = await registerUser(input);

  res.status(201).json({
    success: true,
    data: {
      user
    }
  });
}

export async function login(
  req: Request,
  res: Response
) {
  const input = loginSchema.parse(req.body);

  const result = await loginUser(input);

  res.status(200).json({
    success: true,
    data: result
  });
}