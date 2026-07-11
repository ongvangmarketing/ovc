import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { MisaESignService } from "@/modules/digital-office/services/misa-esign.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Digital Office đang ở Development." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const result = await MisaESignService.connect({
      baseUrl: String(body.baseUrl || process.env.MISA_ESIGN_BASE_URL || "https://esignapp.misa.vn"),
      clientId: String(body.clientId || process.env.MISA_ESIGN_CLIENT_ID || ""),
      clientKey: String(body.clientKey || process.env.MISA_ESIGN_CLIENT_KEY || ""),
      userName: String(body.userName || process.env.MISA_ESIGN_USERNAME || ""),
      password: String(body.password || process.env.MISA_ESIGN_PASSWORD || ""),
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không kết nối được MISA eSign.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
