"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const departments = await db.department.findMany({
    where: { organizationId: session.organizationId },
    include: {
      _count: {
        select: { users: true, teams: true }
      },
      teams: {
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { users: true } }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return departments.map(d => ({
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description,
    usersCount: d._count.users,
    teamsCount: d._count.teams,
    teams: d.teams,
  }));
}

export async function createDepartment(data: {
  name: string;
  code: string;
  description: string;
}) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const existing = await db.department.findFirst({
    where: {
      organizationId: session.organizationId,
      code: data.code,
    }
  });

  if (existing) {
    throw new Error(`Mã phòng ban "${data.code}" đã tồn tại!`);
  }

  const dept = await db.department.create({
    data: {
      organizationId: session.organizationId,
      name: data.name,
      code: data.code,
      description: data.description,
    }
  });

  revalidatePath("/workspace/settings/roles-permissions/departments");
  return dept;
}

export async function deleteDepartment(id: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  await db.department.delete({
    where: {
      id,
      organizationId: session.organizationId
    }
  });

  revalidatePath("/workspace/settings/roles-permissions/departments");
}

export async function createTeam(data: {
  departmentId: string;
  name: string;
  code: string;
  description: string;
}) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  const dept = await db.department.findFirst({
    where: {
      id: data.departmentId,
      organizationId: session.organizationId
    }
  });

  if (!dept) throw new Error("Phòng ban không tồn tại!");

  const existing = await db.team.findFirst({
    where: {
      organizationId: session.organizationId,
      code: data.code,
    }
  });

  if (existing) throw new Error(`Mã team "${data.code}" đã tồn tại!`);

  const team = await db.team.create({
    data: {
      organizationId: session.organizationId,
      departmentId: data.departmentId,
      name: data.name,
      code: data.code,
      description: data.description,
    }
  });

  revalidatePath("/workspace/settings/roles-permissions/departments");
  return team;
}

export async function deleteTeam(id: string) {
  const session = await requireAuth();
  const db = getTenantDb(session.organizationId);

  await db.team.delete({
    where: {
      id,
      organizationId: session.organizationId
    }
  });

  revalidatePath("/workspace/settings/roles-permissions/departments");
}
