import type { AIProviderAdapter } from "./ai-gateway.service";

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

export const openRouterAdapter: AIProviderAdapter = {
  async generate(input) {
    if (!input.apiKey) throw new Error("OpenRouter API Key chưa được cấu hình.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutSeconds * 1_000);
    try {
      const configuredBaseUrl = (input.baseUrl || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
      const baseUrl = configuredBaseUrl.endsWith("/api") ? `${configuredBaseUrl}/v1` : configuredBaseUrl;
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "OVC Workspace",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: input.modelId,
          messages: [
            ...(input.systemPrompt ? [{ role: "system", content: input.systemPrompt }] : []),
            { role: "user", content: input.prompt },
          ],
          temperature: input.temperature,
          max_tokens: input.maxTokens,
        }),
      });
      const responseText = await response.text();
      let payload: OpenRouterResponse;
      try {
        payload = JSON.parse(responseText) as OpenRouterResponse;
      } catch {
        throw new Error(`OpenRouter trả về phản hồi không hợp lệ (HTTP ${response.status}).`);
      }
      if (!response.ok) throw new Error(payload.error?.message || `OpenRouter HTTP ${response.status}`);
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("OpenRouter không trả về nội dung.");
      return {
        text,
        inputTokens: payload.usage?.prompt_tokens ?? 0,
        outputTokens: payload.usage?.completion_tokens ?? 0,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
