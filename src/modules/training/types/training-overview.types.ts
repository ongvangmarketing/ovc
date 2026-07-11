// ─── Tab navigation ───────────────────────────────────────────────────────────
export type OverviewTab = "courses" | "classes" | "students";

// ─── Course ───────────────────────────────────────────────────────────────────
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseViewMode = "board" | "table";
export type CourseSortKey = "title" | "price" | "enrollments" | "classes";
export type CourseSortDir = "asc" | "desc";

export type OverviewCourse = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  status: CourseStatus;
  level: CourseLevel;
  classes: number;
  enrollments: number;
  price: number;
  language: string;
  isPublic: boolean;
  isFeatured: boolean;
  activity: string[];
};

// ─── Class ────────────────────────────────────────────────────────────────────
export type ClassStatus = "upcoming" | "opening" | "full" | "closed";
export type ClassSortKey = "name" | "startDate" | "students" | "status";

export type OverviewClass = {
  id: string;
  name: string;
  code: string;
  course: string;
  courseId: string;
  instructor: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  maxStudents: number;
  students: number;
  isActive: boolean;
  status: ClassStatus;
  capacityRate: number;
  nextAction: string;
  activity: string[];
};

// ─── Student ──────────────────────────────────────────────────────────────────
export type StudentStatus = "new" | "learning" | "risk" | "completed";
export type StudentSortKey = "name" | "progress" | "active" | "status";

export type OverviewStudent = {
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

// ─── Alert ────────────────────────────────────────────────────────────────────
export type AlertTone = "red" | "amber" | "orange" | "blue";

export type OverviewAlert = {
  id: string;
  label: string;
  href: string;
  tone: AlertTone;
  icon: string; // lucide icon name
};

// ─── Stat card ────────────────────────────────────────────────────────────────
export type OverviewStat = {
  id: string;
  label: string;
  value: number | string;
  note: string;
  tone: string;
  icon: string;
};

// ─── Initial data shape passed from server ────────────────────────────────────
export type TrainingOverviewData = {
  courses: OverviewCourse[];
  classes: OverviewClass[];
  students: OverviewStudent[];
  alerts: OverviewAlert[];
  stats: OverviewStat[];
};
