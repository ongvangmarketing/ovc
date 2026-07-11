export type AIProviderKey = "openai" | "gemini" | "groq" | "anthropic" | "openrouter" | "azure-openai" | "ollama";
export type AIModelPurpose = "CHAT" | "VISION" | "OCR" | "EMBEDDING" | "CODING" | "DOCUMENT" | "TRANSLATION" | "SPEECH" | "IMAGE";

export interface SecretEnvelope {
  version: 1;
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  ciphertext: string;
}

export interface AIProviderDefinition {
  key: AIProviderKey;
  name: string;
  description: string;
  requiresApiKey: boolean;
  supportsCustomBaseUrl: boolean;
  defaultBaseUrl?: string;
}

export interface AIGatewayRequest {
  organizationId: string;
  userId?: string;
  moduleKey: string;
  purpose: AIModelPurpose;
  agentId?: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutSeconds?: number;
  providerKey?: AIProviderKey;
  modelId?: string;
  allowFallback?: boolean;
}

export interface AIGatewayResponse {
  requestId: string;
  text: string;
  providerKey: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export interface AIDashboardData {
  totals: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    activeAgents: number;
    connectedProviders: number;
  };
  providers: Array<{ id: string; providerKey: string; displayName: string; status: string; isDefault: boolean; updatedAt: Date }>;
  agents: Array<{ id: string; name: string; description: string | null; status: string; modelName: string | null }>;
  prompts: Array<{ id: string; name: string; category: string | null; status: string; currentVersion: number; updatedAt: Date }>;
  recentLogs: Array<{ id: string; moduleKey: string; providerKey: string; modelId: string; status: string; startedAt: Date }>;
}
