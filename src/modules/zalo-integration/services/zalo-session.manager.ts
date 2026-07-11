import { Zalo } from "zca-js";
import { getSystemDb, getTenantDb } from "@/lib/db";

interface ZaloInstanceData {
  zalo: any;
  api: any;
  listener: any;
  profile?: any;
  credentials?: any; 
}

declare global {
  var _zaloInstances: Map<string, ZaloInstanceData>; 
  var _zaloPendingLogins: Map<string, { status: string, qrCode?: string, organizationId: string, credentials?: any, userId?: string, isMaster?: boolean }>;
}

export class ZaloSessionManager {
  private static instance: ZaloSessionManager;

  private constructor() {
    if (!global._zaloInstances) {
      global._zaloInstances = new Map();
    }
    if (!global._zaloPendingLogins) {
      global._zaloPendingLogins = new Map();
    }
  }

  public static getInstance(): ZaloSessionManager {
    if (!ZaloSessionManager.instance) {
      ZaloSessionManager.instance = new ZaloSessionManager();
    }
    return ZaloSessionManager.instance;
  }

  // Lấy trạng thái của tempId (đang quét QR) hoặc accountId
  public async getStatus(accountId?: string, tempId?: string) {
    if (tempId) {
       const pending = global._zaloPendingLogins.get(tempId);
       return pending ? { status: pending.status, qrCode: pending.qrCode } : { status: "INIT" };
    }
    if (accountId) {
       const instance = global._zaloInstances.get(accountId);
       return instance ? { status: "LOGGED_IN", profile: instance.profile } : { status: "DISCONNECTED" };
    }
    return { status: "INIT" };
  }

  // Gỡ kết nối 1 tài khoản
  public async disconnect(accountId: string) {
    const instance = global._zaloInstances.get(accountId);
    if (instance?.listener) {
      instance.listener.stop();
    }
    global._zaloInstances.delete(accountId);
    
    // Cập nhật DB
    const db = getSystemDb();
    await db.zaloAccount.update({
      where: { id: accountId },
      data: { status: "DISCONNECTED" }
    });
    
    return { success: true };
  }

  // Lấy danh sách bạn bè từ tài khoản Zalo đầu tiên được kết nối của Organization, hoặc theo ID cụ thể
  public async getFriends(organizationId: string, zaloAccountId?: string) {
    const db = getSystemDb();
    
    const whereClause: any = { organizationId, status: "CONNECTED" };
    if (zaloAccountId) whereClause.id = zaloAccountId;
    
    const account = await db.zaloAccount.findFirst({
      where: whereClause
    });
    
    if (!account) return [];
    
    let instance = global._zaloInstances.get(account.id);
    if (!instance || !instance.api) {
      // Auto restore if not in memory
      if (account.cookie && account.imei && account.userAgent) {
        let parsedCookie, parsedImei, parsedUserAgent, parsedSecretKey;
        try { parsedCookie = JSON.parse(account.cookie); } catch (e) { parsedCookie = account.cookie; }
        try { parsedImei = JSON.parse(account.imei); } catch (e) { parsedImei = account.imei; }
        try { parsedUserAgent = JSON.parse(account.userAgent); } catch (e) { parsedUserAgent = account.userAgent; }
        try { parsedSecretKey = account.secretKey ? JSON.parse(account.secretKey) : undefined; } catch (e) { parsedSecretKey = account.secretKey || undefined; }
        
        await this.connectWithCredentials(account.id, account.organizationId, {
          cookie: parsedCookie,
          imei: parsedImei,
          userAgent: parsedUserAgent,
          secretKey: parsedSecretKey
        });
        instance = global._zaloInstances.get(account.id);
      }
    }
    if (!instance || !instance.api) return [];
    
    // Sử dụng cache nếu đã lấy danh sách bạn bè trong vòng 5 phút (300000ms)
    if (instance.friendsCache && instance.friendsCacheTime && (Date.now() - instance.friendsCacheTime < 300000)) {
        return instance.friendsCache;
    }
    
    try {
      const result = await instance.api.getAllFriends();
      // zca-js getAllFriends usually returns { data: [...] } or an array
      let friends = [];
      if (result && result.data) friends = result.data;
      else if (Array.isArray(result)) friends = result;
      
      const mappedFriends = friends.map((f: any) => ({
        id: f.userId || f.id || f.uid,
        name: f.displayName || f.name,
        avatar: f.avatar || f.avatarUrl
      }));
      
      // Lưu vào cache
      instance.friendsCache = mappedFriends;
      instance.friendsCacheTime = Date.now();
      
      return mappedFriends;
    } catch (e) {
      console.error("Lỗi khi lấy danh sách bạn bè Zalo:", e);
      // Trả về cache cũ nếu có lỗi
      return instance.friendsCache || [];
    }
  }

