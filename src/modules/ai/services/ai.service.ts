import type { Prisma } from "@prisma/client";
import { AIRepository } from "../repositories/ai.repository";
import { AIEncryptionService } from "./encryption.service";
import { AIProviderRegistry } from "./provider.registry";
import type { AIDashboardData } from "../types/ai.types";

export class AIService {
  static assertDevelopmentAccess(role?: string | null) {
    if (role !== "SUPER_ADMIN") throw new Error("AI Module đang Development và chỉ dành cho Super Admin.");
  }

  static async dashboard(organizationId: string): Promise<AIDashboardData> {
    const [usage, activeAgents, connectedProviders, providers, agents, prompts, recentLogs] = await AIRepository.dashboard(organizationId);
    return {
      totals: {
        requests: usage._count.id,
        inputTokens: usage._sum.inputTokens ?? 0,
        outputTokens: usage._sum.outputTokens ?? 0,
        estimatedCost: Number(usage._sum.estimatedCost ?? 0),
        activeAgents,
        connectedProviders,
      },
      providers,
      agents: agents.map((agent) => ({ id: agent.id, name: agent.name, description: agent.description, status: agent.status, modelName: agent.model?.displayName ?? null })),
      prompts,
      recentLogs,
    };
  }

  static providerCatalog() {
    return AIProviderRegistry.list();
  }

  static saveProvider(organizationId: string, userId: string, input: {
    providerKey: string; displayName: string; apiKey?: string; baseUrl?: string; region?: string;
  }) {
    const definition = AIProviderRegistry.assert(input.providerKey);
    if (definition.requiresApiKey && !input.apiKey) throw new Error("API Key là bắt buộc cho provider này.");
    return AIRepository.saveProvider(organizationId, {
      providerKey: definition.key,
      displayName: input.displayName || definition.name,
      encryptedApiKey: input.apiKey ? AIEncryptionService.encrypt(input.apiKey) as unknown as Prisma.InputJsonValue : undefined,
      baseUrl: input.baseUrl || definition.defaultBaseUrl,
      region: input.region,
      createdById: userId,
    }).then(async (provider) => {
      if (definition.key === "gemini") {
        const db = AIRepository.db(organizationId);
        await Promise.all([
          db.aIModelConfig.upsert({
            where: { organizationId_providerId_modelId: { organizationId, providerId: provider.id, modelId: "gemini-3.5-flash" } },
            create: {
              organizationId,
              providerId: provider.id,
              modelId: "gemini-3.5-flash",
              displayName: "Gemini 3.5 Flash",
              capabilities: ["CHAT", "VISION", "DOCUMENT", "TRANSLATION"],
              purposes: ["CHAT", "VISION", "DOCUMENT", "TRANSLATION"],
              isDefault: true,
            },
            update: { enabled: true, isDefault: true },
          }),
          db.aIProviderConnection.updateMany({
            where: { organizationId, id: { not: provider.id } },
            data: { isDefault: false },
          }),
          db.aIProviderConnection.update({ where: { id: provider.id }, data: { isDefault: true } }),
        ]);
      } else if (definition.key === "groq") {
        const db = AIRepository.db(organizationId);
        await Promise.all([
          db.aIModelConfig.upsert({
            where: { organizationId_providerId_modelId: { organizationId, providerId: provider.id, modelId: "llama-3.3-70b-versatile" } },
            create: {
              organizationId,
              providerId: provider.id,
              modelId: "llama-3.3-70b-versatile",
              displayName: "Llama 3.3 70B Versatile",
              capabilities: ["CHAT", "DOCUMENT", "TRANSLATION"],
              purposes: ["CHAT", "DOCUMENT", "TRANSLATION"],
              isDefault: true,
            },
            update: { enabled: true, isDefault: true },
          }),
          db.aIModelConfig.upsert({
            where: { organizationId_providerId_modelId: { organizationId, providerId: provider.id, modelId: "llama-3.1-8b-instant" } },
            create: {
              organizationId,
              providerId: provider.id,
              modelId: "llama-3.1-8b-instant",
              displayName: "Llama 3.1 8B Instant",
              capabilities: ["CHAT"],
              purposes: ["CHAT"],
            },
            update: { enabled: true },
          }),
        ]);
      } else if (definition.key === "openrouter") {
        const db = AIRepository.db(organizationId);
        await db.aIModelConfig.upsert({
          where: { organizationId_providerId_modelId: { organizationId, providerId: provider.id, modelId: "openrouter/free" } },
          create: {
            organizationId,
            providerId: provider.id,
            modelId: "openrouter/free",
            displayName: "OpenRouter Free Router",
            capabilities: ["CHAT", "DOCUMENT", "TRANSLATION"],
            purposes: ["CHAT", "DOCUMENT", "TRANSLATION"],
            isDefault: true,
          },
          update: { enabled: true, isDefault: true },
        });
      }
      return provider;
    });
  }

  static createAgent(organizationId: string, userId: string, input: { name: string; description?: string; systemPrompt: string }) {
    if (input.name.trim().length < 2 || input.systemPrompt.trim().length < 10) throw new Error("Tên và system prompt chưa hợp lệ.");
    return AIRepository.createAgent(organizationId, { ...input, createdById: userId });
  }

  static createPrompt(organizationId: string, userId: string, input: { name: string; category?: string; content: string }) {
    if (input.name.trim().length < 2 || input.content.trim().length < 10) throw new Error("Tên và nội dung prompt chưa hợp lệ.");
    return AIRepository.createPrompt(organizationId, { ...input, createdById: userId });
  }
}
