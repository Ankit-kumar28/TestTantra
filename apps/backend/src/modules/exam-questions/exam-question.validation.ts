import { z } from "zod";


export const createExamQuestionSchema = z.object({
  questionId: z
    .string()
    .uuid("Invalid question ID"),

  position: z
    .number()
    .int()
    .min(1, "Position must be at least 1"),

  marks: z
    .number()
    .positive("Marks must be greater than 0"),

  negativeMarks: z
    .number()
    .min(0, "Negative marks cannot be negative")
    .optional()
    .default(0)
});

export const updateExamQuestionSchema = z.object({
  position: z
    .number()
    .int()
    .min(1)
    .optional(),

  marks: z
    .number()
    .positive()
    .optional(),

  negativeMarks: z
    .number()
    .min(0)
    .optional()
});

