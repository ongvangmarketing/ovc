import { db } from "@/lib/db";
import { CreateMailAccountDto, UpdateMailAccountDto } from "../types/core-mail.types";
import { MailAccountStatus } from "@prisma/client";

export class MailAccountRepository {
  /**
   * Tạo tài khoản email mới
   */
  static async create(data: CreateMailAccountDto) {
    return db.mailAccount.create({
      data: {
        ...data,
        status: MailAccountStatus.ACTIVE,
      },
    });
  }

  /**
   * Cập nhật thông tin tài khoản email
   */
  static async update(id: string, organizationId: string, data: UpdateMailAccountDto) {
    return db.mailAccount.update({
      where: {
        id,
        organizationId,
      },
      data,
    });
  }

  /**
   * Lấy danh sách tài khoản email của một Organization
   */
  static async findByOrganization(organizationId: string) {
    return db.mailAccount.findMany({
      where: { organizationId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lấy chi tiết một tài khoản email
   */
  static async findById(id: string, organizationId: string) {
    return db.mailAccount.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        members: true,
      },
    });
  }

  /**
   * Xóa tài khoản email
   */
  static async delete(id: string, organizationId: string) {
    return db.mailAccount.delete({
      where: {
        id,
        organizationId,
      },
    });
  }

  /**
   * Lấy tài khoản theo email (để check unique)
   */
  static async findByEmail(organizationId: string, emailAddress: string) {
    return db.mailAccount.findUnique({
      where: {
        organizationId_emailAddress: {
          organizationId,
          emailAddress,
        },
      },
    });
  }
}
