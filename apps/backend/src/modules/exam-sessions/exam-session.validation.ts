import { z } from "zod";

export const createExamSessionSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(100)
      .optional(),

    accessMode: z.enum([
      "SCHEDULED",
      "DYNAMIC"
    ]),

    startTime: z
      .string()
      .datetime()
      .optional(),

    endTime: z
      .string()
      .datetime()
      .optional(),

    password: z
      .string()
      .min(4)
      .max(100)
      .optional()
  })
  .superRefine((data, ctx) => {

    // Scheduled → time required
    if (data.accessMode === "SCHEDULED") {

      if (!data.startTime) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message:
            "startTime is required for scheduled session"
        });
      }

      if (!data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message:
            "endTime is required for scheduled session"
        });
      }

      if (
        data.startTime &&
        data.endTime &&
        new Date(data.endTime) <=
          new Date(data.startTime)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message:
            "endTime must be after startTime"
        });
      }
    }

    // Dynamic → fixed time should not be provided
    if (data.accessMode === "DYNAMIC") {

      if (data.startTime || data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["accessMode"],
          message:
            "Dynamic session cannot have startTime or endTime"
        });
      }
    }
  });