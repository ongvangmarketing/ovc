"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, Building2, Columns3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getInitials, stringToColor, formatRelative } from "@/lib/utils/format";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { getContacts } from "@/app/actions/crm";

const typeConfig = {
  LEAD: { label: "Lead", cls: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  PROSPECT: { label: "Prospect", cls: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" },
  CUSTOMER: { label: "Khách hàng", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  PARTNER: { label: "Đối tác", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  VENDOR: { label: "Nhà cung cấp", cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

const priorityConfig = {
  LOW: { label: "Thấp", dot: "bg-slate-400" },
  MEDIUM: { label: "TB", dot: "bg-blue-500" },
  HIGH: { label: "Cao", dot: "bg-orange-500" },
  URGENT: { label: "Khẩn", dot: "bg-red-500" },
};

type ViewMode = "table" | "card";
type ContactColumn = "company" | "type" | "priority" | "tags" | "lastContact";

const columnOptions: Array<{ id: ContactColumn; label: string }> = [
  { id: "company", label: "Công ty" },
  { id: "type", label: "Loại" },
  { id: "priority", label: "Ưu tiên" },
  { id: "tags", label: "Tags" },
  { id: "lastContact", label: "Liên hệ lần cuối" },
];

const defaultVisibleColumns: Record<ContactColumn, boolean> = {
  company: true,
  type: false,
  priority: true,
  tags: false,
  lastContact: false,
};

export function ContactsClient() {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts(),
  });

  const filtered = contacts.filter(
    (c) =>
      `${c.firstName} ${c.lastName} ${c.email || ""} ${c.company?.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleColumn = (column: ContactColumn) => {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Liên hệ</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Đang tải..." : `${filtered.length} liên hệ trong hệ thống`}
          </p>
        </div>
        <Link href="/workspace/crm/contacts/create" className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          Thêm khách hàng
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm liên hệ..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Filter className="w-3.5 h-3.5" />
          Lọc
        </button>
        <div className="ml-auto flex items-center gap-2">
          {view === "table" ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnMenuOpen((current) => !current)}
                className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Columns3 className="w-3.5 h-3.5" />
                Cột
              </button>
              {columnMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-xl">
                  {columnOptions.map((column) => (
                    <label
                      key={column.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.id]}
                        onChange={() => toggleColumn(column.id)}
                        className="rounded border-border"
                      />
                      {column.label}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <ViewSwitcher value={view} onChange={(v) => setView(v as ViewMode)} options={["table", "card"]} />
        </div>
      </div>

      {/* Content */}
      {view === "table" ? (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto scrollable-x">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-10">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      onChange={(e) =>
                        setSelectedIds(e.target.checked ? contacts.map((c) => c.id) : [])
                      }
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Liên hệ</th>
                  {visibleColumns.company ? <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Công ty</th> : null}
                  {visibleColumns.type ? <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Loại</th> : null}
                  {visibleColumns.priority ? <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Ưu tiên</th> : null}
                  {visibleColumns.tags ? <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Tags</th> : null}
                  {visibleColumns.lastContact ? <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Liên hệ lần cuối</th> : null}
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => {
                  const fullName = `${contact.firstName} ${contact.lastName}`;
                  const color = stringToColor(fullName);
                  const type = typeConfig[contact.type as keyof typeof typeConfig];
                  const priority = priorityConfig[contact.priority as keyof typeof priorityConfig];
                  const isSelected = selectedIds.includes(contact.id);

                  return (
                    <tr
                      key={contact.id}
                      className={cn(
                        "border-b border-border last:border-0 table-row-hover",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(contact.id)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {getInitials(fullName)}
                          </div>
                          <div>
                            <Link href={`/workspace/crm/contacts/${contact.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                              {fullName}
                            </Link>
                            <p className="text-xs text-muted-foreground">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      {visibleColumns.company ? (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {contact.company?.name || "N/A"}
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.type ? (
                        <td className="py-3 px-4">
                          <span className={cn("badge-status text-xs", type.cls)}>{type.label}</span>
                        </td>
                      ) : null}
                      {visibleColumns.priority ? (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("priority-dot", priority.dot)} />
                            <span className="text-xs text-muted-foreground">{priority.label}</span>
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.tags ? (
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.lastContact ? (
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {contact.lastContactAt ? formatRelative(new Date(contact.lastContactAt)) : "Chưa liên hệ"}
                        </td>
                      ) : null}
                      <td className="py-3 px-4">
                        <button className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="data-grid">
          {filtered.map((contact) => {
            const fullName = `${contact.firstName} ${contact.lastName}`;
            const color = stringToColor(fullName);
            const type = typeConfig[contact.type as keyof typeof typeConfig];

            return (
              <div key={contact.id} className="card-base p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(fullName)}
                  </div>
                  <span className={cn("badge-status text-xs", type.cls)}>{type.label}</span>
                </div>
                <Link href={`/workspace/crm/contacts/${contact.id}`} className="block">
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {fullName}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{contact.company?.name || "N/A"}</p>
                <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