  // Tìm người dùng qua số điện thoại
  public async findUserByPhone(organizationId: string, phone: string, zaloAccountId?: string) {
    const db = getSystemDb();
    
    const whereClause: any = { organizationId, status: "CONNECTED" };
    if (zaloAccountId) whereClause.id = zaloAccountId;

    const account = await db.zaloAccount.findFirst({
      where: whereClause
    });
    
    if (!account) return null;
    
    let instance = global._zaloInstances.get(account.id);
    if (!instance || !instance.api) {
      // Auto restore if not in memory
      if (account.cookie && account.imei && account.userAgent) {
        let parsedCookie, parsedImei, parsedUserAgent, parsedSecretKey;
        try { parsedCookie = JSON.parse(account.cookie); } catch (e) { parsedCookie = account.cookie; }
        try { parsedImei = JSON.parse(account.imei); } catch (e) { parsedImei = account.imei; }
        try { parsedUserAgent = JSON.parse(account.userAgent); } catch (e) { parsedUserAgent = account.userAgent; }
        try { parsedSecretKey = account.secretKey ? JSON.parse(account.secretKey) : undefined; } catch (e) { parsedSecretKey = account.secretKey || undefined; }
        
        await this.connectWithCredentials(account.id, account.organizationId, {
          cookie: parsedCookie,
          imei: parsedImei,
          userAgent: parsedUserAgent,
          secretKey: parsedSecretKey
        });
        instance = global._zaloInstances.get(account.id);
      }
    }
    if (!instance || !instance.api) return null;
    
    try {
      // zca-js api.findUser expects phone string
      const result = await instance.api.findUser(phone);
      if (!result || result.error_code !== 0 || !result.data) return null;
      
      const f = result.data;
      return {
        id: f.uid || f.userId || f.id,
        name: f.display_name || f.name || f.displayName,
        avatar: f.avatar || f.avatarUrl
      };
    } catch (e) {
      console.error("Lỗi tìm Zalo qua SĐT:", e);
      return null;
    }
  }

  // Khôi phục tất cả tài khoản
  public async restoreAllSessions() {
    const db = getSystemDb();
    const accounts = await db.zaloAccount.findMany({
      where: { status: "CONNECTED" }
    });

    for (const acc of accounts) {
      if (acc.cookie && acc.imei && acc.userAgent) {
        let parsedCookie, parsedImei, parsedUserAgent, parsedSecretKey;
        try { parsedCookie = JSON.parse(acc.cookie); } catch (e) { parsedCookie = acc.cookie; }
        try { parsedImei = JSON.parse(acc.imei); } catch (e) { parsedImei = acc.imei; }
        try { parsedUserAgent = JSON.parse(acc.userAgent); } catch (e) { parsedUserAgent = acc.userAgent; }
        try { parsedSecretKey = acc.secretKey ? JSON.parse(acc.secretKey) : undefined; } catch (e) { parsedSecretKey = acc.secretKey || undefined; }

        await this.connectWithCredentials(acc.id, acc.organizationId, {
          cookie: parsedCookie,
          imei: parsedImei,
          userAgent: parsedUserAgent,
          secretKey: parsedSecretKey
        });
      }
    }
  }

