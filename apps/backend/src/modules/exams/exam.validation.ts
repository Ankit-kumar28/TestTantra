import { z } from "zod";

export const createExamSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200),

  description: z
    .string()
    .max(2000)
    .optional(),

  instructions: z
    .string()
    .max(5000)
    .optional(),

  durationMinutes: z
    .number()
    .int()
    .min(1)
    .max(600),

  accessMode: z.enum([
    "SCHEDULED",
    "DYNAMIC"
  ])
});