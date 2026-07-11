"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

export async function getResourceAccess(resourceType: string, resourceId: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const accesses = await db.resourceAccess.findMany({
    where: {
      organizationId: session.organizationId,
      resourceType,
      resourceId,
    },
    include: {
      user: true,
      department: true,
      team: true,
    }
  });

  return accesses;
}

export async function grantResourceAccess(
  resourceType: string, 
  resourceId: string, 
  assigneeType: "USER" | "DEPARTMENT" | "TEAM",
  assigneeId: string,
  level: "VIEW" | "EDIT" | "FULL"
) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const data: any = {
    organizationId: session.organizationId,
    resourceType,
    resourceId,
    permissionLevel: level,
  };

  if (assigneeType === "USER") data.userId = assigneeId;
  if (assigneeType === "DEPARTMENT") data.departmentId = assigneeId;
  if (assigneeType === "TEAM") data.teamId = assigneeId;

  // Upsert để nếu đã tồn tại thì cập nhật quyền
  const existing = await db.resourceAccess.findFirst({
    where: {
      organizationId: session.organizationId,
      resourceType,
      resourceId,
      userId: assigneeType === "USER" ? assigneeId : undefined,
      departmentId: assigneeType === "DEPARTMENT" ? assigneeId : undefined,
      teamId: assigneeType === "TEAM" ? assigneeId : undefined,
    }
  });

  if (existing) {
    await db.resourceAccess.update({
      where: { id: existing.id },
      data: { permissionLevel: level }
    });
  } else {
    await db.resourceAccess.create({ data });
  }

  // Chú ý: revalidatePath sẽ cần chạy trên URL tương ứng của resource
  // Tạm thời gọi chung.
  revalidatePath(`/workspace/${resourceType.toLowerCase()}s/${resourceId}`);
}

export async function revokeResourceAccess(id: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  await db.resourceAccess.delete({
    where: { id, organizationId: session.organizationId }
  });
}

// Dùng cho Autocomplete Search trong form Share
export async function searchAssignees(query: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const [users, depts, teams] = await Promise.all([
    db.user.findMany({
      where: { 
        organizationMembers: { 
          some: { 
            organizationId: session.organizationId,
            role: { in: ["OWNER", "ADMIN", "MEMBER"] }
          } 
        },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 5
    }),
    db.department.findMany({
      where: { 
        organizationId: session.organizationId,
        name: { contains: query, mode: "insensitive" }
      },
      take: 3
    }),
    db.team.findMany({
      where: { 
        organizationId: session.organizationId,
        name: { contains: query, mode: "insensitive" }
      },
      take: 3
    })
  ]);

  return { users, depts, teams };
}
