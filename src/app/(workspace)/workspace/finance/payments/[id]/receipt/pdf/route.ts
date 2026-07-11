import { access, mkdir, readFile, unlink, writeFile } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { getPaymentPdfData } from "@/modules/finance/services/payment.service";

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
];

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

function runChrome(chromePath: string, url: string, outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=2500",
      `--print-to-pdf=${outputPath}`,
      "--print-to-pdf-no-header",
      "--no-pdf-header-footer",
      url,
    ]);

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `Chrome exited with code ${code}`));
    });
  });
}

function requestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}

function safePdfFilename(value: string) {
  return `${value || "phieu-thu"}`.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const chromePath = await findChrome();

  if (!chromePath) {
    return NextResponse.json({ error: "Không tìm thấy Chrome/Chromium để render PDF." }, { status: 500 });
  }

  const payment = await getPaymentPdfData(session.organizationId, id);
  if (!payment) return NextResponse.json({ error: "Không tìm thấy phiếu thu." }, { status: 404 });

  const origin = requestOrigin(request);
  const receiptUrl = `${origin}/workspace/finance/payments/${encodeURIComponent(id)}/receipt`;
  const outputDir = path.join(process.cwd(), ".tmp", "pdf");
  const tempHtmlPath = path.join(outputDir, `receipt-${id}-${randomUUID()}.html`);
  const outputPath = path.join(outputDir, `receipt-${id}-${randomUUID()}.pdf`);
  const filename = `${safePdfFilename(payment.number || payment.reference || id)}.pdf`;

  try {
    await mkdir(outputDir, { recursive: true });
    const response = await fetch(receiptUrl, {
      cache: "no-store",
      headers: {
        cookie: request.headers.get("cookie") || "",
        host: request.headers.get("host") || "",
        "x-forwarded-host": request.headers.get("x-forwarded-host") || request.headers.get("host") || "",
        "x-forwarded-proto": request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", ""),
      },
    });
    if (!response.ok) throw new Error(`Không thể tải phiếu thu (${response.status}).`);
    const html = (await response.text()).replace(/<head>/i, `<head><base href="${origin}/">`);
    await writeFile(tempHtmlPath, html);
    await runChrome(chromePath, `file://${tempHtmlPath}`, outputPath);
    const file = await readFile(outputPath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể render PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await unlink(tempHtmlPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}
