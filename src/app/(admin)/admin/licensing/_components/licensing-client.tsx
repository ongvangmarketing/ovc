"use client";

import { useState } from "react";
import { KeyRound, Plus, Copy, CheckCircle2, Ticket, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type LicenseKey = {
  id: string;
  code: string;
  plan: string;
  duration: string;
  status: "UNUSED" | "USED" | "EXPIRED";
  createdAt: Date;
};

export function LicensingClient({ plans, modules }: { plans: any[]; modules: any[] }) {
  const [keys, setKeys] = useState<LicenseKey[]>([
    {
      id: "1",
      code: "OVC-PRO-2A3B9C",
      plan: "workspace-pro",
      duration: "1 Năm",
      status: "UNUSED",
      createdAt: new Date(),
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Form State
  const [selectedPlan, setSelectedPlan] = useState(plans[0]?.code || "");
  const [duration, setDuration] = useState("12");
  
  const generateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const planPrefix = selectedPlan.includes("pro") ? "PRO" : selectedPlan.includes("enterprise") ? "ENT" : "STD";
      const newCode = `OVC-${planPrefix}-${randomString}`;
      
      setKeys(prev => [{
        id: Math.random().toString(),
        code: newCode,
        plan: selectedPlan,
        duration: duration === "1" ? "1 Tháng" : duration === "6" ? "6 Tháng" : "1 Năm",
        status: "UNUSED",
        createdAt: new Date(),
      }, ...prev]);
      
      toast.success("Đã sinh mã kích hoạt thành công!");
      setIsGenerating(false);
      setShowGenerator(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép mã kích hoạt");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowGenerator(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition"
        >
          <Plus className="h-4 w-4" />
          Sinh mã mới
        </button>
      </div>

      {showGenerator && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-950">
            <KeyRound className="h-5 w-5 text-orange-600" />
            Tạo Mã Kích Hoạt (License Key)
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Gói dịch vụ (Plan)</label>
              <select 
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {plans.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Thời hạn</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="1">1 Tháng</option>
                <option value="6">6 Tháng</option>
                <option value="12">1 Năm</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowGenerator(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition"
            >
              Hủy
            </button>
            <button
              onClick={generateKey}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition disabled:opacity-50"
            >
              <Ticket className="h-4 w-4" />
              {isGenerating ? "Đang tạo..." : "Tạo Mã"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Kích Hoạt</th>
                <th className="px-6 py-4 font-medium">Gói / Module</th>
                <th className="px-6 py-4 font-medium">Thời hạn</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono font-semibold text-slate-900">
                        {key.code}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(key.code)}
                        className="text-slate-400 hover:text-orange-600 transition"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{plans.find(p => p.code === key.plan)?.name || key.plan}</span>
                  </td>
                  <td className="px-6 py-4">{key.duration}</td>
                  <td className="px-6 py-4">
                    {key.status === "UNUSED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Chưa sử dụng
                      </span>
                    )}
                    {key.status === "USED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        <ShieldAlert className="h-3.5 w-3.5" /> Đã kích hoạt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {key.createdAt.toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
