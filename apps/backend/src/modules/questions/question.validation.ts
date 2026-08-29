import { z } from "zod";

const questionOptionSchema = z.object({
  optionText: z
    .string()
    .trim()
    .min(1, "Option text is required")
    .max(1000, "Option text is too long"),

  position: z
    .number()
    .int()
    .min(1, "Position must be at least 1"),

  isCorrect: z.boolean()
});

export const createQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1, "Question text is required")
      .max(5000, "Question text is too long"),

    type: z.enum([
      "MCQ_SINGLE",
      "MCQ_MULTI",
      "TRUE_FALSE",
      "FILL_BLANK"
    ]),

    difficulty: z.enum([
      "EASY",
      "MEDIUM",
      "HARD"
    ]),

    explanation: z
      .string()
      .trim()
      .max(5000, "Explanation is too long")
      .optional(),

    options: z
      .array(questionOptionSchema)
      .optional()
  })
  .superRefine((data, ctx) => {
    /*
     * MCQ_SINGLE
     * ----------------
     * Must have options
     * Exactly one correct option
     */
    if (data.type === "MCQ_SINGLE") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "MCQ_SINGLE must have at least 2 options"
        });

        return;
      }

      const correctOptions = data.options.filter(
        (option) => option.isCorrect
      );

      if (correctOptions.length !== 1) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "MCQ_SINGLE must have exactly one correct option"
        });
      }
    }

    /*
     * MCQ_MULTI
     * ----------------
     * Must have options
     * At least two correct options
     */
    if (data.type === "MCQ_MULTI") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "MCQ_MULTI must have at least 2 options"
        });

        return;
      }

      const correctOptions = data.options.filter(
        (option) => option.isCorrect
      );

      if (correctOptions.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "MCQ_MULTI must have at least 2 correct options"
        });
      }
    }

    /*
     * TRUE_FALSE
     * ----------------
     * Exactly two options
     * Exactly one correct option
     */
    if (data.type === "TRUE_FALSE") {
      if (!data.options || data.options.length !== 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "TRUE_FALSE must have exactly 2 options"
        });

        return;
      }

      const correctOptions = data.options.filter(
        (option) => option.isCorrect
      );

      if (correctOptions.length !== 1) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "TRUE_FALSE must have exactly one correct option"
        });
      }
    }

    /*
     * FILL_BLANK
     * ----------------
     * Options are not required
     */
    if (data.type === "FILL_BLANK") {
      if (data.options && data.options.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "FILL_BLANK cannot have options"
        });
      }
    }

    /*
     * Check duplicate positions
     */
    if (data.options) {
      const positions = data.options.map(
        (option) => option.position
      );

      const uniquePositions = new Set(positions);

      if (
        uniquePositions.size !== positions.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message:
            "Option positions must be unique"
        });
      }
    }
  });

export const updateQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .optional(),

    type: z
      .enum([
        "MCQ_SINGLE",
        "MCQ_MULTI",
        "TRUE_FALSE",
        "FILL_BLANK"
      ])
      .optional(),

    difficulty: z
      .enum([
        "EASY",
        "MEDIUM",
        "HARD"
      ])
      .optional(),

    explanation: z
      .string()
      .trim()
      .max(5000)
      .optional(),

    options: z
      .array(questionOptionSchema)
      .optional()
  })
  .strict();