ALTER TABLE "companies"
  ADD COLUMN IF NOT EXISTS "taxCode" TEXT,
  ADD COLUMN IF NOT EXISTS "representativeName" TEXT,
  ADD COLUMN IF NOT EXISTS "representativeTitle" TEXT;

ALTER TABLE "contacts"
  ADD COLUMN IF NOT EXISTS "identityNumber" TEXT;

UPDATE "companies"
SET
  "taxCode" = COALESCE(NULLIF("taxCode", ''), NULLIF("customFields"->>'taxCode', '')),
  "representativeName" = COALESCE(
    NULLIF("representativeName", ''),
    NULLIF("customFields"->>'representativeName', ''),
    NULLIF("customFields"->>'representative', ''),
    NULLIF("customFields"->>'legalRepresentative', ''),
    NULLIF("customFields"->>'contactPerson', ''),
    NULLIF("customFields"->>'companyRepresentative', '')
  ),
  "representativeTitle" = COALESCE(
    NULLIF("representativeTitle", ''),
    NULLIF("customFields"->>'representativeTitle', ''),
    NULLIF("customFields"->>'position', ''),
    NULLIF("customFields"->>'jobTitle', ''),
    NULLIF("customFields"->>'title', '')
  )
WHERE "customFields" IS NOT NULL;

UPDATE "contacts"
SET "identityNumber" = COALESCE(
  NULLIF("identityNumber", ''),
  NULLIF("customFields"->>'identityNumber', ''),
  NULLIF("customFields"->>'cccd', ''),
  NULLIF("customFields"->>'citizenId', ''),
  NULLIF("customFields"->>'idNumber', '')
)
WHERE "customFields" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "companies_taxCode_idx" ON "companies"("taxCode");
CREATE INDEX IF NOT EXISTS "contacts_identityNumber_idx" ON "contacts"("identityNumber");
