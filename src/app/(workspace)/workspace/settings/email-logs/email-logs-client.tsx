"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { EmailSettingsNav } from "@/modules/core/components/email-settings-nav";

export function EmailLogsClient({ logs }: { logs: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log => 
    log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.to?.some((email: string) => email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <EmailSettingsNav />

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-[20px] font-medium tracking-tight text-black">Email Logs</h3>
              <p className="mt-2 text-[14px] text-gray-500">
                Theo dõi lịch sử gửi nhận email của hệ thống.
              </p>
            </div>
            
            <input
              type="text"
              placeholder="Tìm kiếm email hoặc tiêu đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-md border border-[#eaeaea] px-3 py-2 text-[14px] focus:border-black focus:outline-none focus:ring-0 transition-colors"
            />
          </div>

          <div className="border border-[#eaeaea] rounded-xl overflow-hidden">
            {filteredLogs.length > 0 ? (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-[#eaeaea] text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Người nhận</th>
                    <th className="px-6 py-4">Tiêu đề</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea]">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{log.to?.join(", ")}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-black font-medium">{log.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          log.status === "SENT" ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" :
                          log.status === "FAILED" ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20" :
                          "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-[14px] text-gray-500">
                Không tìm thấy email nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
