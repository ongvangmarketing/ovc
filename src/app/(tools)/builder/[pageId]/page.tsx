import EditorClient from "@/components/builder/EditorClient";
import { getTenantDb } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function BuilderPage(
  props: {
    params: Promise<{ pageId: string }>;
  }
) {
  const params = await props.params;
  const page = await getTenantDb().page.findUnique({ where: { id: params.pageId } });
  
  if (!page) {
    notFound();
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <EditorClient pageId={params.pageId} slug={page.slug} />
    </div>
  );
}
