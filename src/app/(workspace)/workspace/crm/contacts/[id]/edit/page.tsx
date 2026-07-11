import { getCompanies, getContactAssignees, getContactById } from "@/modules/crm/actions/crm.actions";
import { ContactFormClient } from "@/modules/crm/components/contact-form-client";
import { notFound } from "next/navigation";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [contact, companies, assignees] = await Promise.all([getContactById(id), getCompanies(), getContactAssignees()]);

  if (!contact) return notFound();

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <ContactFormClient
        mode="edit"
        initial={JSON.parse(JSON.stringify(contact))}
        companies={JSON.parse(JSON.stringify(companies))}
        assignees={JSON.parse(JSON.stringify(assignees))}
      />
    </div>
  );
}
