import { getTenantDb } from "@/lib/db";

export class AuthorizationService {
  /**
   * Kiểm tra quyền của User trong 1 Organization.
   * Đây là phương thức lõi sẽ được gọi trong tất cả các Server Actions.
   *
   * @param userId ID của User
   * @param organizationId ID của Organization
   * @param permissionAction Tên permission (vd: "lead.view", "invoice.approve")
   * @throws Error nếu không có quyền
   */
  static async checkPermission(
    userId: string,
    organizationId: string,
    permissionAction: string
  ): Promise<boolean> {
    const db = getTenantDb(organizationId);

    // 1. Kiểm tra xem user có phải là SUPER_ADMIN không (có toàn quyền hệ thống)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === "SUPER_ADMIN") {
      return true;
    }

    // 2. Tạm thời: Lấy các CoreUserRole của user trong organization
    const userRoles = await db.coreUserRole.findMany({
      where: {
        userId,
        role: {
          organizationId,
          status: "ACTIVE",
        },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // 3. Kiểm tra xem trong các Role của user có Role nào chứa permission tương ứng không
    const hasPermission = userRoles.some((ur) =>
      ur.role.permissions.some((rp) => rp.permission.action === permissionAction)
    );

    // Lưu ý: Đối với phiên bản đầy đủ, ta sẽ phải tính đến RoleInheritance (kế thừa Role) 
    // và ResourceAccess (quyền trên từng tài nguyên).

    if (!hasPermission) {
      throw new Error(`Bạn không có quyền thực hiện hành động này: ${permissionAction}`);
    }

    return true;
  }

  /**
   * Kiểm tra quyền truy cập trên 1 tài nguyên cụ thể (Resource Access).
   * Ví dụ: Một Lead cụ thể, Một Task cụ thể, Một Project cụ thể.
   * Hỗ trợ kiểm tra quyền được gán trực tiếp cho User, hoặc gián tiếp qua Team, Department.
   */
  static async checkResourceAccess(
    userId: string,
    organizationId: string,
    resourceType: string, // VD: "LEAD", "TASK", "PROJECT"
    resourceId: string,
    requiredLevel: string = "VIEW" // "VIEW", "EDIT", "FULL"
  ): Promise<boolean> {
    const db = getTenantDb(organizationId);

    const [user, member] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      }),
      db.organizationMember.findFirst({
        where: { organizationId, userId },
        select: { role: true },
      })
    ]);

    if (
      user?.role === "SUPER_ADMIN" || 
      user?.role === "ADMIN" || 
      member?.role === "OWNER" || 
      member?.role === "ADMIN"
    ) {
      return true;
    }

    // Định nghĩa trọng số quyền để so sánh (FULL > EDIT > VIEW)
    const levelWeight: Record<string, number> = { VIEW: 1, EDIT: 2, FULL: 3 };
    const requiredWeight = levelWeight[requiredLevel] || 1;

    // 2. Truy xuất tất cả ResourceAccess liên quan đến tài nguyên này
    const accessRecords = await db.resourceAccess.findMany({
      where: {
        organizationId,
        resourceType,
        resourceId,
      },
    });

    // Nếu không có bất kỳ ai được cấp quyền (có thể tài nguyên này public hoặc logic mặc định của hệ thống)
    // Ở đây ta mặc định: Tài nguyên đã được bật Resource Access thì phải có quyền mới được vào.
    if (!accessRecords.length) {
      console.log(`[AUTH FAILED] No access records found for ${resourceType} ${resourceId} in org ${organizationId}`);
      return false; 
    }

    // 3. Lấy thông tin Teams và Departments của User
    const [userTeams, userDepts] = await Promise.all([
      db.coreUserTeam.findMany({ where: { userId }, select: { teamId: true } }),
      db.coreUserDepartment.findMany({ where: { userId }, select: { departmentId: true } })
    ]);

    const myTeamIds = userTeams.map(t => t.teamId);
    const myDeptIds = userDepts.map(d => d.departmentId);

    // 4. Kiểm tra xem user có quyền nào thỏa mãn trọng số không
    const hasAccess = accessRecords.some(access => {
      // Có quyền trực tiếp?
      const isDirectMatch = access.userId === userId;
      // Có quyền thông qua Team?
      const isTeamMatch = access.teamId && myTeamIds.includes(access.teamId);
      // Có quyền thông qua Department?
      const isDeptMatch = access.departmentId && myDeptIds.includes(access.departmentId);

      if (isDirectMatch || isTeamMatch || isDeptMatch) {
        const grantedWeight = levelWeight[access.permissionLevel] || 1;
        return grantedWeight >= requiredWeight;
      }

      return false;
    });

    if (!hasAccess) {
      console.log(`[AUTH FAILED] User ${userId} has no required access level ${requiredLevel} for ${resourceType} ${resourceId} in org ${organizationId}. Records:`, accessRecords);
      throw new Error(`Bạn không có quyền truy cập vào tài nguyên ${resourceType} này ở cấp độ ${requiredLevel}.`);
    }

    return true;
  }
}
