import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const leadCenterModels = `
// ============================================================
// LEAD CENTER MODULE
// ============================================================

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  UNQUALIFIED
  LOST
  CONVERTED
  SPAM
  DUPLICATE
}

model LeadSource {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  slug           String
  icon           String?
  color          String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  leads        Lead[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("lead_sources")
}

model Lead {
  id                     String     @id @default(cuid())
  organizationId         String
  leadCode               String?
  fullName               String
  companyName            String?
  email                  String?
  phone                  String?
  jobTitle               String?
  website                String?
  sourceId               String?
  campaign               String?
  utmSource              String?
  utmMedium              String?
  utmCampaign            String?
  city                   String?
  province               String?
  address                String?    @db.Text
  note                   String?    @db.Text
  status                 LeadStatus @default(NEW)
  score                  Int        @default(0)
  assignedTo             String?
  convertedCustomerId    String?
  convertedOpportunityId String?
  convertedAt            DateTime?
  createdBy              String?
  updatedBy              String?
  createdAt              DateTime   @default(now())
  updatedAt              DateTime   @updatedAt
  deletedAt              DateTime?

  organization   Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  source         LeadSource?        @relation(fields: [sourceId], references: [id], onDelete: SetNull)
  assignee       User?              @relation("LeadAssignee", fields: [assignedTo], references: [id], onDelete: SetNull)
  tagItems       LeadTagItem[]
  activities     LeadActivity[]
  duplicateLogs1 LeadDuplicateLog[] @relation("LeadDuplicateLogLead1")
  duplicateLogs2 LeadDuplicateLog[] @relation("LeadDuplicateLogLead2")

  @@index([organizationId])
  @@index([email])
  @@index([phone])
  @@map("leads")
}

model LeadTag {
  id             String        @id @default(cuid())
  organizationId String
  name           String
  color          String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  tagItems     LeadTagItem[]

  @@index([organizationId])
  @@map("lead_tags")
}

model LeadTagItem {
  id        String   @id @default(cuid())
  leadId    String
  tagId     String
  createdAt DateTime @default(now())

  lead Lead    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  tag  LeadTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([leadId, tagId])
  @@index([leadId])
  @@index([tagId])
  @@map("lead_tag_items")
}

model LeadActivity {
  id          String    @id @default(cuid())
  leadId      String
  type        String
  title       String?
  content     String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@map("lead_activities")
}

model LeadDuplicateLog {
  id             String    @id @default(cuid())
  leadId         String
  matchedLeadId  String
  matchPercent   Int       @default(100)
  matchReason    String?   @db.Text
  resolvedBy     String?
  resolvedAt     DateTime?
  createdAt      DateTime  @default(now())

  lead        Lead  @relation("LeadDuplicateLogLead1", fields: [leadId], references: [id], onDelete: Cascade)
  matchedLead Lead  @relation("LeadDuplicateLogLead2", fields: [matchedLeadId], references: [id], onDelete: Cascade)
  resolver    User? @relation("LeadDuplicateResolver", fields: [resolvedBy], references: [id], onDelete: SetNull)

  @@index([leadId])
  @@index([matchedLeadId])
  @@map("lead_duplicate_logs")
}
`;

// Insert the models before CRM MODULE
schema = schema.replace('// CRM MODULE', leadCenterModels + '\n// CRM MODULE');

// Insert into Organization
if (schema.includes('model Organization {')) {
  schema = schema.replace(
    '  contacts                      Contact[]',
    '  leadSources                   LeadSource[]\n  leads                         Lead[]\n  leadTags                      LeadTag[]\n  contacts                      Contact[]'
  );
}

// Insert into User
if (schema.includes('model User {')) {
  schema = schema.replace(
    '  assignedContacts Contact[]         @relation("ContactAssignee")',
    '  assignedLeads    Lead[]             @relation("LeadAssignee")\n  resolvedLeadDupes LeadDuplicateLog[] @relation("LeadDuplicateResolver")\n  assignedContacts Contact[]         @relation("ContactAssignee")'
  );
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Schema updated successfully.');
