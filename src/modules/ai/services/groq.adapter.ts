import type { AIProviderAdapter } from "./ai-gateway.service";

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

export const groqAdapter: AIProviderAdapter = {
  async generate(input) {
    if (!input.apiKey) throw new Error("Groq API Key chưa được cấu hình.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutSeconds * 1_000);
    try {
      const baseUrl = (input.baseUrl || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${input.apiKey}`,
          "Content-Type": "application/json",
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
      const payload = await response.json() as GroqResponse;
      if (!response.ok) throw new Error(payload.error?.message || `Groq HTTP ${response.status}`);
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Groq không trả về nội dung.");
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
