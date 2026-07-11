import { NextRequest, NextResponse } from "next/server";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return new NextResponse("Missing fileId", { status: 400 });
    }

    const { buffer, file } = await StorageGateway.download(fileId);

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set("Content-Disposition", `inline; filename="${file.name}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(buffer as any, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error("Storage download error:", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
