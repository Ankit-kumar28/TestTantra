import { z } from "zod";

export const saveAnswerSchema = z
  .object({
    questionId: z
      .string()
      .uuid("Invalid question ID"),

    selectedOptionId: z
      .string()
      .uuid("Invalid option ID")
      .optional(),

    answerText: z
      .string()
      .optional()
  })
  .refine(
    (data) =>
      data.selectedOptionId !== undefined ||
      data.answerText !== undefined,
    {
      message:
        "Either selectedOptionId or answerText is required"
    }
  );