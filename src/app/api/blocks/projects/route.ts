import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "6"), 20);

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  try {
    const projects = await db.project.findMany({
      where: {
        organizationId: orgId,
        isArchived: false,
        status: { in: ["ACTIVE", "COMPLETED", "PLANNING", "ON_HOLD"] },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
          take: 4,
          orderBy: { joinedAt: "asc" },
        },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: limit,
    });

    const projectsWithProgress = projects.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t: { status: string }) => t.status === "DONE").length;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        color: p.color,
        icon: p.icon,
        budget: p.budget,
        dueDate: p.dueDate,
        owner: p.owner,
        members: p.members,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
        taskCount: total,
      };
    });

    return NextResponse.json({ projects: projectsWithProgress });
  } catch (error) {
    console.error("[blocks/projects] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
