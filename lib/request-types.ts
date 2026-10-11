export const REQUEST_STAGES = [
  { value: "received", label: "접수" },
  { value: "consultation", label: "상담" },
  { value: "estimate", label: "견적" },
  { value: "in_progress", label: "진행" },
  { value: "completed", label: "완료" },
] as const;
export type RequestStage = (typeof REQUEST_STAGES)[number]["value"];
export type RequestHistory = { stage: RequestStage; note: string; at: string };
export type TrackedRequest = {
  id: string;
  reference: string;
  name: string;
  email: string;
  service: string;
  budget: string;
  stage: RequestStage;
  note: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  history: RequestHistory[];
};
export type CustomerRequest = Omit<TrackedRequest, "email" | "name">;
export type DeletedRequest = { id: string; deleted: true; expiresAt: string };
