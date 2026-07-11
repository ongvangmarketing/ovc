import { Bot, BrainCircuit, Coins, Cpu, KeyRound, Library, Plus, ScrollText, Sparkles, Users, Workflow } from "lucide-react";
import type { AIDashboardData, AIProviderDefinition } from "../types/ai.types";
import { createAIAgentAction, createAIManagedPromptAction, saveAIProviderAction } from "../actions/ai.actions";

function Stat({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 text-xs text-slate-500"><Icon className="h-4 w-4 text-orange-500" />{label}</div>
      <div className="mt-3 text-2xl font-medium tracking-tight text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

export function AIDashboard({ data, catalog }: { data: AIDashboardData; catalog: AIProviderDefinition[] }) {
  return (
    <div className="quote-page mx-auto max-w-[1500px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500"><BrainCircuit className="h-4 w-4 text-orange-500" />AI Platform / Tổng quan</div>
          <h1 className="text-[14px] font-light text-slate-950 dark:text-white">Gateway AI dùng chung cho toàn bộ OVC Workspace.</h1>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">Development · Super Admin</span>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat icon={Sparkles} label="Lượt gọi tháng này" value={data.totals.requests.toLocaleString("vi-VN")} />
        <Stat icon={Cpu} label="Token input" value={data.totals.inputTokens.toLocaleString("vi-VN")} />
        <Stat icon={Cpu} label="Token output" value={data.totals.outputTokens.toLocaleString("vi-VN")} />
        <Stat icon={Coins} label="Chi phí ước tính" value={`$${data.totals.estimatedCost.toFixed(4)}`} />
        <Stat icon={Bot} label="Agent hoạt động" value={String(data.totals.activeAgents)} />
        <Stat icon={KeyRound} label="Provider kết nối" value={String(data.totals.connectedProviders)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="quote-panel">
          <div className="quote-panel-header"><h2><KeyRound className="mr-2 inline h-4 w-4" />AI Provider</h2><span>API key được mã hóa AES-256-GCM trước khi lưu.</span></div>
          <form action={saveAIProviderAction} className="grid gap-4">
            <label><span className="mb-1.5 block text-[15px] font-light">Nhà cung cấp</span>
              <select name="providerKey" className="quote-input">{catalog.map((provider) => <option key={provider.key} value={provider.key}>{provider.name}</option>)}</select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-1.5 block text-[15px] font-light">Tên hiển thị</span><input name="displayName" className="quote-input" placeholder="OpenAI công ty" required /></label>
              <label><span className="mb-1.5 block text-[15px] font-light">Region</span><input name="region" className="quote-input" placeholder="Optional" /></label>
            </div>
            <label><span className="mb-1.5 block text-[15px] font-light">API Key</span><input name="apiKey" type="password" className="quote-input" autoComplete="new-password" placeholder="Chỉ nhập khi tạo hoặc thay khóa" /></label>
            <label><span className="mb-1.5 block text-[15px] font-light">Base URL</span><input name="baseUrl" className="quote-input" placeholder="Dành cho Azure, OpenRouter hoặc Ollama" /></label>
            <button className="quote-action-button quote-action-primary" type="submit"><Plus className="h-4 w-4" />Lưu provider</button>
          </form>
          <div className="mt-5 grid gap-2">
            {data.providers.length ? data.providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                <span><strong>{provider.displayName}</strong><small className="ml-2 text-slate-500">{provider.providerKey}</small></span>
                <span className="text-xs text-slate-500">{provider.status}</span>
              </div>
            )) : <div className="py-6 text-center text-sm text-slate-500">Chưa cấu hình AI Provider.</div>}
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2><Bot className="mr-2 inline h-4 w-4" />AI Agent</h2><span>Tạo trợ lý theo phòng ban và phạm vi dữ liệu.</span></div>
          <form action={createAIAgentAction} className="grid gap-4">
            <label><span className="mb-1.5 block text-[15px] font-light">Tên Agent</span><input name="name" className="quote-input" placeholder="Sales Agent" required /></label>
            <label><span className="mb-1.5 block text-[15px] font-light">Mô tả</span><input name="description" className="quote-input" placeholder="Hỗ trợ đội ngũ kinh doanh" /></label>
            <label><span className="mb-1.5 block text-[15px] font-light">System Prompt</span><textarea name="systemPrompt" className="quote-input min-h-28" required placeholder="Bạn là trợ lý kinh doanh của tổ chức..." /></label>
            <button className="quote-action-button quote-action-primary" type="submit"><Plus className="h-4 w-4" />Tạo Agent</button>
          </form>
          <div className="mt-5 grid gap-2">
            {data.agents.length ? data.agents.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><div className="flex justify-between text-sm"><strong>{agent.name}</strong><span className="text-xs text-slate-500">{agent.status}</span></div><p className="mt-1 text-xs text-slate-500">{agent.description || "Chưa có mô tả"}</p></div>
            )) : <div className="py-6 text-center text-sm text-slate-500">Chưa có AI Agent.</div>}
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2><Library className="mr-2 inline h-4 w-4" />Prompt Library</h2><span>Prompt versioned riêng, không ảnh hưởng AIPrompt legacy.</span></div>
          <form action={createAIManagedPromptAction} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="mb-1.5 block text-[15px] font-light">Tên Prompt</span><input name="name" className="quote-input" placeholder="Phân tích Lead" required /></label>
              <label><span className="mb-1.5 block text-[15px] font-light">Danh mục</span><input name="category" className="quote-input" placeholder="Sales" /></label>
            </div>
            <label><span className="mb-1.5 block text-[15px] font-light">Nội dung</span><textarea name="content" className="quote-input min-h-28" required placeholder="Phân tích lead {{leadName}} dựa trên..." /></label>
            <button className="quote-action-button quote-action-primary" type="submit"><Plus className="h-4 w-4" />Tạo Prompt</button>
          </form>
          <div className="mt-5 grid gap-2">{data.prompts.length ? data.prompts.map((prompt) => <div key={prompt.id} className="flex justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"><span>{prompt.name}<small className="ml-2 text-slate-500">{prompt.category}</small></span><span className="text-xs text-slate-500">v{prompt.currentVersion}</span></div>) : <div className="py-6 text-center text-sm text-slate-500">Prompt Library đang trống.</div>}</div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header"><h2><ScrollText className="mr-2 inline h-4 w-4" />Hạ tầng mở rộng</h2><span>Các capability đã được định vị, triển khai theo worker ở sprint tiếp theo.</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [Workflow, "AI Workflow", "Action plugin cho Workflow Engine"],
              [Library, "Knowledge Base", "Chunking, embedding, vector search và RAG"],
              [Users, "AI Meeting", "Transcription, summary và action items"],
              [BrainCircuit, "AI Vision", "OCR và document extraction"],
            ].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof Workflow;
              return <div key={String(title)} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><ItemIcon className="h-5 w-5 text-orange-500" /><strong className="mt-3 block text-sm">{String(title)}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{String(description)}</p></div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
