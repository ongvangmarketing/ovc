import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Error publishing page:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
