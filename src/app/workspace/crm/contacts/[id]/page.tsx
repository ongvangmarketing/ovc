import { getContactById } from "@/app/actions/crm";
import { notFound } from "next/navigation";
import { ContactDetailClient } from "@/modules/crm/components/contact-detail-client";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContactById(id);

  if (!contact) {
    return notFound();
  }

  return <ContactDetailClient contact={contact} />;
}
