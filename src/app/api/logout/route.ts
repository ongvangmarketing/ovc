import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authCookies = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.active_organization",
];

function clearAuthCookies(response: NextResponse, request?: NextRequest) {
  const cookieNames = new Set(authCookies);
  request?.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes("better-auth")) cookieNames.add(cookie.name);
  });

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

export async function GET(request: NextRequest) {
  return clearAuthCookies(NextResponse.redirect(new URL("/login", request.url)), request);
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response, request);
  return response;
}
