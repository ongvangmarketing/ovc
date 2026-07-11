import { requireCustomerPortal } from "@/lib/auth/rbac";
import { PortalShell } from "./portal-shell";
import { getCustomerPortalData } from "./portal-data";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPortal();
  const data = await getCustomerPortalData(); // Needed for customerName etc., or we can just pass session data
  
  return (
    <PortalShell 
      customerName={data.customerName || session.user.name || "Customer"} 
      email={session.user.email} 
      brand={{ name: "OngVàng", favicon: "/brand/ong-vang-logo.svg" }}
    >
      {children}
    </PortalShell>
  );
}
