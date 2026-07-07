import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerProjectDetail } from "./CustomerProjectDetail";
import { getCustomerPortalData } from "../../portal-data";
import { PortalMissingContact } from "../../portal-shell";

export const metadata: Metadata = {
  title: "Chi tiết dự án",
};

export default async function PortalProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  const project = data.projects.find((item) => item.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-full">
      <CustomerProjectDetail project={project} baseHref="/customer/projects" />
    </div>
  );
}
