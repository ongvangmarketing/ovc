import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSystemDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const redirectUri = `${req.nextUrl.origin}/api/auth/google-drive/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Chưa cấu hình GOOGLE_DRIVE_CLIENT_ID" }, { status: 400 });
  }

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error) {
    return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/admin/settings?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Thiếu code hoặc state" }, { status: 400 });
  }

  try {
    const { name, rootFolder, organizationId } = JSON.parse(Buffer.from(state, "base64").toString("utf8"));

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Lưu vào database
    const db = getSystemDb();
    await db.storageConnection.create({
      data: {
        organizationId,
        name,
        provider: "GOOGLE_DRIVE",
        rootFolder: rootFolder || null,
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date
        }
      }
    });

    return NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/admin/settings?success=1`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Google Drive OAuth Callback Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
