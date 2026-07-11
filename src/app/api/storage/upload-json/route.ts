import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/lib/db";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function getUploadContext(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  let organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    const member = await getTenantDb().organizationMember.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
    organizationId = member?.organizationId ?? null;
  }

  if (!organizationId) {
    throw new Error("No organization");
  }

  return {
    organizationId,
    userId: session.user.id,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, userId } = await getUploadContext(req);
    const body = await req.json();

    const fileName = String(body.fileName || "");
    const mimeType = String(body.mimeType || "application/octet-stream");
    const category = String(body.category || "GENERAL");
    const moduleName = String(body.module || "CORE");
    const relatedRecordId = String(body.relatedRecordId || "");
    const base64 = String(body.base64 || "");

    if (!fileName || !base64) {
      return NextResponse.json({ success: false, error: "Invalid file upload request" }, { status: 400 });
    }

    const buffer = Buffer.from(base64, "base64");
    if (!buffer.byteLength) {
      return NextResponse.json({ success: false, error: "Invalid file content" }, { status: 400 });
    }

    const file = await StorageGateway.upload(
      buffer,
      fileName,
      mimeType,
      category,
      moduleName,
      organizationId,
      relatedRecordId,
      userId
    );

    return NextResponse.json({ success: true, fileId: file.id });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "Unauthorized" ? 401 : message === "No organization" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
