"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Globe2, Loader2, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

import {
  activateWorkspaceDomain,
  checkWorkspaceDomain,
  createWorkspaceDomain,
  removeWorkspaceDomain,
  type WorkspaceDomainConfig,
} from "@/app/actions/settings";
import { SelectBox } from "@/components/ui/select-box";

const targetOptions = [
  { value: "marketing", label: "Website marketing" },
  { value: "training", label: "Website đào tạo" },
  { value: "homepage", label: "Homepage công ty (cũ)" },
  { value: "app", label: "Ứng dụng workspace" },
  { value: "portal", label: "Portal khách hàng" },
] as const;

const statusMeta: Record<WorkspaceDomainConfig["status"], { label: string; className: string }> = {
  pending: { label: "Chờ DNS", className: "bg-orange-50 text-orange-700" },
  dns_verified: { label: "DNS đúng", className: "bg-blue-50 text-blue-700" },
  ssl_pending: { label: "Đang cấp SSL", className: "bg-violet-50 text-violet-700" },
  active: { label: "Đang hoạt động", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Cần kiểm tra", className: "bg-red-50 text-red-700" },
};

export function DomainSettingsClient({
  initialDomains,
  enableSubdomainBuilder = false,
  subdomainSuffix = ".app.ovc.vn",
  defaultTarget = "marketing",
}: {
  initialDomains: WorkspaceDomainConfig[];
  enableSubdomainBuilder?: boolean;
  subdomainSuffix?: string;
  defaultTarget?: WorkspaceDomainConfig["target"];
}) {
  const router = useRouter();
  const [domains, setDomains] = useState(initialDomains);
  const [domain, setDomain] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [target, setTarget] = useState<WorkspaceDomainConfig["target"]>(defaultTarget);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function addDomain() {
    setIsAdding(true);
    try {
      const payloadDomain = enableSubdomainBuilder && subdomain.trim()
        ? `${subdomain.trim()}${subdomainSuffix}`
        : domain.trim();

      const result = await createWorkspaceDomain({ domain: payloadDomain, target });
      setDomains((current) => [result.domain, ...current]);
      setDomain("");
      setSubdomain("");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể thêm tên miền.");
    } finally {
      setIsAdding(false);
    }
  }

  async function checkDomain(item: WorkspaceDomainConfig) {
    setBusyId(item.id);
    try {
      const result = await checkWorkspaceDomain(item.id);
      setDomains((current) => current.map((domainItem) => domainItem.id === item.id ? result.domain : domainItem));
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể kiểm tra DNS.");
    } finally {
      setBusyId(null);
    }
  }

  async function activateDomain(item: WorkspaceDomainConfig) {
    setBusyId(item.id);
    try {
      const result = await activateWorkspaceDomain(item.id);
      setDomains((current) => current.map((domainItem) => domainItem.id === item.id ? result.domain : domainItem));
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể cấp SSL tự động.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeDomain(item: WorkspaceDomainConfig) {
    if (!window.confirm(`Xóa tên miền ${item.domain}?`)) return;
    setBusyId(item.id);
    try {
      await removeWorkspaceDomain(item.id);
      setDomains((current) => current.filter((domainItem) => domainItem.id !== item.id));
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể xóa tên miền.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Globe2 className="h-4 w-4 text-orange-500" />
            Cài đặt / Tên miền
          </div>
          <h1 className="text-[14px] font-light text-slate-950">Tên miền công ty</h1>
        </div>

        <button type="button" onClick={() => router.back()} className="quote-action-button quote-action-secondary">
          Quay lại
        </button>
      </div>

      <div className="space-y-5">
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Thêm tên miền</h2>
            <span>Mỗi tên miền được gắn riêng với workspace hiện tại.</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            {enableSubdomainBuilder ? (
              <label className="block">
                <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên miền phụ hệ thống</span>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <input
                    value={subdomain}
                    onChange={(event) => setSubdomain(event.target.value)}
                    className="flex-1 border-0 p-3 text-sm outline-none"
                    placeholder="ten-cong-ty"
                  />
                  <span className="inline-flex items-center px-3 bg-slate-100 text-sm text-slate-500">{subdomainSuffix}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Tên miền phụ miễn phí được tạo tự động.</p>
              </label>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên miền</span>
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  className="quote-input"
                  placeholder="ongvang.com.vn"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Dùng cho</span>
              <SelectBox
                ariaLabel="Dùng tên miền cho"
                value={target}
                onChange={(value) => setTarget(value as WorkspaceDomainConfig["target"])}
                options={[...targetOptions]}
                className="h-[42px] w-full rounded-lg border-slate-200 text-[15px] font-light"
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addDomain}
                disabled={isAdding || (!domain.trim() && !subdomain.trim())}
                className="quote-action-button quote-action-primary w-full"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Thêm
              </button>
            </div>
          </div>
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Domain đã cấu hình</h2>
            <span>TXT dùng để xác minh workspace, A record dùng để trỏ domain về app.</span>
          </div>

          <div>
            {domains.length ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[980px] border-collapse bg-white text-left">
                  <thead className="bg-slate-50 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tên miền</th>
                      <th className="px-4 py-3">Dùng cho</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">SSL</th>
                      <th className="px-4 py-3">Kiểm tra</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {domains.map((item) => (
                      <DomainRows
                        key={item.id}
                        item={item}
                        busy={busyId === item.id}
                        expanded={expandedId === item.id}
                        onToggleDetails={() => setExpandedId((current) => current === item.id ? null : item.id)}
                        onCheck={() => checkDomain(item)}
                        onActivate={() => activateDomain(item)}
                        onRemove={() => removeDomain(item)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {!domains.length ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-light text-slate-500">
                Chưa có tên miền nào. Thêm domain marketing, đào tạo hoặc workspace để bắt đầu.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function DomainRows({
  item,
  busy,
  expanded,
  onToggleDetails,
  onCheck,
  onActivate,
  onRemove,
}: {
  item: WorkspaceDomainConfig;
  busy: boolean;
  expanded: boolean;
  onToggleDetails: () => void;
  onCheck: () => void;
  onActivate: () => void;
  onRemove: () => void;
}) {
  const meta = statusMeta[item.status];
  const targetLabel = targetOptions.find((option) => option.value === item.target)?.label || item.target;

  return (
    <>
      <tr className="align-top text-[14px] text-slate-700">
        <td className="px-4 py-3">
          <div className="break-all font-semibold text-slate-950">{item.domain}</div>
          {item.lastError ? <p className="mt-1 max-w-[320px] text-xs text-red-600">{item.lastError}</p> : null}
        </td>
        <td className="px-4 py-3">{targetLabel}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
        </td>
        <td className="px-4 py-3">
          {item.sslStatus === "issued" ? "Đã cấp tự động" : item.sslStatus === "failed" ? "Lỗi SSL" : "Chờ cấp tự động"}
        </td>
        <td className="px-4 py-3 text-slate-500">
          {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleString("vi-VN") : "Chưa kiểm tra"}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onToggleDetails} className="quote-action-button quote-action-secondary h-9 px-3">
              <Copy className="h-4 w-4" />
              DNS
            </button>
            <button type="button" onClick={onCheck} disabled={busy} className="quote-action-button quote-action-secondary h-9 px-3">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Kiểm tra
            </button>
            <button type="button" onClick={onActivate} disabled={busy || !["dns_verified", "ssl_pending", "active"].includes(item.status)} className="quote-action-button quote-action-primary h-9 px-3">
              <ShieldCheck className="h-4 w-4" />
              Tự cấp SSL
            </button>
            <button type="button" onClick={onRemove} disabled={busy} className="quote-action-button quote-action-secondary h-9 px-3">
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-slate-50/70">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <DnsRecord label="TXT xác minh" name={item.verificationName} value={item.verificationValue} />
              <DnsRecord label="A record trỏ về app" name={item.domain} value={item.aRecordTarget} />
            </div>

            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Khi TXT và A record đúng, app giữ nguyên domain khách trong toàn bộ phiên và tự kích hoạt SSL.
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function DnsRecord({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 space-y-2">
        <CopyLine label="Name" value={name} />
        <CopyLine label="Value" value={value} />
      </div>
    </div>
  );
}

function CopyLine({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="grid gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      <button
        type="button"
        onClick={copy}
        className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-sm text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
        title={`Copy ${label}`}
      >
        <span className="min-w-0 break-all">{value}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-orange-600">
          {copied ? "Đã copy" : null}
          <Copy className="h-4 w-4 text-slate-400" />
        </span>
      </button>
    </div>
  );
}
