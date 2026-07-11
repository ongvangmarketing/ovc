"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Check } from "lucide-react";
export function ComboSelectModal<T extends { id: string }>({
  label,
  value,
  search,
  selectedTitle,
  onSearchChange,
  placeholder,
  options,
  getTitle,
  getSubtitle,
  getValue,
  onSelect,
  allowEmpty,
}: {
  label?: string;
  value: string;
  search: string;
  selectedTitle?: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  options: T[];
  getTitle: (option: T) => string;
  getSubtitle?: (option: T) => string;
  getValue?: (option: T) => string;
  onSelect: (id: string) => void;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasDisplayValue = Boolean(value || selectedTitle);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const displayOptions = options.filter(opt => getTitle(opt).toLowerCase().includes(localSearch.toLowerCase()));
  const triggerText = hasDisplayValue ? (selectedTitle || "Đã chọn") : placeholder;

  const content = (
    <>
      {/* Trigger Button */}
      <div className="relative min-w-0 max-w-full" ref={containerRef}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <button
          type="button"
          aria-label={label || placeholder}
          onClick={() => {
            setLocalSearch("");
            onSearchChange("");
            setOpen(true);
          }}
          className={`flex w-full min-h-[46px] items-center rounded-lg border border-[#eaeaea] bg-gray-50/50 pl-10 pr-10 py-3 text-[14px] text-left transition-colors hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none ${
            hasDisplayValue ? "text-black font-medium" : "text-gray-300"
          }`}
        >
          <span className="block truncate">{triggerText}</span>
        </button>
        {hasDisplayValue && allowEmpty && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect("");
              onSearchChange("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200 hover:text-black"
            aria-label="Xóa lựa chọn"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Popover */}
        {open && (
          <div 
            className="fixed inset-x-4 top-[35vh] z-[999] max-h-[55vh] overflow-hidden rounded-xl border border-[#eaeaea] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] animate-in fade-in slide-in-from-top-2 duration-200 sm:absolute sm:inset-auto sm:left-0 sm:top-[calc(100%+8px)] sm:w-full sm:min-w-[min(360px,calc(100vw-2rem))] sm:max-w-[min(520px,calc(100vw-2rem))] sm:rounded-md sm:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input */}
            <div className="m-2 flex h-[42px] items-center rounded-[6px] border border-[#eaeaea] bg-white px-4">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearchChange(e.target.value);
                }}
                className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-black outline-none placeholder:text-slate-300"
                placeholder="Search..."
              />
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#eaeaea] bg-white text-[11px] font-medium text-slate-500 transition-colors hover:bg-gray-50"
              >
                Esc
              </button>
            </div>

            {/* List */}
            <div className="max-h-[calc(55vh-66px)] overflow-y-auto p-1.5 sm:max-h-[300px]">
              {displayOptions.length === 0 ? (
                <div className="py-8 text-center text-[14px] text-gray-500">
                  Không tìm thấy kết quả nào.
                </div>
              ) : (
                <div className="space-y-0.5">
                  {displayOptions.map((opt) => {
                    const optValue = getValue ? getValue(opt) : opt.id;
                    const isSelected = optValue === value;
                    const subtitle = getSubtitle ? getSubtitle(opt) : null;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSelect(optValue);
                          setOpen(false);
                        }}
                        className={`flex w-full items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                          isSelected ? "bg-gray-50" : ""
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                          <span className="truncate text-[14px] font-medium text-black">
                            {getTitle(opt)}
                          </span>
                          {subtitle && (
                            <span className="mt-0.5 block truncate text-[13px] leading-5 text-gray-500">
                              {subtitle}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-black" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return content;
}
