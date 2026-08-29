export interface QuestionOptionInput {
  optionText: string;
  position: number;
  isCorrect: boolean;
}

export interface CreateQuestionInput {
  questionText: string;

  type:
    | "MCQ_SINGLE"
    | "MCQ_MULTI"
    | "TRUE_FALSE"
    | "FILL_BLANK";

  difficulty:
    | "EASY"
    | "MEDIUM"
    | "HARD";

  explanation?: string;

  options?: QuestionOptionInput[];
}

export interface UpdateQuestionInput {
  questionText?: string;

  type?:
    | "MCQ_SINGLE"
    | "MCQ_MULTI"
    | "TRUE_FALSE"
    | "FILL_BLANK";

  difficulty?:
    | "EASY"
    | "MEDIUM"
    | "HARD";

  explanation?: string;

  options?: QuestionOptionInput[];
}