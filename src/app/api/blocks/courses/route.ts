import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "6"), 20);

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  try {
    const courses = await getTenantDb().course.findMany({
      where: {
        organizationId: orgId,
        status: "PUBLISHED",
        isPublic: true,
      },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        _count: { select: { enrollments: true, sections: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[blocks/courses] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
