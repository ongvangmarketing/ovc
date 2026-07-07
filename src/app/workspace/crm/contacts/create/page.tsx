import { getCompanies, getContactAssignees } from "@/app/actions/crm";
import { ContactFormClient } from "@/modules/crm/components/contact-form-client";

export default async function CreateContactPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const [companies, assignees] = await Promise.all([getCompanies(), getContactAssignees()]);
  const selectedCompany = companyId ? companies.find((company) => company.id === companyId) : undefined;

  return (
    <ContactFormClient
      mode="create"
      companies={JSON.parse(JSON.stringify(companies))}
      assignees={JSON.parse(JSON.stringify(assignees))}
      initial={selectedCompany ? {
        firstName: "",
        companyId: selectedCompany.id,
        company: {
          id: selectedCompany.id,
          name: selectedCompany.name,
          email: selectedCompany.email,
          phone: selectedCompany.phone,
          address: selectedCompany.address,
          customFields: selectedCompany.customFields,
        },
      } : undefined}
    />
  );
}
