import { CrmDashboardService } from "@/modules/crm/services/dashboard.service";
import { LeadService } from "@/modules/leads/services/lead.service";
import { TravelingService } from "@/modules/traveling/services/traveling.service";
import { FinanceService } from "@/modules/finance/services/finance.service";
import { ProjectService } from "@/modules/projects/services/project.service";
import { TrainingService } from "@/modules/training/services/training.service";
import { WorkspaceAIContextService } from "@/modules/core/services/workspace-ai-context.service";

const sensitiveKeys = new Set(["password", "token", "apikey", "secret", "encryptedapikey", "customfields"]);

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !sensitiveKeys.has(key.toLowerCase()))
        .map(([key, item]) => [key, sanitize(item, depth + 1)]),
    );
  }
  if (typeof value === "string") return value.slice(0, 5_000);
  return value;
}

export class AIModuleContextService {
  static readonly tools = [
    { name: "query_workspace", description: "Tổng quan toàn tổ chức: công việc, dự án, khách hàng, hóa đơn và thanh toán gần đây." },
    { name: "query_crm", description: "Khách hàng, liên hệ, cơ hội bán hàng và lịch chăm sóc CRM." },
    { name: "query_leads", description: "Lead, nguồn lead, trạng thái và nhóm lead cần xử lý." },
    { name: "query_finance", description: "Hóa đơn, công nợ, hợp đồng, báo giá và thanh toán." },
    { name: "query_projects", description: "Dự án, task, tiến độ, deadline và công việc quá hạn." },
    { name: "query_training", description: "Khóa học, lớp, học viên, giảng viên và học phí." },
    { name: "query_traveling", description: "Khách sạn, tour, booking, xe và dịch vụ du lịch." },
  ] as const;

  private static async load(organizationId: string, moduleKey: string, pathname = "/workspace") {
    const segments = pathname.split("/").filter(Boolean);
    if (moduleKey === "workspace") return WorkspaceAIContextService.getAIContext(organizationId);
    if (moduleKey === "crm") {
      const [dashboard, operationalContext] = await Promise.all([
        CrmDashboardService.getDashboardData(organizationId),
        CrmDashboardService.getAIContext(organizationId),
      ]);
      return { dashboard, operationalContext };
    }
    if (moduleKey === "leads") {
      const result = await LeadService.getLeadsForDashboard(organizationId, "", "ALL", 1, 50);
      return { ...result, leads: result.leads.slice(0, 50) };
    }
    if (moduleKey === "traveling") return TravelingService.getDashboardStats(organizationId);
    if (moduleKey === "finance") {
      const [invoices, contracts, quotations, payments] = await Promise.all([
        FinanceService.getInvoices(),
        FinanceService.getContracts(),
        FinanceService.getQuotations(),
        FinanceService.getPayments(),
      ]);
      return {
        counts: { invoices: invoices.length, contracts: contracts.length, quotations: quotations.length, payments: payments.length },
        invoices: invoices.slice(0, 50),
        contracts: contracts.slice(0, 50),
        quotations: quotations.slice(0, 50),
        payments: payments.slice(0, 50),
      };
    }
    if (moduleKey === "projects") {
      const projectId = segments[1] === "projects" && segments[2] && !["tasks", "new"].includes(segments[2])
        ? segments[2]
        : undefined;
      return ProjectService.getAIContext(projectId);
    }
    if (moduleKey === "training") return TrainingService.getTrainingOverview();
    return {};
  }

  static async executeTools(organizationId: string, toolNames: string[], pathname: string) {
    const toolToModule: Record<string, string> = {
      query_workspace: "workspace",
      query_crm: "crm",
      query_leads: "leads",
      query_finance: "finance",
      query_projects: "projects",
      query_training: "training",
      query_traveling: "traveling",
    };
    const intents = [...new Set(toolNames.map((name) => toolToModule[name]).filter((name): name is string => Boolean(name)))];
    const entries = await Promise.all(
      intents.map(async (moduleKey) => [moduleKey, await this.load(organizationId, moduleKey, pathname)] as const),
    );
    return {
      moduleKey: intents.map((item) => item.toUpperCase()).join("+") || "GENERAL",
      data: sanitize(Object.fromEntries(entries)),
      selectedSources: intents,
      generatedAt: new Date().toISOString(),
    };
  }

  static async resolve(organizationId: string, pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const moduleKey = segments[1] || "workspace";
    const resolvedModule = ["myworks", "dashboard", "workspace"].includes(moduleKey)
      ? "workspace"
      : moduleKey === "courses" ? "training" : moduleKey;
    const data = await this.load(organizationId, resolvedModule, pathname);

    return {
      moduleKey: moduleKey.toUpperCase(),
      pathname,
      data: sanitize(data),
      generatedAt: new Date().toISOString(),
    };
  }
}
