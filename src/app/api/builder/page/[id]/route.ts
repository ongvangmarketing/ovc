import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    let content = [];
    let html = "";
    let css = "";
    if (page.content) {
      const parsed = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.components) {
        content = parsed.components;
        html = parsed.html || "";
        css = parsed.css || "";
      } else {
        content = parsed;
      }
    }

    return NextResponse.json({ ...page, content, html, css });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const data = await req.json();

    // Module license check could happen here
    // For now we just update the page content
    const updatedPage = await prisma.page.update({
      where: { id: params.id },
      data: {
        content: JSON.stringify({
          components: data.content,
          html: data.html,
          css: data.css,
        }),
      },
    });

    revalidatePath(`/preview/${params.id}`);

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
