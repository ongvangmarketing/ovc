import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSocialMarketingAccess } from "@/modules/social-marketing/policy";
import { createOAuthState } from "@/modules/social-marketing/security/oauth-state";

export async function GET(request: Request) {
  try {
    const { organizationId, session } = await requireSocialMarketingAccess({ write: true, provider: "FACEBOOK" });
    const appId = process.env.FACEBOOK_APP_ID;
    const version = process.env.FACEBOOK_GRAPH_API_VERSION || "v25.0";
    if (!appId || !process.env.FACEBOOK_APP_SECRET) {
      return NextResponse.redirect(new URL("/workspace/social-marketing/settings?error=facebook-config", request.url));
    }
    const redirectUri = new URL("/api/social-marketing/oauth/facebook/callback", request.url).toString();
    const state = createOAuthState(organizationId, session.user.id);
    const cookieStore = await cookies();
    cookieStore.set("ov_social_oauth_state", state.value, {
      httpOnly: true, sameSite: "lax", secure: new URL(request.url).protocol === "https:",
      path: "/api/social-marketing/oauth/facebook/callback", maxAge: 600,
    });
    const url = new URL(`https://www.facebook.com/${version}/dialog/oauth`);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state.value);
    url.searchParams.set("scope", process.env.FACEBOOK_OAUTH_SCOPES || "public_profile");
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/workspace/social-marketing/settings?error=forbidden", request.url));
  }
}
