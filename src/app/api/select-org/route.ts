import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/lib/db";

function getTargetUrl(role: string | null | undefined) {
  if (role === "CUSTOMER") return "/customer";
  if (role === "INSTRUCTOR") return "/instructor";
  if (role === "STUDENT") return "/student";
  if (role === "AGENT") return "/agent";
  return "/workspace";
}

function getPublicUrl(request: NextRequest, pathname: string) {
  const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return new URL(pathname, `${protocol}://${host}`);
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(getPublicUrl(request, "/login"));
  }

  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.redirect(getPublicUrl(request, "/select-org"));
  }

  const membership = await getTenantDb().organizationMember.findFirst({
    where: {
      organizationId,
      userId: session.user.id,
    },
    select: { id: true },
  });

  if (!membership) {
    return NextResponse.redirect(
      getPublicUrl(request, "/select-org?error=invalid_organization"),
    );
  }

  const response = NextResponse.redirect(
    getPublicUrl(request, getTargetUrl(session.user.role)),
  );
  response.cookies.set("better-auth.active_organization", organizationId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
