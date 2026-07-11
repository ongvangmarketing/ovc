import { readFile } from "fs/promises";
import path from "path";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathParts } = await params;
  const safeParts = pathParts.filter((part) => part && part !== "." && part !== "..");
  if (!safeParts.length || safeParts.length !== pathParts.length) {
    return new Response("Not found", { status: 404 });
  }

  const uploadRoot = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadRoot, ...safeParts);
  const relativePath = path.relative(uploadRoot, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[ext];
  if (!contentType) {
    return new Response("Unsupported file", { status: 415 });
  }

  try {
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
