"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { sendPortalPasswordChangedEmail } from "@/lib/email/flows";

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

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: fullName || "Khách hàng", lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) || "" };
}

function jsonObject(value: unknown): Prisma.JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Prisma.JsonObject : {};
}

async function uploadAvatar(file: FormDataEntryValue | null) {
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
  const uploadedAvatar = await uploadAvatar(formData.get("avatar"));
  const finalAvatar = uploadedAvatar || imageUrl || null;

  if (!fullName) throw new Error("Vui lòng nhập họ tên");
  if (!email) throw new Error("Vui lòng nhập email");

  const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmPassword);
  let newPasswordHash: string | null = null;

  if (wantsPasswordChange) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("Vui lòng nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.");
    }
    if (newPassword.length < 8) {
      throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Xác nhận mật khẩu mới không khớp.");
    }

    const credentialAccount = await db.account.findUnique({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: session.user.id,
        },
      },
      select: { password: true },
    });

    if (!credentialAccount?.password) {
      throw new Error("Tài khoản chưa có mật khẩu đăng nhập để thay đổi.");
    }

    const passwordMatches = await verifyPassword({
      hash: credentialAccount.password,
      password: currentPassword,
    });
    if (!passwordMatches) {
      throw new Error("Mật khẩu hiện tại không đúng.");
    }

    newPasswordHash = await hashPassword(newPassword);
  }

  const duplicateUser = await db.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });

  if (duplicateUser) {
    throw new Error("Email này đã có user. Vui lòng dùng email khác.");
  }

  const contact = await db.contact.findFirst({
    where: {
      organizationId: session.organizationId,
      OR: [
        { email: session.user.email },
        { email },
      ],
    },
    include: { company: true },
  });

  if (!contact) throw new Error("Không tìm thấy hồ sơ khách hàng để cập nhật");

  const { firstName, lastName } = splitName(fullName);
  const currentCustomFields = jsonObject(contact.customFields);
  const emailPreferences = emailPreferenceKeys.reduce<Record<EmailPreferenceKey, boolean>>((acc, key) => {
    acc[key] = formData.get(`email_${key}`) === "on";
    return acc;
  }, {} as Record<EmailPreferenceKey, boolean>);

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: fullName,
      email,
      phone: phone || null,
      image: finalAvatar,
    },
  });

  let companyId = contact.companyId;
  if (companyName) {
    const company = contact.companyId
      ? await db.company.update({
          where: { id: contact.companyId },
          data: {
            name: companyName,
            email,
            phone: phone || null,
            address: address || null,
            city: city || null,
          },
        })
      : await db.company.create({
          data: {
            organizationId: session.organizationId,
            name: companyName,
            email,
            phone: phone || null,
            address: address || null,
            city: city || null,
            country: "Vietnam",
          },
        });
    companyId = company.id;
  }

  await db.contact.update({
    where: { id: contact.id },
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      mobile: phone || null,
      address: address || null,
      city: city || null,
      avatar: finalAvatar,
      companyId,
      customFields: {
        ...currentCustomFields,
        portalEmailPreferences: emailPreferences,
      },
    },
  });

  if (newPasswordHash) {
    await db.account.update({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: session.user.id,
        },
      },
      data: { password: newPasswordHash },
    });

    await sendPortalPasswordChangedEmail({
      organizationId: session.organizationId,
      userId: session.user.id,
      recipientEmail: email,
      recipientName: fullName,
    });
  }

  revalidatePath("/portal");
  revalidatePath("/portal/account");
  redirect("/portal/account?saved=1");
}
