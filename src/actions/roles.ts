"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { DataScope } from "@prisma/client";
import { revalidatePath } from "next/cache";

const DEFAULT_PERMISSIONS = [
  { group: "CRM", action: "lead.view", description: "Xem Leads" },
  { group: "CRM", action: "lead.create", description: "Tạo mới Lead" },
  { group: "CRM", action: "lead.update", description: "Cập nhật Lead" },
  { group: "CRM", action: "lead.delete", description: "Xóa Lead" },
  { group: "CRM", action: "deal.view", description: "Xem Deals" },
  { group: "CRM", action: "deal.manage", description: "Quản lý Deals" },
  { group: "Finance", action: "invoice.view", description: "Xem Hóa đơn" },
  { group: "Finance", action: "invoice.create", description: "Tạo Hóa đơn" },
  { group: "Finance", action: "invoice.approve", description: "Duyệt Hóa đơn" },
  { group: "Finance", action: "payment.view", description: "Xem Phiếu thu" },
  { group: "Finance", action: "payment.create", description: "Tạo Phiếu thu" },
  { group: "System", action: "user.view", description: "Xem Thành viên" },
  { group: "System", action: "user.manage", description: "Quản lý Thành viên" },
  { group: "System", action: "role.manage", description: "Quản lý Vai trò" },
  { group: "System", action: "settings.manage", description: "Quản lý Cài đặt" },
];

/**
 * Lấy danh sách toàn bộ các permission có trong hệ thống (Auto-seed nếu thiếu)
 */
export async function getAvailablePermissions() {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  // Đảm bảo các default permissions tồn tại trong DB (Upsert)
  // Thực tế có thể chạy seed script, ở đây sync on-the-fly cho tiện.
  for (const perm of DEFAULT_PERMISSIONS) {
    await db.permission.upsert({
      where: { action: perm.action },
      update: { group: perm.group, description: perm.description },
      create: { action: perm.action, group: perm.group, description: perm.description },
    });
  }

  const permissions = await db.permission.findMany({
    orderBy: [{ group: "asc" }, { action: "asc" }],
  });

  // Group by group
  const grouped = permissions.reduce((acc, curr) => {
    if (!acc[curr.group]) {
      acc[curr.group] = [];
    }
    acc[curr.group]!.push(curr);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return Object.keys(grouped).map(group => ({
    group,
    permissions: grouped[group]!.map(p => ({
      action: p.action,
      label: p.description || p.action,
    }))
  }));
}

export async function getRoles() {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const roles = await db.role.findMany({
    where: { organizationId: session.organizationId },
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { priority: "desc" }
  });

  return roles.map(role => ({
    id: role.id,
    name: role.name,
    code: role.code,
    status: role.status,
    priority: role.priority,
    dataScope: role.dataScope,
    usersCount: role._count.users,
  }));
}

export async function getRole(id: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const role = await db.role.findUnique({
    where: {
      id,
      organizationId: session.organizationId
    },
    include: {
      permissions: {
        include: { permission: true }
      }
    }
  });

  if (!role) return null;

  return {
    ...role,
    permissionActions: role.permissions.map(rp => rp.permission.action)
  };
}

export async function createRole(data: {
  name: string;
  code: string;
  description: string;
  priority: number;
  dataScope: DataScope;
  parentId?: string;
  permissions: string[];
}) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const existingRole = await db.role.findFirst({
    where: {
      organizationId: session.organizationId,
      code: data.code,
    }
  });

  if (existingRole) {
    throw new Error(`Mã code "${data.code}" đã tồn tại!`);
  }

  // Find permission IDs
  const perms = await db.permission.findMany({
    where: { action: { in: data.permissions } }
  });

  const role = await db.role.create({
    data: {
      organizationId: session.organizationId,
      name: data.name,
      code: data.code,
      description: data.description,
      priority: data.priority,
      dataScope: data.dataScope,
      parentId: data.parentId || null,
      status: "ACTIVE",
      permissions: {
        create: perms.map(p => ({ permissionId: p.id }))
      }
    }
  });

  revalidatePath("/workspace/settings/roles-permissions");
  return role;
}

export async function updateRole(id: string, data: {
  name: string;
  code: string;
  description: string;
  priority: number;
  dataScope: DataScope;
  parentId?: string;
  permissions: string[];
}) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const existingRole = await db.role.findFirst({
    where: {
      organizationId: session.organizationId,
      code: data.code,
      id: { not: id }
    }
  });

  if (existingRole) {
    throw new Error(`Mã code "${data.code}" đã tồn tại cho vai trò khác!`);
  }

  const perms = await db.permission.findMany({
    where: { action: { in: data.permissions } }
  });

  // Transaction to update role and sync permissions
  const role = await db.$transaction(async (tx) => {
    await tx.coreRolePermission.deleteMany({
      where: { roleId: id }
    });

    return tx.role.update({
      where: { id, organizationId: session.organizationId },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        priority: data.priority,
        dataScope: data.dataScope,
        parentId: data.parentId || null,
        permissions: {
          create: perms.map(p => ({ permissionId: p.id }))
        }
      }
    });
  });

  revalidatePath("/workspace/settings/roles-permissions");
  return role;
}

export async function deleteRole(id: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  await db.role.delete({
    where: {
      id,
      organizationId: session.organizationId
    }
  });

  revalidatePath("/workspace/settings/roles-permissions");
}
