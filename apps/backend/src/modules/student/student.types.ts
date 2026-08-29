export interface JoinClubInput {
  clubId: string;
}
export interface StartAttemptInput {
  password?: string;
}
export interface SaveAnswerInput {
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
}