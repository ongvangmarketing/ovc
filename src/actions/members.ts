"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

export async function getMembers() {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  // Lấy danh sách OrganizationMember kèm theo User info
  const members = await db.organizationMember.findMany({
    where: { 
      organizationId: session.organizationId,
      role: { in: ["OWNER", "ADMIN", "MEMBER"] }
    },
    include: {
      user: {
        include: {
          coreRoles: {
            where: { role: { organizationId: session.organizationId } },
            include: { role: true }
          },
          departments: {
            where: { department: { organizationId: session.organizationId } },
            include: { department: true }
          },
          teams: {
            where: { team: { organizationId: session.organizationId } },
            include: { team: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const mappedMembers = members.map(m => {
    const user = m.user;
    return {
      id: user.id,
      name: user.name || "Chưa cập nhật",
      email: user.email || "N/A",
      role: user.coreRoles[0]?.role || null,
      department: user.departments[0]?.department || null,
      teams: user.teams.map((ct: any) => ct.team),
    };
  });

  // Đảm bảo không có user trùng lặp (tránh lỗi duplicate key trong React)
  return Array.from(new Map(mappedMembers.map(m => [m.id, m])).values());
}

export async function updateMemberAccess(userId: string, data: {
  roleId?: string | null;
  departmentId?: string | null;
  teamIds: string[];
}) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  // Đảm bảo user này thuộc tổ chức
  const member = await db.organizationMember.findFirst({
    where: { 
      organizationId: session.organizationId,
      userId
    }
  });

  if (!member) throw new Error("Người dùng không thuộc tổ chức này.");

  await db.$transaction(async (tx) => {
    // 1. Cập nhật Role (Xóa cũ, thêm mới)
    await tx.coreUserRole.deleteMany({
      where: { userId }
    });
    if (data.roleId) {
      // Xác minh role thuộc org
      const role = await tx.role.findFirst({ where: { id: data.roleId, organizationId: session.organizationId }});
      if (role) {
        await tx.coreUserRole.create({
          data: { userId, roleId: role.id }
        });
      }
    }

    // 2. Cập nhật Department
    await tx.coreUserDepartment.deleteMany({
      where: { userId }
    });
    if (data.departmentId) {
      const dept = await tx.department.findFirst({ where: { id: data.departmentId, organizationId: session.organizationId }});
      if (dept) {
        await tx.coreUserDepartment.create({
          data: { userId, departmentId: dept.id }
        });
      }
    }

    // 3. Cập nhật Teams
    await tx.coreUserTeam.deleteMany({
      where: { userId }
    });
    
    for (const tId of data.teamIds) {
      const team = await tx.team.findFirst({ where: { id: tId, organizationId: session.organizationId }});
      if (team) {
        await tx.coreUserTeam.create({
          data: { userId, teamId: team.id }
        });
      }
    }
  });

  revalidatePath("/workspace/settings/roles-permissions/members");
}
