import re

with open("src/app/actions/finance-crud.ts", "r") as f:
    content = f.read()

helper = """
// --- Added Helper for Contact/Company cross-update ---
async function handleTargetData(data: any, organizationId: string) {
  let contactId = data.contactId || undefined;
  let companyId = data.companyId || undefined;

  // Handle Company
  if (data.targetType === "company" || data.companyName) {
    if (companyId) {
      await db.company.update({
        where: { id: companyId },
        data: {
          name: data.companyName || undefined,
          phone: data.contactPhone || undefined,
          email: data.contactEmail || undefined,
          address: data.contactAddress || undefined,
        }
      });
    } else if (data.companyName) {
      const newCompany = await db.company.create({
        data: {
          organizationId,
          name: data.companyName,
          phone: data.contactPhone || null,
          email: data.contactEmail || null,
          address: data.contactAddress || null,
        }
      });
      companyId = newCompany.id;
    }
  }

  // Handle Contact
  if (data.targetType !== "company" || data.contactName) {
    if (contactId) {
      await db.contact.update({
        where: { id: contactId },
        data: {
          firstName: data.contactName || undefined,
          lastName: "",
          phone: data.contactPhone || undefined,
          email: data.contactEmail || undefined,
          address: data.contactAddress || undefined,
          companyId: companyId || undefined,
        }
      });
    } else if (data.contactName) {
      const newContact = await db.contact.create({
        data: {
          organizationId,
          firstName: data.contactName,
          lastName: "",
          phone: data.contactPhone || null,
          email: data.contactEmail || null,
          address: data.contactAddress || null,
          companyId: companyId || undefined,
        }
      });
      contactId = newContact.id;
    }
  }

  return { contactId, companyId };
}
// -----------------------------------------------------
"""

if "handleTargetData" not in content:
    content = content.replace("export async function createQuotation", helper + "\nexport async function createQuotation")

# Now update the create/update functions to use the helper and add assigneeId/companyId to Contract and Invoice
def inject_helper(func_name, code):
    pattern = rf"(export async function {func_name}\(.*?\) {{\n\s*const session = await requireFinanceSession\(\);\n.*?(?:const quoteCode = [^\n]*\n)?)"
    replacement = r"\1  const { contactId, companyId } = await handleTargetData(data, session.organizationId);\n"
    
    code = re.sub(pattern, replacement, code, count=1, flags=re.DOTALL)
    
    # Replace data.contactId ? ... with contactId ? ...
    # Be careful to only replace within the specific create/update block!
    return code

# We will just do a global replace for the data object mapping because it's predictable
# We'll replace `contact: data.contactId ? { connect: { id: data.contactId } } : undefined,`
# with `contact: contactId ? { connect: { id: contactId } } : undefined,`
# And `company: data.companyId ? ...` with `companyId`

for func in ["createQuotation", "updateQuotation", "createContract", "updateContract", "createInvoice", "updateInvoice"]:
    content = inject_helper(func, content)

# Fix references to data.contactId and data.companyId inside the Prisma calls
content = re.sub(r'contact:\s*data\.contactId\s*\?\s*\{\s*connect:\s*\{\s*id:\s*data\.contactId\s*\}\s*\}\s*:\s*undefined,', 
                 r'contact: contactId ? { connect: { id: contactId } } : undefined,', content)

content = re.sub(r'company:\s*data\.companyId\s*\?\s*\{\s*connect:\s*\{\s*id:\s*data\.companyId\s*\}\s*\}\s*:\s*undefined,', 
                 r'company: companyId ? { connect: { id: companyId } } : undefined,', content)

# Add company and assignee to Contract and Invoice
content = re.sub(r'(deal:\s*data\.dealId[^\n]*\n)', r'\1      company: companyId ? { connect: { id: companyId } } : undefined,\n      assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : undefined,\n', content)

# Wait, Invoice uses projectId, not dealId!
# In createInvoice: `project: data.projectId ? { connect: { id: data.projectId } } : undefined,`
content = re.sub(r'(project:\s*data\.projectId[^\n]*\n)', r'\1      company: companyId ? { connect: { id: companyId } } : undefined,\n      assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : undefined,\n      deal: data.dealId ? { connect: { id: data.dealId } } : undefined,\n', content)


with open("src/app/actions/finance-crud.ts", "w") as f:
    f.write(content)

