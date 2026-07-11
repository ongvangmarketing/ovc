import type { AIProviderAdapter } from "./ai-gateway.service";

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  error?: { message?: string };
};

function retryDelay(message: string | undefined, attempt: number) {
  const milliseconds = message?.match(/retry in ([\d.]+)ms/i)?.[1];
  if (milliseconds) return Math.min(Math.ceil(Number(milliseconds)) + 250, 1_500);
  const seconds = message?.match(/retry in ([\d.]+)s/i)?.[1];
  if (seconds) return Math.min(Math.ceil(Number(seconds) * 1_000) + 250, 1_500);
  return Math.min(750 * (attempt + 1), 1_500);
}

export const geminiAdapter: AIProviderAdapter = {
  async generate(input) {
    if (!input.apiKey) throw new Error("Gemini API Key chưa được cấu hình.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutSeconds * 1_000);
    try {
      const baseUrl = (input.baseUrl || "https://generativelanguage.googleapis.com").replace(/\/+$/, "");
      const model = input.modelId.replace(/^models\//, "");
      let payload: GeminiResponse | undefined;
      let responseStatus = 500;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const response = await fetch(`${baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": input.apiKey },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: input.systemPrompt ? { parts: [{ text: input.systemPrompt }] } : undefined,
            contents: [{ role: "user", parts: [{ text: input.prompt }] }],
            generationConfig: { temperature: input.temperature, maxOutputTokens: input.maxTokens },
          }),
        });
        responseStatus = response.status;
        payload = await response.json() as GeminiResponse;
        if (response.ok) break;
        if (response.status !== 429 || attempt === 1) {
          if (response.status === 429) {
            throw new Error("Gemini đã hết hoặc vượt giới hạn quota hiện tại. Vui lòng kiểm tra Billing/Rate limits hoặc thử lại sau.");
          }
          throw new Error(payload.error?.message || `Gemini HTTP ${response.status}`);
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay(payload?.error?.message, attempt)));
      }
      if (!payload || responseStatus >= 400) throw new Error(`Gemini HTTP ${responseStatus}`);
      if (payload.promptFeedback?.blockReason) throw new Error(`Gemini chặn prompt: ${payload.promptFeedback.blockReason}`);
      const text = payload.candidates?.flatMap((candidate) => candidate.content?.parts ?? []).map((part) => part.text || "").join("").trim();
      if (!text) throw new Error("Gemini không trả về nội dung.");
      return {
        text,
        inputTokens: payload.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: payload.usageMetadata?.candidatesTokenCount ?? 0,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