  // Kết nối ngầm khi có credentials (để restore)
  private async connectWithCredentials(accountId: string, organizationId: string, credentials: any) {
    try {
      const zalo = new (Zalo as any)({ checkUpdate: false });
      const api = await zalo.login(credentials);
      if (!api) return false;

      let profile = undefined;
      try {
          const acc = await api.fetchAccountInfo();
          profile = acc.profile;
      } catch(e) {}
      
      const listener = api.listener || (zalo as any).listener;
      global._zaloInstances.set(accountId, { zalo, api, listener, profile, credentials });
      this.setupListeners(accountId, organizationId);
      return true;
    } catch (e) {
      console.error(`Lỗi khôi phục tài khoản Zalo ${accountId}:`, e);
      return false;
    }
  }

  // Quét QR
  public async initLogin(tempId: string, organizationId: string, userId: string, isMaster: boolean = false) {
    if (global._zaloPendingLogins.has(tempId)) {
      const p = global._zaloPendingLogins.get(tempId);
      return { status: p?.status, qrCode: p?.qrCode };
    }

    try {
      global._zaloPendingLogins.set(tempId, { status: "INIT", organizationId, userId, isMaster });
      
      const zalo = new (Zalo as any)({ logging: false, selfListen: true }, { checkUpdate: false });
      
      zalo.loginQR({}, async (event: any) => {
        const pending = global._zaloPendingLogins.get(tempId);
        if (!pending) return;

        switch (event.type) {
          case 0: // QRCodeGenerated
            const qrStr = event.data?.image || "";
            pending.qrCode = qrStr.startsWith("data:") ? qrStr : "data:image/png;base64," + qrStr;
            pending.status = "WAITING_FOR_SCAN";
            break;
          case 1: // QRCodeExpired
            event.actions?.retry();
            break;
          case 2: // QRCodeScanned
            pending.status = "SCANNED";
            break;
          case 4: // GotLoginInfo
            pending.credentials = {
              cookie: event.data?.cookie,
              imei: event.data?.imei,
              userAgent: event.data?.userAgent,
              secretKey: event.data?.secretKey
            };
            break;
        }
      }).then(async (api: any) => {
        if (!api) {
          const pending = global._zaloPendingLogins.get(tempId);
          if (pending) pending.status = "ERROR";
          return;
        }
        
        let profile = undefined;
        try {
            const acc = await api.fetchAccountInfo();
            profile = acc.profile;
        } catch(e) {}
        
        const pending = global._zaloPendingLogins.get(tempId);
        if (pending && profile && pending.credentials) {
            // Save to DB
            const db = getSystemDb();
            const zaloId = profile.userId || profile.uid || Date.now().toString(); // Fallback uid
            
            // Xử lý lưu Zalo Account
            let zaloAccount = await db.zaloAccount.findUnique({
              where: { organizationId_zaloId: { organizationId, zaloId } }
            });
            
            if (!zaloAccount) {
              zaloAccount = await db.zaloAccount.create({
                data: {
                  organizationId,
                  zaloId,
                  name: profile.displayName || "Zalo User",
                  avatar: profile.avatar || "",
                  phone: profile.phoneNumber || "",
                  cookie: typeof pending.credentials.cookie === "string" ? pending.credentials.cookie : JSON.stringify(pending.credentials.cookie),
                  imei: typeof pending.credentials.imei === "string" ? pending.credentials.imei : JSON.stringify(pending.credentials.imei),
                  userAgent: typeof pending.credentials.userAgent === "string" ? pending.credentials.userAgent : JSON.stringify(pending.credentials.userAgent),
                  secretKey: typeof pending.credentials.secretKey === "string" ? pending.credentials.secretKey : JSON.stringify(pending.credentials.secretKey),
                  status: "CONNECTED",
                  isMaster: pending.isMaster,
                  ownerId: pending.userId
                }
              });
            } else {
              zaloAccount = await db.zaloAccount.update({
                where: { id: zaloAccount.id },
                data: {
                  cookie: typeof pending.credentials.cookie === "string" ? pending.credentials.cookie : JSON.stringify(pending.credentials.cookie),
                  imei: typeof pending.credentials.imei === "string" ? pending.credentials.imei : JSON.stringify(pending.credentials.imei),
                  userAgent: typeof pending.credentials.userAgent === "string" ? pending.credentials.userAgent : JSON.stringify(pending.credentials.userAgent),
                  secretKey: typeof pending.credentials.secretKey === "string" ? pending.credentials.secretKey : JSON.stringify(pending.credentials.secretKey),
                  status: "CONNECTED"
                }
              });
            }
            
            const listener = api.listener || (zalo as any).listener;
            global._zaloInstances.set(zaloAccount.id, { zalo, api, listener, profile, credentials: pending.credentials });
            this.setupListeners(zaloAccount.id, organizationId);
            
            pending.status = "LOGGED_IN";
        }
      }).catch((err: any) => {
        console.error("Lỗi Zalo đăng nhập:", err);
        const pending = global._zaloPendingLogins.get(tempId);
        if (pending) pending.status = "ERROR";
      });

      return { status: "WAITING_FOR_SCAN" };
    } catch (error) {
      console.error("Zalo Init Error:", error);
      throw error;
    }
  }

