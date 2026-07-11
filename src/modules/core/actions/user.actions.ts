"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { UserService } from "../services/user.service";
import { revalidatePath } from "next/cache";

export async function getUserProfileAction() {
  const session = await requireAuth();
  return UserService.getUserProfile(session.user.id);
}

export async function updateProfileAction(data: { name?: string; phone?: string; timezone?: string; locale?: string; image?: string | null }) {
  const session = await requireAuth();
  await UserService.updateProfile(session.user.id, data);
  revalidatePath("/workspace/account");
  return { success: true };
}

export async function updatePasswordAction(currentPassword?: string, newPassword?: string) {
  const session = await requireAuth();
  try {
    await UserService.updatePassword(session.user.id, currentPassword, newPassword);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
