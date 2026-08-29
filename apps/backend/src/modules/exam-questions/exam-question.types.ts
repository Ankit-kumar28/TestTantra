export interface CreateExamQuestionInput {
  questionId: string;
  position: number;
  marks: number;
  negativeMarks?: number;
}

export interface UpdateExamQuestionInput {
  position?: number;
  marks?: number;
  negativeMarks?: number;
}