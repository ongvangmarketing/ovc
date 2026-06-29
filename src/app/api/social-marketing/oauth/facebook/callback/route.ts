import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { verifyOAuthState } from "@/modules/social-marketing/security/oauth-state";
import { saveFacebookConnection } from "@/modules/social-marketing/services/facebook-connection";

export async function GET(request: Request) {
  const returnUrl = new URL("/workspace/social-marketing/settings", request.url);
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const stateValue = url.searchParams.get("state");
    const providerError = url.searchParams.get("error_description");
    if (providerError) throw new Error(providerError);
    if (!code || !stateValue) throw new Error("Facebook không trả mã xác thực.");

    const cookieStore = await cookies();
    const cookieState = cookieStore.get("ov_social_oauth_state")?.value;
    cookieStore.delete("ov_social_oauth_state");
    if (!cookieState || cookieState !== stateValue) throw new Error("Phiên kết nối Facebook không hợp lệ.");
    const state = verifyOAuthState(stateValue);
    const { organizationId, session } = await requireSocialMarketingAccess({ write: true, provider: "FACEBOOK" });
    if (state.organizationId !== organizationId || state.userId !== session.user.id) {
      throw new Error("Kết nối Facebook không thuộc tổ chức hiện tại.");
    }
    await saveFacebookConnection({ organizationId, code, redirectUri: new URL("/api/social-marketing/oauth/facebook/callback", request.url).toString() });
    returnUrl.searchParams.set("connected", "1");
  } catch (error) {
    returnUrl.searchParams.set("error", error instanceof Error ? error.message.slice(0, 180) : "facebook-oauth");
  }
  return NextResponse.redirect(returnUrl);
}

