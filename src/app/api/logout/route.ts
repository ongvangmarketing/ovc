import { NextResponse } from "next/server";

const authCookies = [
  "better-auth.session_token",
  "better-auth.session_data",
  "better-auth.active_organization",
];

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (const name of authCookies) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}
