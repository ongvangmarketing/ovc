import { AIGatewayService } from "./ai-gateway.service";
import { AIModuleContextService } from "./module-context.service";

export type ContextualAIMode = "AUTO" | "ANALYZE" | "DRAFT" | "PLAN";

function compactContext(value: unknown, maxCharacters = 100_000) {
  const serialized = JSON.stringify(value);
  return serialized.length <= maxCharacters
    ? serialized
    : `${serialized.slice(0, maxCharacters)}\n[Context đã được rút gọn để phù hợp giới hạn token]`;
}

export class ContextualAIService {
  static async ask(input: {
    organizationId: string;
    userId: string;
    prompt: string;
    pathname: string;
    mode?: ContextualAIMode;
  }) {
    const prompt = input.prompt.trim();
    if (prompt.length < 3 || prompt.length > 8_000) throw new Error("Câu hỏi phải từ 3 đến 8.000 ký tự.");
    const pathname = input.pathname.startsWith("/workspace/") ? input.pathname.slice(0, 300) : "/workspace";
    const mode = input.mode ?? "AUTO";
    const modeInstruction = {
      AUTO: "Tự xác định người dùng đang cần truy vấn dữ liệu, phân tích, soạn thảo hay lập kế hoạch và trả lời phù hợp.",
      ANALYZE: "Phân tích dữ liệu được cung cấp, chỉ ra xu hướng, rủi ro, ưu tiên và kết luận có thể hành động.",
      DRAFT: "Tạo nội dung hoàn chỉnh theo yêu cầu. Có thể sáng tạo cách diễn đạt nhưng không được bịa số liệu, tên người hoặc sự kiện.",
      PLAN: "Lập kế hoạch thực thi cụ thể gồm mục tiêu, thứ tự ưu tiên, bước hành động và kết quả mong đợi.",
    }[mode];
    const toolDecision = await AIGatewayService.execute({
      organizationId: input.organizationId,
      userId: input.userId,
      moduleKey: "AI_TOOL_ROUTER",
      purpose: "CHAT",
      temperature: 0,
      maxTokens: 100,
      modelId: "llama-3.1-8b-instant",
      timeoutSeconds: 10,
      prompt: [
        `Câu hỏi: ${prompt}`,
        `Các tool:\n${JSON.stringify(AIModuleContextService.tools)}`,
        "Chọn tối đa 3 tool cần thiết. Nếu là kiến thức chung hoặc sáng tạo không cần dữ liệu nội bộ, chọn rỗng.",
        'Chỉ trả JSON đúng mẫu: {"tools":["query_crm"],"reason":"..."}',
      ].join("\n\n"),
      systemPrompt: "Bạn là bộ định tuyến tool của OVC. Hiểu ý định theo ngữ nghĩa, không dựa vào màn hình hiện tại. Chỉ trả JSON hợp lệ.",
    });
    const jsonText = toolDecision.text.match(/\{[\s\S]*\}/)?.[0];
    let selectedTools: string[] = [];
    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText) as { tools?: unknown };
        if (Array.isArray(parsed.tools)) selectedTools = parsed.tools.filter((item): item is string => typeof item === "string").slice(0, 3);
      } catch {
        selectedTools = [];
      }
    }
    const context = await AIModuleContextService.executeTools(input.organizationId, selectedTools, pathname);
    return AIGatewayService.execute({
      organizationId: input.organizationId,
      userId: input.userId,
      moduleKey: context.moduleKey,
      purpose: "CHAT",
      timeoutSeconds: 25,
      maxTokens: 2048,
      prompt: [
        `Chế độ: ${mode}`,
        `Nguồn dữ liệu được chọn theo câu hỏi: ${context.selectedSources.join(", ")}`,
        `Dữ liệu database do Public Service cung cấp:\n${compactContext(context.data)}`,
        `Câu hỏi của người dùng: ${prompt}`,
      ].join("\n\n"),
      systemPrompt: [
        "Bạn là trợ lý AI tạo sinh của OVC Workspace.",
        modeInstruction,
        "Dữ liệu Public Service là nguồn sự thật cho mọi thông tin liên quan đến tổ chức.",
        "Bạn được phép tạo nội dung mới, phân tích, đề xuất và lập kế hoạch; không được bịa dữ kiện nội bộ không có trong dữ liệu.",
        "Nếu tạo bản nháp, dùng chỗ giữ chỗ rõ ràng cho thông tin còn thiếu.",
        "Không tuyên bố đã tạo, gửi, sửa hoặc xóa dữ liệu.",
        "Trả lời tiếng Việt, rõ ràng, thực dụng và chỉ dùng plain text, không dùng Markdown.",
      ].join(" "),
    });
  }
}
