import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const redirectUri = `${req.nextUrl.origin}/api/auth/google-drive/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Chưa cấu hình GOOGLE_DRIVE_CLIENT_ID trong .env" }, { status: 400 });
  }

  // Lấy các parameters truyền vào (tên connection, rootFolder, organizationId)
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name") || "Google Drive";
  const rootFolder = searchParams.get("rootFolder") || "";
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ error: "Thiếu organizationId" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  // Truyền trạng thái state để lúc callback biết đang xử lý cho tổ chức nào
  const statePayload = Buffer.from(JSON.stringify({ name, rootFolder, organizationId })).toString("base64");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // Bắt buộc để luôn lấy được refresh_token
    scope: ["https://www.googleapis.com/auth/drive"],
    state: statePayload,
  });

  return NextResponse.redirect(authUrl);
}
