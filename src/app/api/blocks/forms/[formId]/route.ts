import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ formId: string }> }
) {
  const { formId } = await props.params;
  const orgId = request.nextUrl.searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  try {
    let form;
    if (formId === "first") {
      form = await db.leadForm.findFirst({
        where: { organizationId: orgId, status: "ACTIVE" },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    } else {
      form = await db.leadForm.findFirst({
        where: { id: formId, organizationId: orgId },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    }

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("[blocks/forms] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
