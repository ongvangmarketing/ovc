export type StudentStatus = "new" | "learning" | "risk" | "completed";

export type StudentViewMode = "board" | "table" | "timeline";

export type StudentSortKey = "name" | "progress" | "active" | "status";

export type StudentWorkspaceItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollments: number;
  active: number;
  completed: number;
  progress: number;
  status: StudentStatus;
  owner: string;
  nextAction: string;
  note: string;
  activity: string[];
};
