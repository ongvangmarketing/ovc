import type { AIProviderDefinition, AIProviderKey } from "../types/ai.types";

const providers: AIProviderDefinition[] = [
  { key: "openai", name: "OpenAI", description: "Chat, vision, reasoning, embedding và image.", requiresApiKey: true, supportsCustomBaseUrl: false, defaultBaseUrl: "https://api.openai.com" },
  { key: "gemini", name: "Google Gemini", description: "Multimodal, long context và embedding.", requiresApiKey: true, supportsCustomBaseUrl: false },
  { key: "groq", name: "Groq", description: "Provider tốc độ cao, dùng làm fallback khi Gemini hết quota.", requiresApiKey: true, supportsCustomBaseUrl: false, defaultBaseUrl: "https://api.groq.com/openai/v1" },
  { key: "anthropic", name: "Anthropic Claude", description: "Reasoning và document analysis.", requiresApiKey: true, supportsCustomBaseUrl: false },
  { key: "openrouter", name: "OpenRouter", description: "Gateway truy cập nhiều model.", requiresApiKey: true, supportsCustomBaseUrl: true, defaultBaseUrl: "https://openrouter.ai/api/v1" },
  { key: "azure-openai", name: "Azure OpenAI", description: "OpenAI models qua Azure deployment.", requiresApiKey: true, supportsCustomBaseUrl: true },
  { key: "ollama", name: "Ollama", description: "Model self-hosted trong hạ tầng doanh nghiệp.", requiresApiKey: false, supportsCustomBaseUrl: true, defaultBaseUrl: "http://localhost:11434" },
];

export class AIProviderRegistry {
  static list() {
    return providers;
  }

  static get(key: string) {
    return providers.find((provider) => provider.key === key);
  }

  static assert(key: string): AIProviderDefinition {
    const provider = this.get(key as AIProviderKey);
    if (!provider) throw new Error(`AI Provider chưa được hỗ trợ: ${key}`);
    return provider;
  }
}
