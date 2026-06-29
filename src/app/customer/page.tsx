import { requireCustomerPortal } from "@/lib/auth/rbac";

export default async function CustomerPage() {
  await requireCustomerPortal();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p>Welcome to the Customer Portal.</p>
    </div>
  );
}
