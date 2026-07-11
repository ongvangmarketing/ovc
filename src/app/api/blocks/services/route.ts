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
    const services = await getTenantDb().service.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        options: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            unit: true,
            durationText: true,
            featuresJson: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("[blocks/services] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
