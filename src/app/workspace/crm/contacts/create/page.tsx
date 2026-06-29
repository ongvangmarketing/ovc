import { getCompanies, getContactAssignees } from "@/app/actions/crm";
import { ContactFormClient } from "@/modules/crm/components/contact-form-client";

export default async function CreateContactPage() {
  const [companies, assignees] = await Promise.all([getCompanies(), getContactAssignees()]);

  return (
    <ContactFormClient
      mode="create"
      companies={JSON.parse(JSON.stringify(companies))}
      assignees={JSON.parse(JSON.stringify(assignees))}
    />
  );
}
