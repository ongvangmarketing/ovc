"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { AIService } from "../services/ai.service";
import { AIGatewayService } from "../services/ai-gateway.service";
import { ContextualAIService } from "../services/contextual-ai.service";

function value(formData: FormData, key: string) {
  const result = String(formData.get(key) || "").trim();
  return result || undefined;
}

export async function saveAIProviderAction(formData: FormData) {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  await AIService.saveProvider(session.organizationId, session.userId, {
    providerKey: String(formData.get("providerKey") || ""),
    displayName: String(formData.get("displayName") || ""),
    apiKey: value(formData, "apiKey"),
    baseUrl: value(formData, "baseUrl"),
    region: value(formData, "region"),
  });
  revalidatePath("/workspace/ai");
}

export async function createAIAgentAction(formData: FormData) {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  await AIService.createAgent(session.organizationId, session.userId, {
    name: String(formData.get("name") || ""),
    description: value(formData, "description"),
    systemPrompt: String(formData.get("systemPrompt") || ""),
  });
  revalidatePath("/workspace/ai");
}

export async function createAIManagedPromptAction(formData: FormData) {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  await AIService.createPrompt(session.organizationId, session.userId, {
    name: String(formData.get("name") || ""),
    category: value(formData, "category"),
    content: String(formData.get("content") || ""),
  });
  revalidatePath("/workspace/ai");
}

export async function askAIAction(prompt: string) {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  const normalized = prompt.trim();
  if (normalized.length < 3 || normalized.length > 8_000) throw new Error("Câu hỏi phải từ 3 đến 8.000 ký tự.");
  return AIGatewayService.execute({
    organizationId: session.organizationId,
    userId: session.userId,
    moduleKey: "WORKSPACE",
    purpose: "CHAT",
    prompt: normalized,
    systemPrompt: "Bạn là trợ lý AI của OVC Workspace. Trả lời ngắn gọn, rõ ràng, tập trung vào trọng tâm và ưu tiên tiếng Việt.",
  });
}

export async function askContextualAIAction(input: {
  prompt: string;
  pathname: string;
  pageTitle?: string;
  mode?: "AUTO" | "ANALYZE" | "DRAFT" | "PLAN";
}) {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  return ContextualAIService.ask({
    organizationId: session.organizationId,
    userId: session.userId,
    prompt: input.prompt,
    pathname: input.pathname,
    mode: input.mode,
  });
}
