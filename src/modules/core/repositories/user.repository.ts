import { getTenantDb, getSystemDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class UserRepository {
  static async getById(userId: string) {
    return getSystemDb().user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        timezone: true,
        locale: true,
      },
    });
  }

  static async updateProfile(userId: string, data: { name?: string; phone?: string; timezone?: string; locale?: string; image?: string | null }) {
    return getSystemDb().user.update({
      where: { id: userId },
      data,
    });
  }

  static async updatePassword(userId: string, newPasswordHash: string) {
    // Assuming there is an Account record associated with credentials provider
    // Better Auth might store it in Account
    const account = await getSystemDb().account.findFirst({
      where: { userId, providerId: "credential" }, // typical provider id for email/password
    });

    if (account) {
      return getSystemDb().account.update({
        where: { id: account.id },
        data: { password: newPasswordHash },
      });
    }

    // If no credential account exists, we create one
    return getSystemDb().account.create({
      data: {
        userId,
        providerId: "credential",
        accountId: userId,
        password: newPasswordHash,
      },
    });
  }

  static async getPasswordHash(userId: string) {
    const account = await getSystemDb().account.findFirst({
      where: { userId, providerId: "credential" },
      select: { password: true },
    });
    return account?.password || null;
  }
}
