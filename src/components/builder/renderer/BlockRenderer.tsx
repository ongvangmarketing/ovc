import React from "react";
import ServicesGrid from "@/components/blocks/ServicesGrid";
import CoursesGrid from "@/components/blocks/CoursesGrid";
import ProjectsGrid from "@/components/blocks/ProjectsGrid";
import LeadFormBlock from "@/components/blocks/LeadFormBlock";
import LeadForm from "@/components/blocks/LeadForm";
import HeroSection from "@/components/blocks/HeroSection";
import FeaturesGrid from "@/components/blocks/FeaturesGrid";
import FAQ from "@/components/blocks/FAQ";

interface Block {
  type: string;
  tagName?: string;
  attributes?: Record<string, string>;
  components?: Block[] | string;
  binding?: any;
  design?: any;
  content?: string;
}

export default function BlockRenderer({
  blocks,
  orgId,
}: {
  blocks: Block[] | Block;
  orgId?: string;
}) {
  const blockArray = Array.isArray(blocks) ? blocks : [blocks];

  return (
    <>
      {blockArray.map((block, index) => {
        // Raw string content
        if (typeof block === "string") {
          return <span key={index} dangerouslySetInnerHTML={{ __html: block }} />;
        }

        // ── Data Blocks (live DB) ──────────────────────────────────────
        if (block.type === "db-services" || block.attributes?.["data-ovc-block"] === "db-services") {
          const attrs = block.attributes || {};
          return (
            <ServicesGrid
              key={index}
              orgId={orgId}
              limit={parseInt(attrs["data-ovc-limit"] || "6")}
              title={attrs["data-ovc-title"] || undefined}
              subtitle={attrs["data-ovc-subtitle"] || undefined}
            />
          );
        }

        if (block.type === "db-courses" || block.attributes?.["data-ovc-block"] === "db-courses") {
          const attrs = block.attributes || {};
          return (
            <CoursesGrid
              key={index}
              orgId={orgId}
              limit={parseInt(attrs["data-ovc-limit"] || "6")}
              title={attrs["data-ovc-title"] || undefined}
              subtitle={attrs["data-ovc-subtitle"] || undefined}
            />
          );
        }

        if (block.type === "db-projects" || block.attributes?.["data-ovc-block"] === "db-projects") {
          const attrs = block.attributes || {};
          return (
            <ProjectsGrid
              key={index}
              orgId={orgId}
              limit={parseInt(attrs["data-ovc-limit"] || "6")}
              title={attrs["data-ovc-title"] || undefined}
              subtitle={attrs["data-ovc-subtitle"] || undefined}
            />
          );
        }

        if (block.type === "db-form" || block.attributes?.["data-ovc-block"] === "db-form") {
          const attrs = block.attributes || {};
          return (
            <LeadFormBlock
              key={index}
              orgId={orgId}
              formId={attrs["data-ovc-form-id"] || "first"}
              layout={(attrs["data-ovc-layout"] as "centered" | "split") || "centered"}
              title={attrs["data-ovc-title"] || undefined}
              subtitle={attrs["data-ovc-subtitle"] || undefined}
            />
          );
        }

        // ── Legacy/Static Business Blocks ─────────────────────────────
        if (block.attributes?.["data-gjs-type"] === "services") {
          return <ServicesGrid key={index} orgId={orgId} />;
        }

        if (block.attributes?.["data-gjs-type"] === "lead-form") {
          return <LeadForm key={index} binding={block.binding} design={block.design} />;
        }

        if (block.attributes?.["data-gjs-type"] === "hero") {
          return <HeroSection key={index} design={block.design} />;
        }

        if (block.attributes?.["data-gjs-type"] === "features") {
          return <FeaturesGrid key={index} design={block.design} />;
        }

        if (block.attributes?.["data-gjs-type"] === "faq") {
          return <FAQ key={index} design={block.design} />;
        }

        // ── Generic HTML Blocks ────────────────────────────────────────
        const Tag = (block.tagName || "div") as React.ElementType;
        const attrs = block.attributes || {};

        // Convert class → className for React
        const reactAttrs: Record<string, string> = { ...attrs };
        if (reactAttrs.class) {
          reactAttrs.className = reactAttrs.class;
          delete reactAttrs.class;
        }

        return (
          <Tag key={index} {...(reactAttrs as any)}>
            {block.content && (
              <span dangerouslySetInnerHTML={{ __html: block.content }} />
            )}
            {block.components && (
              <BlockRenderer
                blocks={block.components as Block[]}
                orgId={orgId}
              />
            )}
          </Tag>
        );
      })}
    </>
  );
}
