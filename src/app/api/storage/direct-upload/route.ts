import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/lib/db";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

type DirectUploadSession = {
  organizationId: string;
  connectionId: string;
  uploadUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  category: string;
  moduleName: string;
  relatedRecordId: string;
  uploadedById: string;
};

const sessions = new Map<string, DirectUploadSession>();
const DRIVE_RELAY_TIMEOUT_MS = 5 * 60 * 1000;

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

async function completeUploadSession(uploadSessionId: string, providerId: string, organizationId: string, userId: string) {
  const uploadSession = sessions.get(uploadSessionId);
  if (!uploadSession) {
    return NextResponse.json({ success: false, error: "Upload session not found" }, { status: 404 });
  }

  if (uploadSession.organizationId !== organizationId || uploadSession.uploadedById !== userId) {
    return NextResponse.json({ success: false, error: "Upload session mismatch" }, { status: 403 });
  }

  if (!providerId) {
    return NextResponse.json({ success: false, error: "Missing providerId" }, { status: 400 });
  }

  const file = await StorageGateway.completeDirectUpload({
    ...uploadSession,
    providerId,
  });
  sessions.delete(uploadSessionId);

  return NextResponse.json({ success: true, fileId: file.id });
}

async function uploadToDriveNow(uploadSessionId: string, uploadSession: DirectUploadSession, buffer: Buffer) {
  console.log(`[direct-upload] Relay to Google started (${uploadSession.fileName}, ${uploadSession.sizeBytes} bytes)`);
  const requestBody = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  const driveRes = await fetch(uploadSession.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": uploadSession.mimeType,
      "Content-Length": uploadSession.sizeBytes.toString(),
      "Content-Range": `bytes 0-${uploadSession.sizeBytes - 1}/${uploadSession.sizeBytes}`,
    },
    body: requestBody,
    signal: AbortSignal.timeout(DRIVE_RELAY_TIMEOUT_MS),
  });

  const text = await driveRes.text();
  console.log(`[direct-upload] Google responded ${driveRes.status} ${driveRes.statusText}`);
  let data: { id?: string; error?: { message?: string } } | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!driveRes.ok) {
    throw new Error(data?.error?.message || `Google Drive upload failed: ${text || driveRes.statusText}`);
  }

  if (!data?.id) {
    throw new Error("Google Drive did not return a file ID");
  }

  const file = await StorageGateway.completeDirectUpload({
    ...uploadSession,
    providerId: data.id,
  });

  sessions.delete(uploadSessionId);
  console.log(`[direct-upload] Completed fileId=${file.id}`);
  return file;
}

async function uploadThroughConfiguredProvider(
  uploadSessionId: string,
  uploadSession: DirectUploadSession,
  buffer: Buffer,
) {
  if (uploadSession.uploadUrl.includes("googleapis.com")) {
    return uploadToDriveNow(uploadSessionId, uploadSession, buffer);
  }

  const file = await StorageGateway.upload(
    buffer,
    uploadSession.fileName,
    uploadSession.mimeType,
    uploadSession.category,
    uploadSession.moduleName,
    uploadSession.organizationId,
    uploadSession.relatedRecordId,
    uploadSession.uploadedById,
  );

  sessions.delete(uploadSessionId);
  return file;
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, userId } = await getUploadContext(req);
    const body = await req.json();

    const action = String(body.action || "start");
    if (action === "complete") {
      const uploadSessionId = String(body.uploadSessionId || "");
      const providerId = String(body.providerId || "");
      return await completeUploadSession(uploadSessionId, providerId, organizationId, userId);
    }

    const fileName = String(body.fileName || "");
    const mimeType = String(body.mimeType || "application/octet-stream");
    const sizeBytes = Number(body.sizeBytes || 0);
    const category = String(body.category || "GENERAL");
    const moduleName = String(body.module || "CORE");
    const relatedRecordId = String(body.relatedRecordId || "");

    if (!fileName || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      return NextResponse.json({ success: false, error: "Invalid file upload request" }, { status: 400 });
    }
    let origin = req.headers.get("origin");
    if (!origin) {
      const referer = req.headers.get("referer");
      if (referer) {
        try { origin = new URL(referer).origin; } catch {}
      }
    }
    if (!origin) {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") || "http";
      if (host) origin = `${proto}://${host}`;
    }
    if (!origin) {
      origin = req.nextUrl.origin;
    }

    const directSession = await StorageGateway.createDirectUploadSession(
      fileName,
      mimeType,
      sizeBytes,
      category,
      moduleName,
      organizationId,
      origin
    );

    const uploadSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessions.set(uploadSessionId, {
      organizationId,
      connectionId: directSession.connectionId,
      uploadUrl: directSession.uploadUrl,
      fileName,
      mimeType,
      sizeBytes,
      path: directSession.folderPath,
      category,
      moduleName,
      relatedRecordId,
      uploadedById: userId,
    });

    setTimeout(() => sessions.delete(uploadSessionId), 30 * 60 * 1000);

    return NextResponse.json({
      success: true,
      uploadUrl: directSession.uploadUrl,
      uploadSessionId,
      provider: directSession.provider,
      providerId: directSession.providerId,
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "Unauthorized" ? 401 : message === "No organization" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { organizationId, userId } = await getUploadContext(req);
    const uploadSessionId = req.nextUrl.searchParams.get("uploadSessionId") || "";
    const uploadSession = sessions.get(uploadSessionId);

    if (!uploadSession) {
      return NextResponse.json({ success: false, error: "Upload session not found" }, { status: 404 });
    }

    if (uploadSession.organizationId !== organizationId || uploadSession.uploadedById !== userId) {
      return NextResponse.json({ success: false, error: "Upload session mismatch" }, { status: 403 });
    }

    const arrayBuffer = await req.arrayBuffer();
    if (arrayBuffer.byteLength !== uploadSession.sizeBytes) {
      return NextResponse.json({ success: false, error: "Uploaded file size mismatch" }, { status: 400 });
    }

    const file = await uploadThroughConfiguredProvider(
      uploadSessionId,
      uploadSession,
      Buffer.from(arrayBuffer),
    );

    return NextResponse.json({ success: true, fileId: file.id, status: "done" }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "Unauthorized" ? 401 : message === "No organization" ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
