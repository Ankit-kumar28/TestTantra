export interface CreateExamInput {
  title: string;
  description?: string;
  instructions?: string;
  durationMinutes: number;
  accessMode: "SCHEDULED" | "DYNAMIC";
}