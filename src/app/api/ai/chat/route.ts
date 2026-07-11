import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AIService } from "@/modules/ai/services/ai.service";
import { ContextualAIService, type ContextualAIMode } from "@/modules/ai/services/contextual-ai.service";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    AIService.assertDevelopmentAccess(session.user.role);
    const body = await request.json() as { prompt?: string; pathname?: string; mode?: ContextualAIMode };
    const result = await ContextualAIService.ask({
      organizationId: session.organizationId,
      userId: session.userId,
      prompt: String(body.prompt || ""),
      pathname: String(body.pathname || "/workspace"),
      mode: body.mode,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI chưa thể xử lý yêu cầu." },
      { status: 400 },
    );
  }
}
