import { getTenantDb } from "@/lib/db";

export class AdminService {
  static async getOrganizationDetail(id: string) {
    return getTenantDb().organization.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { name: true, email: true } } }
        },
        moduleLicenses: {
          include: {
            module: true,
            plan: { select: { id: true, code: true, name: true } },
          },
        },
        _count: { select: { members: true, contacts: true, projects: true } },
      },
    });
  }

  static async getPlatformModules() {
    return getTenantDb().platformModule.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  static async getAllUsers() {
    return getTenantDb().user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        organizationMembers: {
          select: {
            organization: {
              select: { name: true, slug: true }
            }
          }
        }
      }
    });
  }
}
