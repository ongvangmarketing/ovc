import { randomUUID } from "node:crypto";
import { getTenantDb } from "@/lib/db";
import type { AIGatewayRequest, AIGatewayResponse, SecretEnvelope } from "../types/ai.types";
import { AIEncryptionService } from "./encryption.service";
import { geminiAdapter } from "./gemini.adapter";
import { groqAdapter } from "./groq.adapter";
import { openRouterAdapter } from "./openrouter.adapter";

export interface AIProviderAdapter {
  generate(input: {
    apiKey?: string;
    baseUrl?: string;
    modelId: string;
    prompt: string;
    systemPrompt?: string;
    temperature: number;
    maxTokens: number;
    timeoutSeconds: number;
  }): Promise<{ text: string; inputTokens: number; outputTokens: number }>;
}

const adapters = new Map<string, AIProviderAdapter>();
const geminiCooldowns = new Map<string, number>();

export class AIGatewayService {
  static registerProvider(providerKey: string, adapter: AIProviderAdapter) {
    adapters.set(providerKey, adapter);
  }

  static async execute(request: AIGatewayRequest): Promise<AIGatewayResponse> {
    if (!adapters.has("gemini")) adapters.set("gemini", geminiAdapter);
    if (!adapters.has("groq")) adapters.set("groq", groqAdapter);
    if (!adapters.has("openrouter")) adapters.set("openrouter", openRouterAdapter);
    const db = getTenantDb(request.organizationId);
    const [settings, openRouter] = await Promise.all([
      db.aIOrganizationSettings.findUnique({ where: { organizationId: request.organizationId } }),
      request.providerKey ? null : db.aIProviderConnection.findFirst({
        where: { organizationId: request.organizationId, providerKey: "openrouter", status: { in: ["CONFIGURED", "CONNECTED"] } },
        select: { id: true },
      }),
    ]);
    const geminiCoolingDown = (geminiCooldowns.get(request.organizationId) ?? 0) > Date.now();
    const preferredProviderKey = request.providerKey
      ?? (openRouter ? "openrouter" : geminiCoolingDown ? "groq" : settings?.defaultProviderKey ?? undefined);
    const provider = await db.aIProviderConnection.findFirst({
      where: {
        organizationId: request.organizationId,
        status: { in: ["CONFIGURED", "CONNECTED"] },
        ...(preferredProviderKey ? { providerKey: preferredProviderKey } : { isDefault: true }),
      },
      include: { models: { where: { enabled: true }, orderBy: { isDefault: "desc" } } },
    });
    if (!provider) throw new Error("Tổ chức chưa cấu hình AI Provider.");

    const model = (request.modelId ? provider.models.find((item) => item.modelId === request.modelId) : undefined)
      ?? provider.models.find((item) => item.purposes.includes(request.purpose))
      ?? provider.models[0];
    if (!model) throw new Error("Provider chưa có model phù hợp.");

    const adapter = adapters.get(provider.providerKey);
    if (!adapter) throw new Error(`Provider adapter chưa được đăng ký: ${provider.providerKey}`);

    const requestId = randomUUID();
    const startedAt = Date.now();
    await db.aIRequestLog.create({
      data: {
        organizationId: request.organizationId,
        requestId,
        userId: request.userId,
        moduleKey: request.moduleKey,
        agentId: request.agentId,
        providerKey: provider.providerKey,
        modelId: model.modelId,
        promptPreview: request.prompt.slice(0, 500),
        status: "RUNNING",
      },
    });

    try {
      const result = await adapter.generate({
        apiKey: provider.encryptedApiKey
          ? AIEncryptionService.decrypt(provider.encryptedApiKey as unknown as SecretEnvelope)
          : undefined,
        baseUrl: provider.baseUrl ?? undefined,
        modelId: model.modelId,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        temperature: request.temperature ?? settings?.temperature ?? 0.7,
        maxTokens: request.maxTokens ?? settings?.maxTokens ?? 2048,
        timeoutSeconds: request.timeoutSeconds ?? settings?.timeoutSeconds ?? 60,
      });
      const durationMs = Date.now() - startedAt;
      await db.$transaction([
        db.aIRequestLog.update({ where: { requestId }, data: { status: "SUCCEEDED", responsePreview: result.text.slice(0, 500), finishedAt: new Date() } }),
        db.aIUsageRecord.create({
          data: {
            organizationId: request.organizationId,
            userId: request.userId,
            moduleKey: request.moduleKey,
            agentId: request.agentId,
            providerKey: provider.providerKey,
            modelId: model.modelId,
            purpose: request.purpose,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            durationMs,
            status: "SUCCEEDED",
          },
        }),
      ]);
      return { requestId, ...result, providerKey: provider.providerKey, modelId: model.modelId, durationMs };
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      await db.aIRequestLog.update({ where: { requestId }, data: { status: "FAILED", errorMessage: message.slice(0, 1_000), finishedAt: new Date() } });
      const shouldFallback = request.allowFallback !== false
        && /quota|rate limit|too many requests|giới hạn/i.test(message);
      if (shouldFallback) {
        if (provider.providerKey === "gemini") {
          geminiCooldowns.set(request.organizationId, Date.now() + 15 * 60 * 1_000);
        }
        const fallbackProviderKey = provider.providerKey === "openrouter" ? "groq" : "gemini";
        const fallback = await db.aIProviderConnection.findFirst({
          where: { organizationId: request.organizationId, providerKey: fallbackProviderKey, status: { in: ["CONFIGURED", "CONNECTED"] } },
          select: { id: true },
        });
        if (fallback) {
          return this.execute({ ...request, providerKey: fallbackProviderKey, allowFallback: false });
        }
      }
      throw error;
    }
  }
}
