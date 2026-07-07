import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# For Contract model
# Need to add companyId, assigneeId
contract_addition = """  contactId       String?
  companyId       String?
  assigneeId      String?"""
content = re.sub(r'  contactId       String\?', contract_addition, content)

contract_relations = """  contact             Contact?             @relation(fields: [contactId], references: [id])
  company             Company?             @relation(fields: [companyId], references: [id])
  assignee            User?                @relation("ContractAssignee", fields: [assigneeId], references: [id])"""
content = re.sub(r'  contact             Contact\?             @relation\(fields: \[contactId\], references: \[id\]\)', contract_relations, content)

# For Invoice model
# Need to add companyId, assigneeId, dealId
invoice_addition = """  contactId       String?
  companyId       String?
  dealId          String?
  assigneeId      String?"""
content = re.sub(r'  contactId       String\?', invoice_addition, content)

invoice_relations = """  contact       Contact?      @relation(fields: [contactId], references: [id])
  company       Company?      @relation(fields: [companyId], references: [id])
  deal          Deal?         @relation(fields: [dealId], references: [id])
  assignee      User?         @relation("InvoiceAssignee", fields: [assigneeId], references: [id])"""
content = re.sub(r'  contact       Contact\?      @relation\(fields: \[contactId\], references: \[id\]\)', invoice_relations, content)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)

