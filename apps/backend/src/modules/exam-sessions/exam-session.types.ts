export interface CreateExamSessionInput {
  name?: string;

  accessMode:
    | "SCHEDULED"
    | "DYNAMIC";

  startTime?: string;
  endTime?: string;

  password?: string;
}

export interface UpdateExamSessionInput {
  name?: string;

  accessMode?:
    | "SCHEDULED"
    | "DYNAMIC";

  startTime?: string;
  endTime?: string;

  password?: string;
}