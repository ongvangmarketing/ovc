import { getTenantDb } from "@/lib/db";

export interface CodeFormat {
  prefix: string;
  dateFormat: string; // "", "YYYY", "MMYYYY", "DDMMYYYY"
  counterLength: number; // 3, 4, 5, 6
}

function parseFormat(value: string | undefined, defaultPrefix: string): CodeFormat {
  if (!value) return { prefix: defaultPrefix, dateFormat: "", counterLength: 3 };
  try {
    const parsed = JSON.parse(value) as Partial<CodeFormat>;
    const counterLength = Math.min(Math.max(Number(parsed.counterLength) || 3, 1), 6);
    return {
      prefix: typeof parsed.prefix === "string" ? parsed.prefix : defaultPrefix,
      dateFormat: typeof parsed.dateFormat === "string" ? parsed.dateFormat : "",
      counterLength,
    };
  } catch (e) {
    return { prefix: defaultPrefix, dateFormat: "", counterLength: 3 };
  }
}

async function existingNumbers(orgId: string, formatKey: string, startsWith: string) {
  const where = { organizationId: orgId, number: { startsWith } };

  if (formatKey === "FORMAT_QUOTE") {
    return getTenantDb().quotation.findMany({ where, select: { number: true } });
  }
  if (formatKey === "FORMAT_CONTRACT") {
    return getTenantDb().contract.findMany({ where, select: { number: true } });
  }
  if (formatKey === "FORMAT_INVOICE") {
    return getTenantDb().invoice.findMany({ where, select: { number: true } });
  }
  if (formatKey === "FORMAT_RECEIPT") {
    return getTenantDb().payment.findMany({ where, select: { number: true } });
  }

  return [];
}

export async function generateAutoCode(orgId: string, formatKey: string, defaultPrefix: string): Promise<string> {
  const setting = await getTenantDb().setting.findFirst({
    where: { organizationId: orgId, key: formatKey }
  });
  
  const format = parseFormat(setting?.value ?? undefined, defaultPrefix);
  
  let datePart = "";
  const now = new Date();
  if (format.dateFormat === "YYYY") datePart = now.getFullYear().toString();
  if (format.dateFormat === "MMYYYY") datePart = (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();
  if (format.dateFormat === "DDMMYYYY") datePart = now.getDate().toString().padStart(2, "0") + (now.getMonth() + 1).toString().padStart(2, "0") + now.getFullYear().toString();

  const base = `${format.prefix}${datePart ? `${datePart}-` : ""}`;
  const numbers = await existingNumbers(orgId, formatKey, base);
  const maxCounter = numbers.reduce((max, item) => {
    if (!item.number) return max;
    const suffix = item.number.slice(base.length);
    if (!/^\d+$/.test(suffix)) return max;
    if (suffix.length > format.counterLength) return max;
    return Math.max(max, Number(suffix));
  }, 0);
  const counterPart = (maxCounter + 1).toString().padStart(format.counterLength, "0");

  return `${base}${counterPart}`;
}