  // Helper chuyển đổi URL -> Buffer -> Storage
  private async downloadAndSaveAttachment(fileUrl: string, msgType: string, orgId: string, convId: string, senderId: string) {
    if (!fileUrl || !fileUrl.startsWith("http")) return null;
    try {
      const { StorageGateway } = await import("@/modules/core-storage/services/StorageGateway");
      const response = await fetch(fileUrl);
      if (!response.ok) return null;
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let fileName = `zalo_file_${Date.now()}`;
      try {
        const urlObj = new URL(fileUrl);
        const parts = urlObj.pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          fileName = decodeURIComponent(lastPart);
        } else {
          if (msgType === "IMAGE") fileName += ".jpg";
          else fileName += ".bin";
        }
      } catch (e) {
        if (msgType === "IMAGE") fileName += ".jpg";
        else fileName += ".bin";
      }

      const storageFile = await StorageGateway.upload(
        buffer,
        fileName,
        "application/octet-stream",
        "CHAT_ATTACHMENT",
        "BUSINESS_CHAT",
        orgId,
        convId,
        senderId
      );
      return `/api/storage/download?fileId=${storageFile.id}`;
    } catch (e) {
      console.error("Lỗi lưu attachment:", e);
      return null;
    }
  }

  private setupListeners(accountId: string, organizationId: string) {
    const instance = global._zaloInstances.get(accountId);
    if (!instance || !instance.listener) return;
    const listener = instance.listener;

    listener.removeAllListeners("message");

    listener.on("message", async (msg: any) => {
      try {
        const db = getSystemDb();
        const threadId = msg.threadId;
        const msgData = msg.data || {};
        
        let content = "Tin nhắn không xác định";
        let messageType = "TEXT";
        let fileUrlToDownload = null;

        if (typeof msgData.content === "string") {
          content = msgData.content;
        } else if (msgData.content) {
          if (msgData.msgType === "chat.photo") {
            messageType = "FILE";
            fileUrlToDownload = msgData.content.href;
          } else if (msgData.msgType === "chat.file") {
            messageType = "FILE";
            fileUrlToDownload = msgData.content.href;
          } else {
            content = JSON.stringify(msgData.content);
          }
        }
        
        const senderId = msgData.uidFrom || threadId;
        if (!content || !threadId) return;

        const api = instance.api;
        let dName = msgData.dName || `Zalo User ${senderId}`;
        let avatarUrl = undefined;
        let phone = undefined;

        if (api && !msg.isSelf) {
          try {
            const userInfoRes = await api.getUserInfo(senderId);
            const profile = userInfoRes?.changed_profiles?.[senderId] || userInfoRes?.data?.[senderId];
            if (profile) {
              if (profile.displayName) dName = profile.displayName;
              if (profile.avatar) avatarUrl = profile.avatar;
              if (profile.phoneNumber) phone = profile.phoneNumber;
            }
          } catch (e) {
            console.error("Lỗi lấy thông tin Zalo:", e);
          }
        }

        // Tìm conversation
        let conversation = await db.chatConversation.findFirst({
          where: { name: `Zalo-${threadId}`, organizationId, zaloAccountId: accountId }
        });

        if (!conversation) {
          conversation = await db.chatConversation.create({
            data: {
              organizationId,
              zaloAccountId: accountId, // Gắn với tài khoản Zalo nhận tin
              name: `Zalo-${threadId}`,
              type: "GROUP" as any, 
              avatarUrl: avatarUrl,
            }
          });

          // Thêm các thành viên được quyền xem Zalo Account này vào Participant
          const acc = await db.zaloAccount.findUnique({
              where: { id: accountId },
              include: { permissions: true }
          });
          
          let userIdsToJoin: string[] = [];
          if (acc?.isMaster) {
              // Master: thêm owner và những người có permission
              if (acc.ownerId) userIdsToJoin.push(acc.ownerId);
              for (const perm of acc.permissions) {
                  if (perm.userId) userIdsToJoin.push(perm.userId);
                  // TODO: Xử lý departmentId nếu cấp quyền theo phòng ban
              }
          } else if (acc?.ownerId) {
              // Zalo cá nhân: chỉ owner được chat
              userIdsToJoin.push(acc.ownerId);
          }
          
          if (userIdsToJoin.length === 0) {
              // Fallback: toàn bộ org member
              const members = await db.organizationMember.findMany({ where: { organizationId } });
              userIdsToJoin = members.map(m => m.userId);
          }

          if (userIdsToJoin.length > 0) {
            await db.chatParticipant.createMany({
              data: userIdsToJoin.map((uId: string) => ({
                organizationId,
                conversationId: conversation!.id,
                userId: uId,
                role: "MEMBER"
              })),
              skipDuplicates: true
            });
          }
        }

        let zaloUser = await db.user.findFirst({
          where: { email: `zalo_${senderId}@zalo.me` }
        });

        if (!zaloUser) {
          zaloUser = await db.user.create({
            data: {
              email: `zalo_${senderId}@zalo.me`,
              name: dName,
              image: avatarUrl,
              phone: phone,
            }
          });
        } else {
          if ((dName && zaloUser.name !== dName) || (avatarUrl && zaloUser.image !== avatarUrl)) {
            zaloUser = await db.user.update({
              where: { id: zaloUser.id },
              data: {
                name: dName,
                image: avatarUrl || zaloUser.image,
                phone: phone || zaloUser.phone,
              }
            });
          }
        }

        // Xử lý download attachment
        if (fileUrlToDownload) {
           const storageUrl = await this.downloadAndSaveAttachment(fileUrlToDownload, messageType, organizationId, conversation.id, zaloUser.id);
           if (storageUrl) content = storageUrl;
           else content = `[File/Ảnh Zalo: ${fileUrlToDownload}]`;
        }

        const chatMessage = await db.chatMessage.create({
          data: {
            organizationId,
            conversationId: conversation.id,
            senderId: zaloUser.id,
            content: content,
            type: messageType as any,
            metadata: msgData.msgType === "chat.photo" ? { fileType: "image/jpeg" } : undefined
          }
        });

        // Tự gán sender để gửi qua Pusher
        const messageWithSender = {
          ...chatMessage,
          sender: zaloUser
        };

        try {
          const { pusherServer } = await import("@/lib/pusher");
          const channelName = `org-${organizationId}-chat-${conversation.id}`;
          await pusherServer.trigger(channelName, "new-message", messageWithSender);
          
          const globalChannel = `org-${organizationId}-global`;
          
          // Tên hiển thị: ưu tiên dName đã resolve từ Zalo API ở trên
          const displayName = dName || zaloUser.name || "Khách hàng Zalo";
          
          // Tạo nội dung preview thân thiện
          let contentPreview = content;
          if (messageType === "IMAGE") contentPreview = "📷 Đã gửi một hình ảnh";
          else if (messageType === "FILE") contentPreview = "📎 Đã gửi một file";
          else if (content.startsWith("http") && content.length > 100) contentPreview = "📎 Đã gửi file đính kèm";
          
          await pusherServer.trigger(globalChannel, "chat-update", { 
            conversationId: conversation.id,
            senderName: displayName,
            content: contentPreview
          });
        } catch (pusherErr) {
          console.error("Pusher trigger failed:", pusherErr);
        }
      } catch (err) {
        console.error("Lỗi khi xử lý tin nhắn Zalo:", err);
      }
    });

    listener.start();
    console.log(`📡 Bắt đầu lắng nghe tin nhắn Zalo cho account ${accountId}`);
  }

  // Gửi tin nhắn qua Zalo (Sử dụng api của zca-js)
  public async sendMessage(accountId: string, threadId: string, content: string) {
    let instance = global._zaloInstances.get(accountId);
    if (!instance || !instance.api) {
      const db = getSystemDb();
      const acc = await db.zaloAccount.findUnique({ where: { id: accountId } });
      if (acc && acc.status === "CONNECTED" && acc.cookie) {
        let parsedCookie, parsedImei, parsedUserAgent, parsedSecretKey;
        try { parsedCookie = JSON.parse(acc.cookie); } catch (e) { parsedCookie = acc.cookie; }
        try { parsedImei = JSON.parse(acc.imei); } catch (e) { parsedImei = acc.imei; }
        try { parsedUserAgent = JSON.parse(acc.userAgent); } catch (e) { parsedUserAgent = acc.userAgent; }
        try { parsedSecretKey = acc.secretKey ? JSON.parse(acc.secretKey) : undefined; } catch (e) { parsedSecretKey = acc.secretKey || undefined; }

        await this.connectWithCredentials(acc.id, acc.organizationId, {
          cookie: parsedCookie,
          imei: parsedImei,
          userAgent: parsedUserAgent,
          secretKey: parsedSecretKey
        });
        instance = global._zaloInstances.get(accountId);
      }
      if (!instance || !instance.api) {
        throw new Error(`Zalo Account ${accountId} chưa đăng nhập hoặc không tồn tại`);
      }
    }

    // zca-js api.sendMessage signature is: sendMessage(message, threadId, type)
    const result = await instance.api.sendMessage(
      content,
      threadId,
      0 // 0 for user, 1 for group
    );
    
    return result;
  }
  // Gửi file đính kèm qua Zalo (Sử dụng api của zca-js)
  public async sendAttachment(accountId: string, threadId: string, buffer: Buffer, filename: string) {
    let instance = global._zaloInstances.get(accountId);
    if (!instance || !instance.api) {
      const db = getSystemDb();
      const acc = await db.zaloAccount.findUnique({ where: { id: accountId } });
      if (acc && acc.status === "CONNECTED" && acc.cookie) {
        let parsedCookie, parsedImei, parsedUserAgent, parsedSecretKey;
        try { parsedCookie = JSON.parse(acc.cookie); } catch (e) { parsedCookie = acc.cookie; }
        try { parsedImei = JSON.parse(acc.imei); } catch (e) { parsedImei = acc.imei; }
        try { parsedUserAgent = JSON.parse(acc.userAgent); } catch (e) { parsedUserAgent = acc.userAgent; }
        try { parsedSecretKey = acc.secretKey ? JSON.parse(acc.secretKey) : undefined; } catch (e) { parsedSecretKey = acc.secretKey || undefined; }

        await this.connectWithCredentials(acc.id, acc.organizationId, {
          cookie: parsedCookie,
          imei: parsedImei,
          userAgent: parsedUserAgent,
          secretKey: parsedSecretKey
        });
        instance = global._zaloInstances.get(accountId);
      }
      if (!instance || !instance.api) {
        throw new Error(`Zalo Account ${accountId} chưa đăng nhập hoặc không tồn tại`);
      }
    }

    // 1. Upload attachment
    const uploaded = await instance.api.uploadAttachment(
      { data: buffer, filename: filename },
      threadId,
      0 // 0 for user, 1 for group
    );

    // 2. Send message with attachment
    const result = await instance.api.sendMessage(
      { msg: " ", attachments: uploaded },
      threadId,
      0 // 0 for user, 1 for group
    );
    
    return result;
  }
}
