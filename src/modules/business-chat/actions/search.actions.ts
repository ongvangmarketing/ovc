"use server";

import { getTenantDb } from "@/lib/db";

import { requireAuth } from "@/lib/auth/require-auth";

async function getAuthSession() {
  return await requireAuth();
}

export async function searchChatTargetsAction(query: string, zaloAccountId?: string) {
  const session = await getAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  const db = getTenantDb(session.organizationId);

  // 1. Tìm Users (Theo tên, email, hoặc ID)
  const users = await db.user.findMany({
    where: {
      organizationMembers: {
        some: {
          organizationId: session.organizationId
        }
      },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { id: { equals: query } },
      ],
    },
    take: 5,
    select: { id: true, name: true, image: true, email: true },
  });

  // 3. Tìm Dự án (Theo tên hoặc ID)
  const projects = await db.project.findMany({
    where: {
      organizationId: session.organizationId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { id: { equals: query } },
      ],
    },
    take: 5,
    select: { id: true, name: true },
  });

  // 4. Lấy bạn bè Zalo thực tế (nếu đã kết nối) hoặc tìm kiếm theo số điện thoại
  let zaloFriends: any[] = [];
  try {
    const { ZaloSessionManager } = await import("@/modules/zalo-integration/services/zalo-session.manager");
    const service = ZaloSessionManager.getInstance();

    // Nếu query có vẻ là số điện thoại (10 hoặc 11 số)
    const rawQuery = query.replace(/[^0-9+]/g, '');
    const isPhone = /^(0|\+84|84)[35789][0-9]{8}$/.test(rawQuery);
    
    if (isPhone) {
      let formattedPhone = rawQuery;
      // Zalo API thường yêu cầu format 84...
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '84' + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith('+84')) {
        formattedPhone = '84' + formattedPhone.slice(3);
      }
      
      const user = await service.findUserByPhone(session.organizationId, formattedPhone, zaloAccountId);
      if (user) {
        zaloFriends.push(user);
      } else {
        // Thử lại với số gốc (phòng trường hợp API nhận format 09...)
        const user2 = await service.findUserByPhone(session.organizationId, rawQuery, zaloAccountId);
        if (user2) zaloFriends.push(user2);
      }
    } else {
      // Nếu không, tìm trong danh sách bạn bè
      const allFriends = await service.getFriends(session.organizationId, zaloAccountId);
      if (allFriends && allFriends.length > 0) {
        zaloFriends = allFriends.filter((f: any) => 
          (f.name || "").toLowerCase().includes(query.toLowerCase())
        );
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy bạn bè Zalo:", error);
  }

  // Nếu không có bạn bè thật nào và đang gõ "zalo", vẫn có thể hiển thị mock để demo
  // (hoặc nếu muốn loại bỏ hoàn toàn mock thì xóa đoạn này)
  if (zaloFriends.length === 0 && query.toLowerCase().includes("zalo")) {
    zaloFriends = [
      { id: "mock_zalo_1", name: "Nguyễn Văn Zalo", avatar: "https://i.pravatar.cc/150?u=zalo1" },
      { id: "mock_zalo_2", name: "Trần Thị Zalo", avatar: "https://i.pravatar.cc/150?u=zalo2" },
      { id: "mock_zalo_3", name: "Lê Zalo Friend", avatar: "https://i.pravatar.cc/150?u=zalo3" }
    ].filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }

  return {
    users,
    projects,
    zaloFriends,
  };
}
