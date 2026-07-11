import { Prisma, TaskStatus } from "@prisma/client";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { sendPortalPasswordChangedEmail, sendFinanceDocumentEmail } from "@/lib/email/flows";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { getTenantDb } from "@/lib/db";

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: fullName || "Khách hàng", lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) || "" };
}

function jsonObject(value: unknown): Prisma.JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Prisma.JsonObject : {};
}

export class CustomerPortalService {
  // Account Management
  static async uploadAvatar(file: FormDataEntryValue | null) {
    if (!(file instanceof File) || file.size === 0) return null;
    if (!file.type.startsWith("image/")) throw new Error("File ảnh đại diện không hợp lệ");
    if (file.size > 2 * 1024 * 1024) throw new Error("Ảnh đại diện tối đa 2MB");

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "portal-avatars");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    return `/uploads/portal-avatars/${filename}`;
  }

  static async updateAccount(organizationId: string, userId: string, userEmail: string, data: any) {
    const db = getTenantDb(organizationId);
    const {
      fullName, email, phone, companyName, address, city, currentPassword, newPassword, confirmPassword, finalAvatar, emailPreferences
    } = data;

    if (!fullName) throw new Error("Vui lòng nhập họ tên");
    if (!email) throw new Error("Vui lòng nhập email");

    let newPasswordHash: string | null = null;
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Vui lòng nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.");
      }
      if (newPassword.length < 8) throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      if (newPassword !== confirmPassword) throw new Error("Xác nhận mật khẩu mới không khớp.");

      const credentialAccount = await db.account.findUnique({
        where: { providerId_accountId: { providerId: "credential", accountId: userId } },
        select: { password: true },
      });

      if (!credentialAccount?.password) throw new Error("Tài khoản chưa có mật khẩu đăng nhập để thay đổi.");

      const passwordMatches = await verifyPassword({ hash: credentialAccount.password, password: currentPassword });
      if (!passwordMatches) throw new Error("Mật khẩu hiện tại không đúng.");

      newPasswordHash = await hashPassword(newPassword);
    }

    const duplicateUser = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, NOT: { id: userId } },
      select: { id: true },
    });
    if (duplicateUser) throw new Error("Email này đã có user. Vui lòng dùng email khác.");

    const contact = await db.contact.findFirst({
      where: {
        organizationId,
        OR: [{ email: userEmail }, { email }],
      },
      include: { company: true },
    });
    if (!contact) throw new Error("Không tìm thấy hồ sơ khách hàng để cập nhật");

    const { firstName, lastName } = splitName(fullName);
    const currentCustomFields = jsonObject(contact.customFields);

    await db.user.update({
      where: { id: userId },
      data: { name: fullName, email, phone: phone || null, image: finalAvatar },
    });

    let companyId = contact.companyId;
    if (companyName) {
      if (contact.companyId) {
        await db.company.update({
          where: { id: contact.companyId },
          data: { name: companyName, email, phone: phone || null, address: address || null, city: city || null },
        });
      } else {
        const company = await db.company.create({
          data: { organizationId, name: companyName, email, phone: phone || null, address: address || null, city: city || null, country: "Vietnam" },
        });
        companyId = company.id;
      }
    }

    await db.contact.update({
      where: { id: contact.id },
      data: {
        firstName, lastName, email, phone: phone || null, mobile: phone || null,
        address: address || null, city: city || null, avatar: finalAvatar, companyId,
        customFields: { ...currentCustomFields, portalEmailPreferences: emailPreferences },
      },
    });

    if (newPasswordHash) {
      await db.account.update({
        where: { providerId_accountId: { providerId: "credential", accountId: userId } },
        data: { password: newPasswordHash },
      });
      await sendPortalPasswordChangedEmail({ organizationId, userId, recipientEmail: email, recipientName: fullName });
    }
  }

  // General Actions
  static async resendFinanceEmail(organizationId: string, userEmail: string, type: "quotation" | "contract" | "invoice", docId: string) {
    const db = getTenantDb(organizationId);
    if (!userEmail) throw new Error("Tài khoản chưa có email.");

    const contacts = await db.contact.findMany({
      where: { organizationId, email: userEmail, status: "ACTIVE" },
      select: { id: true },
    });
    const contactIds = contacts.map(c => c.id);
    if (!contactIds.length) throw new Error("Tài khoản chưa liên kết khách hàng.");

    let doc;
    if (type === "quotation") doc = await db.quotation.findFirst({ where: { id: docId, organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } });
    else if (type === "contract") doc = await db.contract.findFirst({ where: { id: docId, organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } });
    else doc = await db.invoice.findFirst({ where: { id: docId, organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } });

    if (!doc) throw new Error("Không tìm thấy tài liệu trong portal của bạn.");
    if (!doc.token) throw new Error("Tài liệu chưa có link công khai.");

    const result = await sendFinanceDocumentEmail({ organizationId, type, id: docId, to: userEmail });
    if (!result.sent) throw new Error("Tài khoản đang tắt nhận email cho loại tài liệu này.");
  }

  // Search
  static async globalSearch(userId: string, query: string, organizationId?: string) {
    const db = getTenantDb(organizationId);
    if (!query || query.trim().length < 2) return { projects: [], tasks: [] };
    const search = query.trim();

    const [projects, tasks] = await Promise.all([
      db.project.findMany({
        where: {
          name: { contains: search, mode: "insensitive" },
          OR: [{ ownerId: userId }, { members: { some: { userId } } }]
        },
        select: { id: true, name: true, status: true },
        take: 5
      }),
      db.task.findMany({
        where: {
          title: { contains: search, mode: "insensitive" },
          project: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] }
        },
        select: { id: true, title: true, status: true, projectId: true },
        take: 10
      })
    ]);

    return { projects, tasks };
  }

  // Invoice
  static async getInvoiceDetails(invoiceId: string, organizationId?: string) {
    const db = getTenantDb(organizationId);
    return db.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true, project: true },
    });
  }

  // Tasks
  static async requireTaskAccess(taskId: string, userId: string, organizationId?: string) {
    const db = getTenantDb(organizationId);
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw new Error("Task not found");
    const canAccess = task.project.ownerId === userId || task.project.members.some(m => m.userId === userId);
    if (!canAccess) throw new Error("Unauthorized");
    return { task, db };
  }

  static async addTaskComment(taskId: string, userId: string, content: string, organizationId?: string) {
    const { db } = await this.requireTaskAccess(taskId, userId, organizationId);
    return db.taskComment.create({ data: { taskId, userId, content } });
  }

  static async updateTaskStatus(taskId: string, userId: string, status: TaskStatus, comment?: string, organizationId?: string) {
    const { db } = await this.requireTaskAccess(taskId, userId, organizationId);
    await db.task.update({ where: { id: taskId }, data: { status } });
    if (comment) {
      await db.taskComment.create({ data: { taskId, userId, content: comment } });
    }
  }

  static async updateTaskDueDate(taskId: string, userId: string, dueDate: Date | null, organizationId?: string) {
    const { db } = await this.requireTaskAccess(taskId, userId, organizationId);
    return db.task.update({ where: { id: taskId }, data: { dueDate } });
  }

  static async uploadTaskAttachment(taskId: string, userId: string, file: FormDataEntryValue | null, organizationId?: string) {
    if (!file || !(file instanceof File)) throw new Error("No file provided");
    const { task, db } = await this.requireTaskAccess(taskId, userId, organizationId);

    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${taskId}-${timestamp}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "tasks");
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    
    const fileUrl = `/uploads/tasks/${filename}`;

    await db.file.create({
      data: {
        name: file.name, filename, url: fileUrl, size: file.size, mimeType: file.type,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        uploaderId: userId, taskId, projectId: task.projectId, organizationId: task.project.organizationId,
      }
    });

    return fileUrl;
  }
}
