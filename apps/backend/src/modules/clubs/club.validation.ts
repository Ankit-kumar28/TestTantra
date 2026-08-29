import { z } from "zod";

export const createClubSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(150),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only"
    ),

  description: z
    .string()
    .max(1000)
    .optional(),

  collegeName: z
    .string()
    .min(2)
    .max(200),

  contactEmail: z
    .string()
    .email(),

  contactPhone: z
    .string()
    .max(20)
    .optional()
});