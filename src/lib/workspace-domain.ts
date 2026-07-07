import { db } from "@/lib/db";

type WorkspaceDomainConfig = {
  domain?: string;
  target?: "portal" | "homepage" | "marketing" | "training" | "app";
  status?: "pending" | "dns_verified" | "ssl_pending" | "active" | "failed";
  sslStatus?: "pending" | "issued" | "failed";
};

function fallbackAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function parseDomains(value?: string | null): WorkspaceDomainConfig[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function usableDomain(domain: WorkspaceDomainConfig) {
  return Boolean(
    domain.domain &&
      ["active", "ssl_pending", "dns_verified"].includes(domain.status || "") &&
      domain.status !== "failed",
  );
}

export async function getOrganizationPublicBaseUrl(
  organizationId: string,
  target: "portal" | "homepage" | "marketing" | "training" | "app" = "portal",
) {
  const setting = await db.setting.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key: "workspace_custom_domains",
      },
    },
  });

  const domains = parseDomains(setting?.value).filter(usableDomain);
  const preferred =
    domains.find((domain) => domain.target === target && domain.sslStatus === "issued") ||
    domains.find((domain) => domain.target === target) ||
    domains.find((domain) => domain.target === "app" && domain.sslStatus === "issued") ||
    domains.find((domain) => domain.target === "app") ||
    domains[0];

  return preferred?.domain ? `https://${preferred.domain}` : fallbackAppUrl();
}
