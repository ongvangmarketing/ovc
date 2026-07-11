"use client";

import { useEffect, useState, useTransition, type Dispatch, type SetStateAction } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Folder, CheckSquare, Loader2 } from "lucide-react";
import { globalCustomerSearch } from "@/app/(portals)/customer/actions/search";

interface CommandMenuProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ projects: any[], tasks: any[] }>({ projects: [], tasks: [] });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults({ projects: [], tasks: [] });
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await globalCustomerSearch(query);
        setResults(res);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const onSelectProject = (id: string) => {
    setOpen(false);
    router.push(`/customer/projects/${id}`);
  };

  const onSelectTask = (id: string, projectId: string) => {
    setOpen(false);
    // Since we don't have a task detail page, route to the project detail page
    // The user can find the task there, or we can route to /customer/tasks
    router.push(`/customer/tasks`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-black/40 backdrop-blur-sm px-4" onClick={() => setOpen(false)}>
      <Command 
        className="w-full max-w-[640px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#eaeaea] animate-in fade-in zoom-in-95 duration-200"
        shouldFilter={false}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-[#eaeaea] px-4">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <Command.Input 
            autoFocus 
            placeholder="Tìm kiếm dự án, nhiệm vụ..." 
            className="w-full bg-transparent p-4 text-[15px] outline-none placeholder:text-gray-400 text-black border-none focus:ring-0"
            value={query}
            onValueChange={setQuery}
          />
          {isPending && <Loader2 className="h-4 w-4 text-gray-400 animate-spin shrink-0" />}
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2 hide-scrollbar">
          <Command.Empty className="py-6 text-center text-[14px] text-gray-500">
            {isPending ? "Đang tìm kiếm..." : "Không tìm thấy kết quả nào."}
          </Command.Empty>

          {results.projects.length > 0 && (
            <Command.Group heading="Dự án" className="px-2 py-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest">
              {results.projects.map((project) => (
                <Command.Item 
                  key={project.id} 
                  value={project.id} 
                  onSelect={() => onSelectProject(project.id)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 mt-1 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors aria-selected:bg-gray-50 data-[selected=true]:bg-gray-50"
                >
                  <Folder className="h-4 w-4 text-gray-400" />
                  {project.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results.tasks.length > 0 && (
            <Command.Group heading="Nhiệm vụ" className="px-2 py-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest mt-2">
              {results.tasks.map((task) => (
                <Command.Item 
                  key={task.id} 
                  value={task.id} 
                  onSelect={() => onSelectTask(task.id, task.projectId)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 mt-1 text-[14px] text-black cursor-pointer hover:bg-gray-50 transition-colors aria-selected:bg-gray-50 data-[selected=true]:bg-gray-50"
                >
                  <CheckSquare className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span>{task.title}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
