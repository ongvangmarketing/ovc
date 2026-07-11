export type ClassStatus = "upcoming" | "opening" | "full" | "closed";

export type ClassViewMode = "board" | "table" | "timeline";

export type ClassSortKey = "startDate" | "name" | "students" | "status";

export type ClassWorkspaceItem = {
  id: string;
  name: string;
  code: string;
  course: string;
  instructor: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  maxStudents: number;
  students: number;
  isActive: boolean;
  status: ClassStatus;
  capacityRate: number;
  risk: string | null;
  nextAction: string;
  activity: string[];
};
