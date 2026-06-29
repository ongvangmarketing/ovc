import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

type SessionWithRole = {
  user: {
    role?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect specific routes
  const protectedPaths = ["/admin", "/super-admin", "/workspace", "/portal", "/customer", "/instructor", "/student"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const { data: session } = await betterFetch<SessionWithRole>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = session.user.role || "";

    if ((pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }

    if (pathname.startsWith("/workspace")) {
      const workspaceRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"];
      if (!workspaceRoles.includes(role)) {
        return NextResponse.redirect(new URL(role === "CUSTOMER" ? "/portal" : "/login", request.url));
      }
    }

    const isCustomerPortal =
      pathname.startsWith("/portal") &&
      !pathname.startsWith("/portal/instructor") &&
      !pathname.startsWith("/portal/student");

    if (isCustomerPortal && role !== "CUSTOMER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }

    if (pathname.startsWith("/customer") && role !== "CUSTOMER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/instructor") && role !== "INSTRUCTOR" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
