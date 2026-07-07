import { getContactById } from "@/app/actions/crm";
import { notFound } from "next/navigation";
import { ContactDetailClient } from "@/modules/crm/components/contact-detail-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { organizationHasModule } from "@/lib/modules/entitlements";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const contact = await getContactById(id);

  if (!contact || !session?.organizationId) {
    return notFound();
  }

  const hasProjectsModule = await organizationHasModule(session.organizationId, "PROJECTS");

  return <ContactDetailClient contact={contact} hasProjectsModule={hasProjectsModule} />;
}
