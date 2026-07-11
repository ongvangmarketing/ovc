import { access, mkdir, readFile, unlink } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getTenantDb } from "@/lib/db";

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
      "--print-to-pdf-with-background",
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

function publicOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || "";
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : request.nextUrl.origin;

  return origin.replace(/\/$/, "");
}

function safePdfFilename(value: string) {
  return `${value || "tai-lieu"}`.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function documentPdfFilename(token: string) {
  const [quotation, contract, invoice] = await Promise.all([
    getTenantDb().quotation.findFirst({ where: { token }, select: { number: true } }),
    getTenantDb().contract.findFirst({ where: { token }, select: { number: true } }),
    getTenantDb().invoice.findFirst({ where: { token }, select: { number: true } }),
  ]);
  return `${safePdfFilename(quotation?.number || contract?.number || invoice?.number || token)}.pdf`;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const chromePath = await findChrome();

  if (!chromePath) {
    return NextResponse.json({ error: "Không tìm thấy Chrome/Chromium để render PDF." }, { status: 500 });
  }

  const origin = publicOrigin(request);
  const printUrl = `${origin}/document/${encodeURIComponent(token)}/print`;
  const outputDir = path.join(process.cwd(), ".tmp", "pdf");
  const outputPath = path.join(outputDir, `ongvang-${token}-${randomUUID()}.pdf`);
  const filename = await documentPdfFilename(token);

  try {
    await mkdir(outputDir, { recursive: true });
    await runChrome(chromePath, printUrl, outputPath);
    const file = await readFile(outputPath);
    await unlink(outputPath).catch(() => {});

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    await unlink(outputPath).catch(() => {});
    const message = error instanceof Error ? error.message : "Không thể render PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
