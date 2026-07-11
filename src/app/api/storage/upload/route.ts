import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/lib/db";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// In-memory job store (per process)
const jobs = new Map<string, { status: "pending" | "done" | "error"; fileId?: string; error?: string }>();

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// Queue upload job with zero dependency on HTTP context
function enqueueUpload(
  jobId: string,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  category: string,
  module: string,
  orgId: string,
  relatedRecordId: string,
  uploadedById: string
) {
  // Use setTimeout(0) to fully escape the current call stack / HTTP handler scope
  setTimeout(async () => {
    try {
      console.log(`[upload] ▶ Job ${jobId}: ${fileName} → ${category}`);
      const result = await StorageGateway.upload(
        buffer,
        fileName,
        mimeType,
        category,
        module,
        orgId,
        relatedRecordId,
        uploadedById
      );
      jobs.set(jobId, { status: "done", fileId: result.id });
      console.log(`[upload] ✓ Job ${jobId} → fileId=${result.id}`);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error(`[upload] ✗ Job ${jobId}:`, message);
      jobs.set(jobId, { status: "error", error: message });
    } finally {
      // Auto-cleanup after 10 minutes
      setTimeout(() => jobs.delete(jobId), 10 * 60 * 1000);
    }
  }, 0);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  console.log("[upload] Incoming upload request");

  // --- Step 1: Auth ---
  let session;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[upload] Auth error:", message);
    return NextResponse.json({ success: false, error: `Auth error: ${message}` }, { status: 500 });
  }
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // --- Step 2: OrgId ---
  let orgId = session.session.activeOrganizationId;
  if (!orgId) {
    const member = await getTenantDb().organizationMember.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
    orgId = member?.organizationId ?? null;
  }
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 403 });
  }

  // --- Step 3: Parse form ---
  let file: File | null = null;
  let category = "GENERAL";
  let moduleName = "CORE";
  let relatedRecordId = "";
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
    category = (form.get("category") as string) || "GENERAL";
    moduleName = (form.get("module") as string) || "CORE";
    relatedRecordId = (form.get("relatedRecordId") as string) || "";
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[upload] Form parse error:", message);
    return NextResponse.json({ success: false, error: `Form parse error: ${message}` }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ success: false, error: "No file" }, { status: 400 });
  }

  // --- Step 4: Read buffer (must happen before response) ---
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("[upload] File read error:", message);
    return NextResponse.json({ success: false, error: `File read error: ${message}` }, { status: 400 });
  }
  const fileName = file.name;
  const mimeType = file.type || "application/octet-stream";

  // --- Step 5: Register job and return IMMEDIATELY ---
  const jobId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  jobs.set(jobId, { status: "pending" });

  // Enqueue AFTER response is fully committed
  enqueueUpload(jobId, buffer, fileName, mimeType, category, moduleName, orgId, relatedRecordId, session.user.id);

  return NextResponse.json({ success: true, jobId, status: "pending" }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
}

// Poll: GET /api/storage/upload?jobId=xxx
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  const job = jobs.get(jobId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}
