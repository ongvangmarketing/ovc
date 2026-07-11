"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { CustomerPortalService } from "@/modules/crm/services/customer-portal.service";

const emailPreferenceKeys = [
  "account",
  "quotation",
  "contract",
  "invoice",
  "payment",
  "marketing",
] as const;

type EmailPreferenceKey = (typeof emailPreferenceKeys)[number];

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function updatePortalAccount(formData: FormData) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Không có quyền cập nhật Portal");

  const fullName = normalizeText(formData.get("fullName"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const phone = normalizeText(formData.get("phone"));
  const companyName = normalizeText(formData.get("companyName"));
  const address = normalizeText(formData.get("address"));
  const city = normalizeText(formData.get("city"));
  const imageUrl = normalizeText(formData.get("imageUrl"));
  const currentPassword = normalizeText(formData.get("currentPassword"));
  const newPassword = normalizeText(formData.get("newPassword"));
  const confirmPassword = normalizeText(formData.get("confirmPassword"));
  const uploadedAvatar = await CustomerPortalService.uploadAvatar(formData.get("avatar"));
  const finalAvatar = uploadedAvatar || imageUrl || null;

  const emailPreferences = emailPreferenceKeys.reduce<Record<EmailPreferenceKey, boolean>>((acc, key) => {
    acc[key] = formData.get(`email_${key}`) === "on";
    return acc;
  }, {} as Record<EmailPreferenceKey, boolean>);

  await CustomerPortalService.updateAccount(session.organizationId, session.user.id, session.user.email, {
    fullName,
    email,
    phone,
    companyName,
    address,
    city,
    currentPassword,
    newPassword,
    confirmPassword,
    finalAvatar,
    emailPreferences
  });

  revalidatePath("/customer");
  revalidatePath("/customer/account");
  redirect("/customer/account?saved=1");
}
