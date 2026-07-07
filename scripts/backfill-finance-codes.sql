BEGIN;

UPDATE quotations
SET number = 'QT-' || number
WHERE number !~ '^[A-Za-z]+-';

WITH numbered_payments AS (
  SELECT
    id,
    'PT-' || to_char("createdAt", 'YYYYMM') || '-' ||
      lpad(row_number() OVER (
        PARTITION BY "organizationId", date_trunc('month', "createdAt")
        ORDER BY "createdAt", id
      )::text, 4, '0') AS generated_number
  FROM payments
  WHERE number IS NULL OR btrim(number) = ''
)
UPDATE payments
SET number = numbered_payments.generated_number
FROM numbered_payments
WHERE payments.id = numbered_payments.id;

COMMIT;
