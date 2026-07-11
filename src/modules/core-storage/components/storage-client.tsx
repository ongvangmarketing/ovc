"use client";

import React, { useState } from "react";
import { HardDrive, Server, ShieldCheck, Database, FolderTree, Activity } from "lucide-react";
import { StorageConnectionsTab } from "./storage-connections-tab";
import { StoragePoliciesTab } from "./storage-policies-tab";
import { StorageExplorerTab } from "./storage-explorer-tab";
import { getStorageStats } from "../actions/storage.actions";

export function StorageClient({ organizationId }: { organizationId: string }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "connections" | "policies" | "explorer">("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-[#eaeaea] pb-4 overflow-x-auto">
        <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<Activity className="h-4 w-4" />} label="Tổng quan" />
        <TabButton active={activeTab === "connections"} onClick={() => setActiveTab("connections")} icon={<Server className="h-4 w-4" />} label="Connections" />
        <TabButton active={activeTab === "policies"} onClick={() => setActiveTab("policies")} icon={<ShieldCheck className="h-4 w-4" />} label="Policies" />
        <TabButton active={activeTab === "explorer"} onClick={() => setActiveTab("explorer")} icon={<FolderTree className="h-4 w-4" />} label="File Explorer" />
      </div>

      <div className="pt-4">
        {activeTab === "dashboard" && <StorageDashboard organizationId={organizationId} />}
        {activeTab === "connections" && <StorageConnectionsTab organizationId={organizationId} />}
        {activeTab === "policies" && <StoragePoliciesTab organizationId={organizationId} />}
        {activeTab === "explorer" && <StorageExplorerTab organizationId={organizationId} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-full transition-colors whitespace-nowrap ${
        active ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StorageDashboard({ organizationId }: { organizationId: string }) {
  const [stats, setStats] = React.useState({
    totalFiles: 0,
    totalBytes: 0,
    totalCapacityBytes: null as number | null,
    availableBytes: null as number | null,
    activeConnections: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const res = await getStorageStats(organizationId);
        setStats(res);
      } catch (e) {
        console.error("Error loading stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [organizationId]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-[#eaeaea] p-6 bg-white flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <HardDrive className="h-6 w-6" />
        </div>
        <div className="text-[32px] font-medium tracking-tight">
          {loading ? "..." : formatSize(stats.totalBytes)}
        </div>
        <div className="text-[14px] text-gray-500 mt-1">Dung lượng đã dùng</div>
      </div>
      <div className="rounded-2xl border border-[#eaeaea] p-6 bg-white flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <HardDrive className="h-6 w-6" />
        </div>
        <div className="text-[26px] font-medium tracking-tight">
          {loading ? "..." : stats.availableBytes === null ? "Theo nhà cung cấp" : formatSize(stats.availableBytes)}
        </div>
        <div className="text-[14px] text-gray-500 mt-1">Dung lượng khả dụng</div>
      </div>
      <div className="rounded-2xl border border-[#eaeaea] p-6 bg-white flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
          <Database className="h-6 w-6" />
        </div>
        <div className="text-[32px] font-medium tracking-tight">
          {loading ? "..." : stats.totalFiles}
        </div>
        <div className="text-[14px] text-gray-500 mt-1">Tổng số tệp tin (Files)</div>
      </div>
      <div className="rounded-2xl border border-[#eaeaea] p-6 bg-white flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
          <Server className="h-6 w-6" />
        </div>
        <div className="text-[32px] font-medium tracking-tight">
          {loading ? "..." : stats.activeConnections}
        </div>
        <div className="text-[14px] text-gray-500 mt-1">Storage Connections</div>
      </div>
    </div>
  );
}
