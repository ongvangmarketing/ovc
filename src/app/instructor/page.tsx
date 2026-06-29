import { requireInstructorPortal } from "@/lib/auth/rbac";

export default async function InstructorPage() {
  await requireInstructorPortal();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>
      <p>Welcome to the Instructor Portal.</p>
    </div>
  );
}
