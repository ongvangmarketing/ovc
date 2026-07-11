"use client";

import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, Building2, Columns3, GraduationCap, Eye, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getInitials, formatRelative } from "@/lib/utils/format";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { CompactPagination } from "@/components/ui/compact-pagination";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { getContacts } from "@/modules/crm/actions/crm.actions";

const typeConfig = {
  LEAD: { label: "Lead", cls: "border-[#eaeaea] bg-white text-black" },
  PROSPECT: { label: "Prospect", cls: "border-[#eaeaea] bg-white text-black" },
  CUSTOMER: { label: "Khách hàng", cls: "border-[#eaeaea] bg-white text-black" },
  PARTNER: { label: "Đối tác", cls: "border-[#eaeaea] bg-gray-50 text-gray-600" },
  VENDOR: { label: "Nhà cung cấp", cls: "border-[#eaeaea] bg-gray-50 text-gray-600" },
};

const priorityConfig = {
  LOW: { label: "Thấp", dot: "bg-gray-300" },
  MEDIUM: { label: "TB", dot: "bg-black" },
  HIGH: { label: "Cao", dot: "bg-gray-600" },
  URGENT: { label: "Khẩn", dot: "bg-black" },
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

const PAGE_SIZE = 20;

export function ContactsClient() {
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedContacts = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleColumn = (column: ContactColumn) => {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              CRM Contacts
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Quản lý</span>{" "}
            <span className="text-gray-400">liên hệ CRM.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-gray-500 max-w-2xl">
            {isLoading ? "Đang tải..." : `${filtered.length} liên hệ trong hệ thống`}
          </p>
        </div>
        <Link href="/workspace/crm/contacts/create" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
          <Plus className="w-4 h-4" />
          Thêm khách hàng
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm liên hệ..."
            className="h-10 w-full rounded-md border border-[#eaeaea] bg-white pl-9 pr-3 text-[13px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <button className="flex h-10 items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
          <Filter className="w-3.5 h-3.5" />
          Lọc
        </button>
        <div className="ml-auto flex items-center gap-2">
          {view === "table" ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnMenuOpen((current) => !current)}
                className="flex h-10 items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-gray-50"
              >
                <Columns3 className="w-3.5 h-3.5" />
                Cột
              </button>
              {columnMenuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-[#eaeaea] bg-white p-2">
                  {columnOptions.map((column) => (
                    <label
                      key={column.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.id]}
                        onChange={() => toggleColumn(column.id)}
                        className="rounded border-[#eaeaea]"
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
        <div className="overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
          <div className="overflow-x-auto scrollable-x">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-gray-50/50">
                  <th className="w-10 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">
                    <input
                      type="checkbox"
                      className="rounded border-[#eaeaea]"
                      onChange={(e) =>
                        setSelectedIds(e.target.checked ? contacts.map((c) => c.id) : [])
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Liên hệ</th>
                  {visibleColumns.company ? <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Công ty</th> : null}
                  {visibleColumns.type ? <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Loại</th> : null}
                  {visibleColumns.priority ? <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Ưu tiên</th> : null}
                  {visibleColumns.tags ? <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Tags</th> : null}
                  {visibleColumns.lastContact ? <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-gray-400">Liên hệ lần cuối</th> : null}
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((contact) => {
                  const fullName = `${contact.firstName} ${contact.lastName}`;
                  const type = typeConfig[contact.type as keyof typeof typeConfig];
                  const priority = priorityConfig[contact.priority as keyof typeof priorityConfig];
                  const isSelected = selectedIds.includes(contact.id);
                  const createStudentHref = `/workspace/training/students/create?${new URLSearchParams({
                    name: fullName.trim(),
                    email: contact.email || "",
                    phone: contact.phone || "",
                    note: `Tạo từ CRM: ${contact.type || "CONTACT"}`,
                  }).toString()}`;

                  return (
                    <tr
                      key={contact.id}
                      className={cn(
                        "border-b border-[#eaeaea] transition-colors last:border-0 hover:bg-gray-50",
                        isSelected && "bg-gray-50"
                      )}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(contact.id)}
                          className="rounded border-[#eaeaea]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-xs font-medium text-black"
                          >
                            {getInitials(fullName)}
                          </div>
                          <div>
                            <Link href={`/workspace/crm/contacts/${contact.id}`} className="font-medium text-black hover:underline">
                              {fullName}
                            </Link>
                            <p className="text-xs text-gray-500">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      {visibleColumns.company ? (
                        <td className="py-3 px-4 max-w-[180px]">
                          <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate whitespace-nowrap">{contact.company?.name || "N/A"}</span>
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.type ? (
                        <td className="py-3 px-4">
                          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", type.cls)}>{type.label}</span>
                        </td>
                      ) : null}
                      {visibleColumns.priority ? (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-2 w-2 rounded-full", priority.dot)} />
                            <span className="text-xs text-gray-500">{priority.label}</span>
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.tags ? (
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      ) : null}
                      {visibleColumns.lastContact ? (
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {contact.lastContactAt ? formatRelative(new Date(contact.lastContactAt)) : "Chưa liên hệ"}
                        </td>
                      ) : null}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/workspace/crm/contacts/${contact.id}`} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link href={`/workspace/crm/contacts/${contact.id}/edit`} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Chỉnh sửa">
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <Link href={createStudentHref} className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Tạo học viên">
                            <GraduationCap className="w-4 h-4" />
                          </Link>
                          <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-50 hover:text-black" title="Thêm">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {paginatedContacts.map((contact) => {
            const fullName = `${contact.firstName} ${contact.lastName}`;
            const type = typeConfig[contact.type as keyof typeof typeConfig];
            const createStudentHref = `/workspace/training/students/create?${new URLSearchParams({
              name: fullName.trim(),
              email: contact.email || "",
              phone: contact.phone || "",
              note: `Tạo từ CRM: ${contact.type || "CONTACT"}`,
            }).toString()}`;

            return (
              <div key={contact.id} className="group cursor-pointer rounded-2xl border border-[#eaeaea] bg-white p-5 transition-colors duration-200 hover:border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-sm font-medium text-black"
                  >
                    {getInitials(fullName)}
                  </div>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", type.cls)}>{type.label}</span>
                </div>
                <Link href={`/workspace/crm/contacts/${contact.id}`} className="block">
                  <h3 className="text-sm font-medium text-black group-hover:underline">
                    {fullName}
                  </h3>
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">{contact.company?.name || "N/A"}</p>
                <div className="mt-3 space-y-1.5 border-t border-[#eaeaea] pt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 border-t border-[#eaeaea] pt-3">
                  <Link href={`/workspace/crm/contacts/${contact.id}`} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-black" title="Xem chi tiết">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link href={`/workspace/crm/contacts/${contact.id}/edit`} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-black" title="Chỉnh sửa">
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <Link href={createStudentHref} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-black" title="Tạo học viên">
                    <GraduationCap className="h-4 w-4" />
                  </Link>
                  <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600" title="Xóa">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <CompactPagination
        currentPage={safePage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="khách hàng"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
