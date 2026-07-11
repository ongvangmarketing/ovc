import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";

export class UserService {
  static async getUserProfile(userId: string) {
    return UserRepository.getById(userId);
  }

  static async updateProfile(userId: string, data: { name?: string; phone?: string; timezone?: string; locale?: string; image?: string | null }) {
    if (!data.name?.trim()) {
      throw new Error("Tên không được để trống");
    }
    return UserRepository.updateProfile(userId, data);
  }

  static async updatePassword(userId: string, currentPassword?: string, newPassword?: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    const currentHash = await UserRepository.getPasswordHash(userId);
    
    // If the user already has a password, verify the current one
    if (currentHash) {
      if (!currentPassword) {
        throw new Error("Vui lòng nhập mật khẩu hiện tại");
      }
      const isMatch = await bcrypt.compare(currentPassword, currentHash);
      if (!isMatch) {
        throw new Error("Mật khẩu hiện tại không đúng");
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    return UserRepository.updatePassword(userId, newHash);
  }
}
