import { CourseStatus, EnrollmentStatus } from "@prisma/client";

export type TrainingCourseRow = {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  level: string;
  price: number;
  currency: string;
  duration: number | null;
  instructor: string;
  classes: number;
  enrollments: number;
  publishedAt: string | null;
};

export type TrainingStudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollments: number;
  active: number;
  completed: number;
  progress: number;
};

export type TrainingInstructorRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  courses: number;
  classes: number;
};

export type TrainingClassRow = {
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
};

export type TrainingCertificateRow = {
  id: string;
  student: string;
  email: string;
  course: string;
  className: string;
  status: EnrollmentStatus;
  progress: number;
  issuedAt: string | null;
};

export type TrainingTuitionRow = {
  id: string;
  student: string;
  email: string;
  course: string;
  className: string;
  invoiceId: string | null;
  invoiceNumber: string;
  invoiceStatus: string | null;
  invoiceAmountDue: number;
  tuitionFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  enrolledAt: string | null;
};

export type TrainingPotentialStudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  interestedIn: string;
  status: string;
  note: string;
  nextFollowUpAt: string | null;
};

export type TrainingScheduleRow = {
  id: string;
  title: string;
  course: string;
  instructor: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  schedule: string;
  source: "CLASS" | "LESSON";
  href: string;
  mode?: string;
};

export type TrainingFormOptions = {
  courses: { id: string; title: string; price: number }[];
  classes: { id: string; name: string; courseId: string; courseTitle: string; price: number; startDate: string | null; endDate: string | null }[];
  instructors: { id: string; name: string; email: string }[];
  students: { id: string; name: string; email: string }[];
};
