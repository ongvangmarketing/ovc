import { notFound } from "next/navigation";
import { db as prisma } from "@/lib/db";
import BlockRenderer from "@/components/builder/renderer/BlockRenderer";

export default async function SitePage(
  props: {
    params: Promise<{ hostname: string; slug?: string[] }>;
  }
) {
  const params = await props.params;
  const hostname = params.hostname;
  // If slug is not provided, it means it's the root path ("/")
  const slugPath = params.slug ? params.slug.join("/") : "";

  // Find the site by hostname
  const site = await prisma.site.findFirst({
    where: {
      OR: [{ domain: hostname }, { subdomain: hostname }],
    },
  });

  if (!site) {
    return notFound();
  }

  // Find the page
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      slug: slugPath,
      status: "PUBLISHED",
    },
  });

  if (!page) {
    return notFound();
  }

  // Parse the JSON content
  let blocks = [];
  if (page.content) {
    try {
      blocks = typeof page.content === "string" ? JSON.parse(page.content) : page.content;
    } catch (e) {
      console.error("Failed to parse page content JSON", e);
    }
  }

  return (
    <div className="w-full min-h-screen">
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
