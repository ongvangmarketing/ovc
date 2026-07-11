"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function getCompactPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 8) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, 2, 3, totalPages - 2, totalPages - 1, totalPages]);
  if (currentPage < totalPages - 2) {
    pages.add(currentPage - 1);
    pages.add(currentPage);
    pages.add(currentPage + 1);
    pages.add(currentPage + 2);
    pages.add(currentPage + 3);
  } else {
    pages.add(currentPage - 2);
    pages.add(currentPage - 1);
    pages.add(currentPage);
  }

  const sortedPages = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.reduce<(number | string)[]>((items, pageNumber, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && pageNumber - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${pageNumber}`);
    }
    items.push(pageNumber);
    return items;
  }, []);
}

export function CompactPagination({
  currentPage,
  totalItems,
  pageSize = 20,
  itemLabel = "mục",
  onPageChange,
  className,
}: {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const items = getCompactPaginationItems(currentPage, totalPages);

  return (
    <div className={cn("flex items-center justify-between gap-3 border-t border-[#eaeaea] px-4 py-3", className)}>
      <p className="text-sm text-gray-500">
        <span className="sm:hidden">{end}/{totalItems} {itemLabel}</span>
        <span className="hidden sm:inline">Hiển thị {start}-{end} / {totalItems} {itemLabel}</span>
      </p>
      <div className="flex items-center gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="flex h-8 min-w-10 items-center justify-center rounded-md bg-black px-2 text-[12px] font-medium text-white">
          {currentPage}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        {currentPage > 1 ? (
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border border-[#eaeaea] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Trước
          </button>
        ) : null}
        {items.map((item) => (
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium",
                item === currentPage
                  ? "border-black bg-black text-white"
                  : "border-[#eaeaea] bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1.5 text-sm font-medium text-gray-400">...</span>
          )
        ))}
        {currentPage < totalPages ? (
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border border-[#eaeaea] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sau
          </button>
        ) : null}
      </div>
    </div>
  );
}
