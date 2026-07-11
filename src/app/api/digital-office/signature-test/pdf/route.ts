import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { createSignatureTestPdf } from "@/modules/digital-office/services/signature-test-pdf.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Digital Office đang ở Development." }, { status: 403 });
    }

    const pdf = createSignatureTestPdf();
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="ovc-digital-office-sign-test.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
