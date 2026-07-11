"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { ZaloSessionManager } from "../services/zalo-session.manager";
import { getSystemDb } from "@/lib/db";

export async function getZaloAccountsAction() {
  const session = await requireAuth();
  const organizationId = session.organizationId;
  if (!organizationId) {
    return { success: false, error: "Không tìm thấy Organization" };
  }
  
  const db = getSystemDb();
  const accounts = await db.zaloAccount.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true, image: true } }
    }
  });
  
  // Xóa credentials khi trả về client
  const safeAccounts = accounts.map(acc => {
    const { cookie, imei, secretKey, userAgent, ...rest } = acc;
    return rest;
  });
  
  return { success: true, data: safeAccounts };
}

export async function checkZaloStatusAction(accountId?: string, tempId?: string) {
  const session = await requireAuth();
  
  const service = ZaloSessionManager.getInstance();
  const status = await service.getStatus(accountId, tempId);
  
  return { success: true, data: status };
}

export async function initZaloLoginAction(tempId: string, isMaster: boolean) {
  const session = await requireAuth();
  const organizationId = session.organizationId;
  if (!organizationId) {
    return { success: false, error: "Không tìm thấy Organization" };
  }
  
  if (isMaster && (!session.user.role || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role))) {
    return { success: false, error: "Chỉ Admin/Manager mới được cấp quyền Master Zalo" };
  }

  try {
    const service = ZaloSessionManager.getInstance();
    const result = await service.initLogin(tempId, organizationId, session.user.id, isMaster);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function disconnectZaloAction(accountId: string) {
  const session = await requireAuth();
  
  const db = getSystemDb();
  const account = await db.zaloAccount.findUnique({ where: { id: accountId } });
  
  if (!account || account.organizationId !== session.organizationId) {
    return { success: false, error: "Tài khoản không tồn tại hoặc không thuộc Organization này" };
  }
  
  if ((!session.user.role || !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role)) && account.ownerId !== session.user.id) {
    return { success: false, error: "Không có quyền ngắt kết nối tài khoản này" };
  }

  try {
    const service = ZaloSessionManager.getInstance();
    const result = await service.disconnect(accountId);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
