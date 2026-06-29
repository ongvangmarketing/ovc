import { access, readFile, unlink } from "fs/promises";
import { constants } from "fs";
import { tmpdir } from "os";
import path from "path";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const chromePath = await findChrome();

  if (!chromePath) {
    return NextResponse.json({ error: "Không tìm thấy Chrome/Chromium để render PDF." }, { status: 500 });
  }

  const origin = request.nextUrl.origin;
  const printUrl = `${origin}/document/${encodeURIComponent(token)}/print`;
  const outputPath = path.join(tmpdir(), `ongvang-${token}-${randomUUID()}.pdf`);

  try {
    await runChrome(chromePath, printUrl, outputPath);
    const file = await readFile(outputPath);
    await unlink(outputPath).catch(() => {});

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf; charset=utf-8",
        "Content-Disposition": `attachment; filename="ong-vang-${token}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    await unlink(outputPath).catch(() => {});
    const message = error instanceof Error ? error.message : "Không thể render PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
