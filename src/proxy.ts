import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

type SessionWithRole = {
  user: {
    role?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type PublicDomainTarget = "marketing" | "training" | "homepage" | "portal";

const defaultDomainTargets: Record<string, PublicDomainTarget> = {
  "ongvang.com.vn": "marketing",
  "www.ongvang.com.vn": "marketing",
  "ongvangtraining.com": "training",
  "www.ongvangtraining.com": "training",
};

function parseDomainTargets() {
  const raw = process.env.PUBLIC_DOMAIN_TARGETS;
  if (!raw) return defaultDomainTargets;

  try {
    const parsed = JSON.parse(raw) as Record<string, PublicDomainTarget>;
    return { ...defaultDomainTargets, ...parsed };
  } catch {
    return defaultDomainTargets;
  }
}

function mapPublicModulePath(target: PublicDomainTarget, pathname: string) {
  if (pathname.startsWith("/ongvangcomvn")) return pathname;

  if (target === "training") {
    if (pathname === "/") return "/ongvangcomvn/khoa-hoc";
    if (pathname === "/khoa-hoc" || pathname.startsWith("/khoa-hoc/")) return `/ongvangcomvn${pathname}`;
    if (pathname === "/lien-he") return "/ongvangcomvn/lien-he";
    if (pathname === "/gioi-thieu") return "/ongvangcomvn/gioi-thieu";
    return `/ongvangcomvn/khoa-hoc${pathname === "/" ? "" : pathname}`;
  }

  if (target === "marketing" || target === "homepage") {
    if (pathname === "/") return "/ongvangcomvn";
    if (
      pathname === "/dich-vu" ||
      pathname.startsWith("/dich-vu/") ||
      pathname === "/khoa-hoc" ||
      pathname.startsWith("/khoa-hoc/") ||
      pathname === "/gioi-thieu" ||
      pathname === "/du-an" ||
      pathname === "/lien-he"
    ) {
      return `/ongvangcomvn${pathname}`;
    }
    return pathname;
  }

  return pathname;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect specific routes
  const protectedPaths = ["/admin", "/super-admin", "/workspace", "/customer", "/instructor", "/student"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const authBaseURL = process.env.INTERNAL_AUTH_URL
      ?? (process.env.NODE_ENV === "production" ? "http://127.0.0.1:3000" : request.nextUrl.origin);

    const { data: session } = await betterFetch<SessionWithRole>(
      "/api/auth/get-session",
      {
        baseURL: authBaseURL,
        cache: "no-store",
        headers: {
          cookie: request.headers.get("cookie") || "",
          host: request.headers.get("host") || "",
          "x-forwarded-host": request.headers.get("x-forwarded-host") || request.headers.get("host") || "",
          "x-forwarded-proto": request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", ""),
          origin: request.nextUrl.origin,
        },
      },
    );

    if (!session) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }

    const role = session.user.role || "";

    if ((pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) && role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL("/workspace", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }

    if (pathname.startsWith("/workspace")) {
      const workspaceRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"];
      if (!workspaceRoles.includes(role)) {
        const response = NextResponse.redirect(new URL(role === "CUSTOMER" ? "/customer" : "/login", request.url));
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        return response;
      }
    }

    if (pathname.startsWith("/customer") && role !== "CUSTOMER" && role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }

    if (pathname.startsWith("/instructor") && role !== "INSTRUCTOR" && role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }

    if (pathname.startsWith("/student") && role !== "STUDENT" && role !== "SUPER_ADMIN") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      return response;
    }
  }

  const hostname = request.headers.get("host") || "localhost:3000";
  const normalizedHostname = hostname.split(":")[0] ?? hostname;
  const appDomains = new Set(["app.ovc.vn", "app.ongvang.com.vn"]);
  const isAppDomain = hostname.includes("localhost") || appDomains.has(normalizedHostname);
  const domainTargets = parseDomainTargets();
  const publicTarget = domainTargets[normalizedHostname];

  if (!isAppDomain && publicTarget && publicTarget !== "portal" && !pathname.startsWith("/api") && !pathname.startsWith("/builder")) {
    if (normalizedHostname.startsWith("www.")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.hostname = normalizedHostname.replace(/^www\./, "");
      return NextResponse.redirect(redirectUrl, 308);
    }

    if (pathname === "/ongvangcomvn" || pathname.startsWith("/ongvangcomvn/")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = pathname.replace(/^\/ongvangcomvn/, "") || "/";
      return NextResponse.redirect(redirectUrl, 308);
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = mapPublicModulePath(publicTarget, pathname);
    const response = NextResponse.rewrite(rewriteUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }

  if (!isAppDomain && !pathname.startsWith("/api") && !pathname.startsWith("/builder")) {
    const response = NextResponse.rewrite(new URL(`/sites/${hostname}${pathname}`, request.url));
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }

  const response = NextResponse.next();
  if (isProtected) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
