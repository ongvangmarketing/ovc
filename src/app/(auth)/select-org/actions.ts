"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function setActiveOrganization(organizationId: string) {
  const hdrs = await headers();
  const result = await auth.api.getSession({
    headers: hdrs,
  });

  if (!result?.user) {
    throw new Error("Unauthorized");
  }

  // Set the active organization cookie
  const cookieStore = await cookies();
  cookieStore.set("better-auth.active_organization", organizationId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Determine redirect URL based on role
  const role = result.user.role;
  let targetUrl = "/";
  if (role === "CUSTOMER") {
    targetUrl = "/customer";
  } else if (role === "INSTRUCTOR") {
    targetUrl = "/instructor";
  } else if (role === "STUDENT") {
    targetUrl = "/student";
  } else if (role === "AGENT") {
    targetUrl = "/agent";
  } else {
    // Admin / Staff / Manager
    targetUrl = "/workspace";
  }

  return { success: true, targetUrl };
}
