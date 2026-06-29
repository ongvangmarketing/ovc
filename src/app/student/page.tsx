import { requireStudentPortal } from "@/lib/auth/rbac";

export default async function StudentPage() {
  await requireStudentPortal();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p>Welcome to the Student Portal.</p>
    </div>
  );
}
