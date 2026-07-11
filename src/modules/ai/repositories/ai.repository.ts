import type { Prisma } from "@prisma/client";
import { getTenantDb } from "@/lib/db";

export class AIRepository {
  static db(organizationId: string) {
    return getTenantDb(organizationId);
  }

  static async dashboard(organizationId: string) {
    const db = this.db(organizationId);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return Promise.all([
      db.aIUsageRecord.aggregate({
        where: { organizationId, createdAt: { gte: monthStart } },
        _count: { id: true },
        _sum: { inputTokens: true, outputTokens: true, estimatedCost: true },
      }),
      db.aIAgent.count({ where: { organizationId, status: "ACTIVE" } }),
      db.aIProviderConnection.count({ where: { organizationId, status: "CONNECTED" } }),
      db.aIProviderConnection.findMany({ where: { organizationId }, orderBy: { updatedAt: "desc" } }),
      db.aIAgent.findMany({ where: { organizationId }, include: { model: { select: { displayName: true } } }, orderBy: { updatedAt: "desc" }, take: 8 }),
      db.aIManagedPrompt.findMany({ where: { organizationId }, orderBy: { updatedAt: "desc" }, take: 8 }),
      db.aIRequestLog.findMany({ where: { organizationId }, orderBy: { startedAt: "desc" }, take: 10 }),
    ]);
  }

  static saveProvider(organizationId: string, input: {
    providerKey: string;
    displayName: string;
    encryptedApiKey?: Prisma.InputJsonValue;
    baseUrl?: string;
    region?: string;
    createdById: string;
  }) {
    return this.db(organizationId).aIProviderConnection.upsert({
      where: { organizationId_providerKey: { organizationId, providerKey: input.providerKey } },
      create: { organizationId, ...input, status: "CONFIGURED" },
      update: {
        displayName: input.displayName,
        encryptedApiKey: input.encryptedApiKey,
        baseUrl: input.baseUrl,
        region: input.region,
        status: "CONFIGURED",
        lastError: null,
      },
    });
  }

  static createAgent(organizationId: string, input: {
    name: string; description?: string; systemPrompt: string; createdById: string;
  }) {
    return this.db(organizationId).aIAgent.create({ data: { organizationId, ...input } });
  }

  static createPrompt(organizationId: string, input: {
    name: string; category?: string; content: string; createdById: string;
  }) {
    return this.db(organizationId).$transaction(async (tx) => {
      const prompt = await tx.aIManagedPrompt.create({
        data: { organizationId, name: input.name, category: input.category, createdById: input.createdById },
      });
      await tx.aIManagedPromptVersion.create({
        data: { organizationId, promptId: prompt.id, version: 1, content: input.content, createdById: input.createdById },
      });
      return prompt;
    });
  }
}
