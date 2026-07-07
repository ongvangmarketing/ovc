import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ServicesGrid from "@/components/blocks/ServicesGrid";
import CoursesGrid from "@/components/blocks/CoursesGrid";
import ProjectsGrid from "@/components/blocks/ProjectsGrid";
import LeadFormBlock from "@/components/blocks/LeadFormBlock";

export const dynamic = "force-dynamic";

// ─── Block Placeholder Parser ──────────────────────────────────────────────
// GrapeJS renders data blocks as:
//   <div data-ovc-block="db-services" data-ovc-limit="6" ...>PLACEHOLDER</div>
// We split the HTML into segments and hydrate those divs server-side.

type HtmlSegment = { kind: "html"; content: string };
type BlockSegment = {
  kind: "block";
  type: string;
  props: Record<string, string>;
};
type Segment = HtmlSegment | BlockSegment;

/**
 * Split HTML string into alternating HTML segments and data-block segments.
 * We match the OUTER div only; inner placeholder content is discarded.
 *
 * Marker convention: <div data-ovc-block="TYPE" data-ovc-*="VALUE" ...>...</div>
 * We use `data-ovc-block` as the trigger so static blocks are unaffected.
 */
function parseSegments(html: string): Segment[] {
  const segments: Segment[] = [];

  // Match outer <div data-ovc-block="..."> ... </div>
  // We allow the div to contain anything (non-greedy), but we must
  // track depth to find the matching close tag.
  // Strategy: find opening tag with data-ovc-block, then scan depth.
  const openRe = /<div([^>]*?)data-ovc-block="([^"]+)"([^>]*)>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = openRe.exec(html)) !== null) {
    const openStart = match.index;
    const openEnd = openStart + match[0].length;

    // Extract type and props
    const blockType = match[2];
    const allAttrs = (match[1] + " " + match[3]).trim();
    const props: Record<string, string> = {};
    const attrRe = /data-ovc-([a-z0-9-]+)="([^"]*)"/gi;
    let am: RegExpExecArray | null;
    while ((am = attrRe.exec(allAttrs)) !== null) {
      if (am[1] && am[2] !== undefined) props[am[1]] = am[2];
    }

    // Find matching </div> by depth tracking
    let depth = 1;
    let cursor = openEnd;
    while (cursor < html.length && depth > 0) {
      const nextOpen  = html.indexOf("<div",  cursor);
      const nextClose = html.indexOf("</div>", cursor);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          const closeEnd = nextClose + 6; // "</div>".length === 6

          // Push HTML before this block
          if (openStart > lastIndex) {
            segments.push({ kind: "html", content: html.slice(lastIndex, openStart) });
          }
          if (blockType) segments.push({ kind: "block", type: blockType, props });
          lastIndex = closeEnd;
          openRe.lastIndex = closeEnd;
          break;
        }
        cursor = nextClose + 6;
      }
    }
  }

  // Remaining HTML
  if (lastIndex < html.length) {
    segments.push({ kind: "html", content: html.slice(lastIndex) });
  }

  return segments;
}

// ─── Block loading fallback ────────────────────────────────────────────────
function BlockSkeleton() {
  return (
    <div
      style={{
        padding: "64px 40px",
        textAlign: "center",
        background: "#f8fafc",
        color: "#94a3b8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: "inline-block",
          width: 32,
          height: 32,
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "block-spin .8s linear infinite",
        }}
      />
      <style>{`@keyframes block-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Data Block Renderer ───────────────────────────────────────────────────
function DataBlock({ segment, orgId }: { segment: BlockSegment; orgId: string }) {
  const { type, props } = segment;
  const limit = parseInt(props["limit"] || "6");
  const formId = props["form-id"] || "first";
  const layout = props["layout"] as "centered" | "split" | undefined;

  switch (type) {
    case "db-services":
      return (
        <Suspense fallback={<BlockSkeleton />}>
          <ServicesGrid
            orgId={orgId}
            limit={limit}
            title={props["title"] || undefined}
            subtitle={props["subtitle"] || undefined}
          />
        </Suspense>
      );

    case "db-courses":
      return (
        <Suspense fallback={<BlockSkeleton />}>
          <CoursesGrid
            orgId={orgId}
            limit={limit}
            title={props["title"] || undefined}
            subtitle={props["subtitle"] || undefined}
          />
        </Suspense>
      );

    case "db-projects":
      return (
        <Suspense fallback={<BlockSkeleton />}>
          <ProjectsGrid
            orgId={orgId}
            limit={limit}
            title={props["title"] || undefined}
            subtitle={props["subtitle"] || undefined}
          />
        </Suspense>
      );

    case "db-form":
      return (
        <Suspense fallback={<BlockSkeleton />}>
          <LeadFormBlock
            orgId={orgId}
            formId={formId}
            layout={layout}
            title={props["title"] || undefined}
            subtitle={props["subtitle"] || undefined}
          />
        </Suspense>
      );

    default:
      return null;
  }
}

// ─── Page Component ────────────────────────────────────────────────────────
export default async function PreviewPage(
  props: { params: Promise<{ pageId: string }> }
) {
  const params = await props.params;
  const page = await db.page.findUnique({ where: { id: params.pageId } });

  if (!page) notFound();

  let html = "";
  let css  = "";

  if (page.content) {
    const parsed =
      typeof page.content === "string"
        ? JSON.parse(page.content)
        : page.content;
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      parsed.components
    ) {
      html = parsed.html || "";
      css  = parsed.css  || "";
    }
  }

  // Check if there are any data blocks to hydrate
  const hasDataBlocks = html.includes('data-ovc-block=');
  const segments: Segment[] = hasDataBlocks
    ? parseSegments(html)
    : [{ kind: "html", content: html }];

  const orgId = page.organizationId;

  if (!html) {
    return (
      <div
        style={{
          padding: "80px 40px",
          textAlign: "center",
          color: "#94a3b8",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <p style={{ fontSize: "1rem" }}>
          Chưa có nội dung. Vui lòng mở trình chỉnh sửa và ấn{" "}
          <strong>Save Draft</strong> để lưu giao diện.
        </p>
      </div>
    );
  }

  return (
    <div>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}

      {segments.map((seg, i) => {
        if (seg.kind === "html") {
          return seg.content ? (
            <div key={i} dangerouslySetInnerHTML={{ __html: seg.content }} />
          ) : null;
        }
        return <DataBlock key={i} segment={seg} orgId={orgId} />;
      })}
    </div>
  );
}
