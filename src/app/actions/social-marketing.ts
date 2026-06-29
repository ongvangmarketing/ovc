"use server";

import { revalidatePath } from "next/cache";
import { disconnectFacebook, saveFacebookTokenConnection } from "@/modules/social-marketing/services/facebook-connection";
import { syncFacebookReport } from "@/modules/social-marketing/services/facebook-sync";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";

export async function syncFacebookReportAction(connectionId: string, formData: FormData) {
  const { organizationId, session } = await requireSocialMarketingAccess({ write: true, provider: "FACEBOOK" });
  const fromValue = String(formData.get("dateFrom") || "");
  const toValue = String(formData.get("dateTo") || "");
  const dateTo = toValue ? new Date(`${toValue}T23:59:59.999Z`) : new Date();
  const dateFrom = fromValue ? new Date(`${fromValue}T00:00:00.000Z`) : new Date(Date.now() - 29 * 86400000);
  if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime()) || dateFrom > dateTo) {
    throw new Error("Khoảng ngày đồng bộ không hợp lệ.");
  }
  await syncFacebookReport({ organizationId, connectionId, initiatedById: session.user.id, dateFrom, dateTo });
  revalidatePath("/workspace/social-marketing", "layout");
}

export async function disconnectFacebookAction(connectionId: string) {
  const { organizationId } = await requireSocialMarketingAccess({ write: true, provider: "FACEBOOK" });
  await disconnectFacebook(organizationId, connectionId);
  revalidatePath("/workspace/social-marketing", "layout");
}

export async function connectFacebookTokenAction(formData: FormData) {
  const { organizationId } = await requireSocialMarketingAccess({ write: true, provider: "FACEBOOK" });
  const accessToken = String(formData.get("accessToken") || "").trim();
  if (!accessToken) {
    throw new Error("Vui lòng nhập access token.");
  }

  await saveFacebookTokenConnection({ organizationId, accessToken });
  revalidatePath("/workspace/social-marketing", "layout");
}
