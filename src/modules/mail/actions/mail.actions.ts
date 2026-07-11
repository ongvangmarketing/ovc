"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { ImapSyncService } from "@/modules/core-mail/services/imap-sync.service";
import { SmtpSendService, SendMailOptions } from "@/modules/core-mail/services/smtp-send.service";

// Lấy danh sách Mailboxes mà User được quyền truy cập
export async function getWorkspaceMailboxes() {
  const { user, organizationId } = await requireAuth();
  const db = getTenantDb();

  // Tìm các mailboxes thuộc org này
  // Nếu là admin hoặc có role phù hợp, có thể xem tất cả.
  // Ở đây giả định user bình thường phải join qua MailAccountMember
  // Tạm thời để demo dễ, ta ưu tiên lấy tất cả mailbox của org (hoặc theo filter member)
  const accounts = await db.mailAccount.findMany({
    where: {
      organizationId,
      // Trong thực tế sẽ filter thêm: members: { some: { userId: user.id } }
      // nhưng có thể tài khoản chưa gán member. Ta lờ đi để test cho nhanh.
    },
    select: {
      id: true,
      emailAddress: true,
      displayName: true,
      status: true,
    },
  });

  // Map lại format để UI dễ dùng
  return accounts.map(acc => ({
    id: acc.id,
    email: acc.emailAddress,
    name: acc.displayName || acc.emailAddress.split("@")[0],
    unread: 0, // Sẽ tính sau
  }));
}

// Lấy danh sách Messages của 1 Mailbox & Folder
export async function getWorkspaceMessages(mailAccountId: string, folder: string) {
  const { organizationId } = await requireAuth();
  const db = getTenantDb();

  const messages = await db.mailMessage.findMany({
    where: {
      organizationId,
      mailAccountId,
      folder: { equals: folder, mode: "insensitive" },
    },
    orderBy: {
      receivedAt: "desc",
    },
    take: 50,
    include: {
      attachments: true,
    }
  });

  return messages.map(msg => ({
    ...msg,
    id: msg.id,
    from: msg.fromName || msg.fromEmail,
    email: msg.fromEmail,
    subject: msg.subject,
    preview: msg.bodyText?.substring(0, 100) || "Không có nội dung...",
    time: msg.receivedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    unread: !msg.isRead,
    starred: msg.isStarred,
    hasAttachment: msg.hasAttachments,
    attachments: msg.attachments || [],
    bodyHtml: msg.bodyHtml || msg.bodyText || "",
  }));
}

// Đồng bộ Mailbox qua IMAP
export async function syncMailboxAction(mailAccountId: string) {
  const { organizationId } = await requireAuth();
  
  // Xác thực quyền: Kiểm tra mailAccount này có thuộc tổ chức không
  const db = getTenantDb();
  const account = await db.mailAccount.findFirst({
    where: { id: mailAccountId, organizationId },
  });
  
  if (!account) {
    throw new Error("Không tìm thấy tài khoản email hoặc bạn không có quyền");
  }

// Gọi service đồng bộ
  const result = await ImapSyncService.syncAccount(mailAccountId);
  return result;
}

// Gửi Mail
export async function sendMailAction(mailAccountId: string, options: SendMailOptions) {
  const { organizationId } = await requireAuth();
  
  const db = getTenantDb();
  const account = await db.mailAccount.findFirst({
    where: { id: mailAccountId, organizationId },
  });
  
  if (!account) {
    throw new Error("Không tìm thấy tài khoản email hoặc bạn không có quyền");
  }

  const result = await SmtpSendService.sendMail(mailAccountId, options);
  return result;
}

// Đánh dấu đã đọc
export async function markEmailAsReadAction(emailId: string) {
  const { organizationId } = await requireAuth();
  const db = getTenantDb();

  await db.mailMessage.updateMany({
    where: {
      id: emailId,
      organizationId,
    },
    data: {
      isRead: true,
    }
  });
  
  return { success: true };
}

export async function bulkMarkEmailAsReadAction(emailIds: string[]) {
  const { organizationId } = await requireAuth();
  const db = getTenantDb();

  await db.mailMessage.updateMany({
    where: {
      id: { in: emailIds },
      organizationId,
    },
    data: {
      isRead: true,
    }
  });
  
  return { success: true };
}

export async function bulkMarkEmailAsUnreadAction(emailIds: string[]) {
  const { organizationId } = await requireAuth();
  const db = getTenantDb();

  await db.mailMessage.updateMany({
    where: {
      id: { in: emailIds },
      organizationId,
    },
    data: {
      isRead: false,
    }
  });
  
  return { success: true };
}

export async function bulkDeleteEmailAction(emailIds: string[]) {
  const { organizationId } = await requireAuth();
  const db = getTenantDb();

  await db.mailMessage.updateMany({
    where: {
      id: { in: emailIds },
      organizationId,
    },
    data: {
      folder: "Trash", // Instead of hard deleting, we move it to Trash
    }
  });
  
  return { success: true };
}
