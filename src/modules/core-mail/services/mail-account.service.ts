import { MailAccountRepository } from "../repositories/mail-account.repository";
import { CreateMailAccountDto, UpdateMailAccountDto, MailAccountMemberDto } from "../types/core-mail.types";
import { db } from "@/lib/db";
import { MailPermissionLevel } from "@prisma/client";

export class MailAccountService {
  /**
   * Tạo tài khoản mới, kiểm tra trùng lặp email
   */
  static async createAccount(data: CreateMailAccountDto) {
    const existing = await MailAccountRepository.findByEmail(data.organizationId, data.emailAddress);
    if (existing) {
      throw new Error("Email account already exists in this organization.");
    }

    // TODO: Encrypt password if requested

    return MailAccountRepository.create(data);
  }

  /**
   * Phân quyền cho một Member sử dụng Mail Account này
   */
  static async addMember(mailAccountId: string, data: MailAccountMemberDto) {
    return db.mailAccountMember.create({
      data: {
        mailAccountId,
        ...data,
      },
    });
  }

  /**
   * Cập nhật quyền của một Member
   */
  static async updateMemberPermissions(memberId: string, permissions: MailPermissionLevel[]) {
    return db.mailAccountMember.update({
      where: { id: memberId },
      data: { permissions },
    });
  }

  /**
   * Xóa một Member khỏi Mail Account
   */
  static async removeMember(memberId: string) {
    return db.mailAccountMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Kiểm tra xem User có quyền thực hiện Action trên Mail Account không
   */
  static async hasPermission(mailAccountId: string, userId: string, requiredPermission: MailPermissionLevel) {
    const member = await db.mailAccountMember.findFirst({
      where: {
        mailAccountId,
        userId,
      },
    });

    if (!member) return false;
    return member.permissions.includes(requiredPermission);
  }
}
