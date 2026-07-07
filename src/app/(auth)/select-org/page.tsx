import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SelectOrgClient } from "./SelectOrgClient";

export default async function SelectOrgPage() {
  const hdrs = await headers();
  const result = await auth.api.getSession({
    headers: hdrs,
  });

  if (!result?.user) {
    redirect("/login");
  }

  // Find all organizations the user is a member of
  const members = await db.organizationMember.findMany({
    where: { userId: result.user.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const isSuperAdmin = result.user.role === "SUPER_ADMIN";

  if (isSuperAdmin) {
    redirect("/workspace/dashboard");
  }

  if (members.length === 0) {
    // Edge case: User has no organizations
    redirect("/login?error=no_organization");
  }

  if (members.length === 1) {
    // If only 1 organization, auto-select it and skip this page
    const member = members[0];
    if (!member) redirect("/login?error=no_organization");
    const orgId = member.organizationId;
    const role = result.user.role;
    let targetUrl = "/";
    if (role === "CUSTOMER") targetUrl = "/customer";
    else if (role === "INSTRUCTOR") targetUrl = "/instructor";
    else if (role === "STUDENT") targetUrl = "/student";
    else targetUrl = "/workspace/dashboard";

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <form action={async () => {
          "use server";
          const cookieStore = await cookies();
          cookieStore.set("better-auth.active_organization", orgId, { path: "/", maxAge: 2592000 });
          redirect(targetUrl);
        }}>
          <button id="auto-submit" type="submit" className="hidden">Đang chuyển hướng...</button>
          <script dangerouslySetInnerHTML={{ __html: `document.getElementById('auto-submit').click();` }} />
        </form>
        <div className="text-sm text-slate-500 animate-pulse">Đang chuẩn bị không gian làm việc...</div>
      </div>
    );
  }

  // More than 1 organization, show selection UI
  const orgs = members.map(m => m.organization);

  return <SelectOrgClient orgs={orgs} userName={result.user.name || result.user.email || ""} />;
}
