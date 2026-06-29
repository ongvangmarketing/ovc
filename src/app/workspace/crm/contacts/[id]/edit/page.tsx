import { getCompanies, getContactAssignees, getContactById } from "@/app/actions/crm";
import { ContactFormClient } from "@/modules/crm/components/contact-form-client";
import { notFound } from "next/navigation";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contact, companies, assignees] = await Promise.all([getContactById(id), getCompanies(), getContactAssignees()]);

  if (!contact) return notFound();

  return (
    <ContactFormClient
      mode="edit"
      initial={JSON.parse(JSON.stringify(contact))}
      companies={JSON.parse(JSON.stringify(companies))}
      assignees={JSON.parse(JSON.stringify(assignees))}
    />
  );
}
