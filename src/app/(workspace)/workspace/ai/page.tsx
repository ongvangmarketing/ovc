import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { AIDashboard } from "@/modules/ai/components/ai-dashboard";
import { AIService } from "@/modules/ai/services/ai.service";

export const metadata: Metadata = { title: "AI Platform" };

export default async function AIPlatformPage() {
  const session = await requireAuth();
  AIService.assertDevelopmentAccess(session.user.role);
  const data = await AIService.dashboard(session.organizationId);
  return <AIDashboard data={data} catalog={AIService.providerCatalog()} />;
}
