"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MessageSquare, ListTodo, CircleDashed, CheckCircle2 } from "lucide-react";
import { formatDate, statusClass, statusLabel } from "../utils";
import { TaskDetailModal } from "./TaskDetailModal";

type TaskListProps = {
  tasks: any[];
  currentUser: any;
};

export function TasksList({ tasks, currentUser }: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const tabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "TODO", label: "Cần làm" },
    { id: "IN_PROGRESS", label: "Đang triển khai" },
    { id: "IN_REVIEW", label: "Chờ duyệt" },
    { id: "DONE", label: "Hoàn thành" },
  ];

  const filteredTasks = tasks.filter(task => {
    if (filter === "ALL") return true;
    if (filter === "DONE") return task.status === "DONE" || task.status === "COMPLETED";
    return task.status === filter;
  });

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`relative px-5 py-2.5 text-sm font-semibold transition-colors rounded-xl ${
                isActive ? "text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-blue-50 ring-1 ring-blue-100"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.5) }}
                onClick={() => setSelectedTaskId(task.id)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:ring-1 hover:ring-blue-100"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${statusClass(task.status)}`}>
                        {statusLabel(task.status)}
                      </span>
                      <Link href={`/customer/projects`} className="text-xs font-semibold text-blue-600 hover:underline line-clamp-1" onClick={(e) => e.stopPropagation()}>
                        {task.projectName}
                      </Link>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 sm:justify-end">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-600 font-bold" : ""}>
                        {task.dueDate ? formatDate(task.dueDate) : "Không có thời hạn"}
                      </span>
                    </div>

                    {task.comments?.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                        {task.comments.length}
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}

                    <div className="hidden sm:flex items-center justify-center h-8 px-3 rounded-lg text-sm font-bold text-blue-600 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      Chi tiết
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ListTodo className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Không có nhiệm vụ nào</h3>
              <p className="mt-1 text-sm text-slate-500">
                Không tìm thấy nhiệm vụ nào trong mục này.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          currentUser={currentUser}
          onClose={() => setSelectedTaskId(null)} 
        />
      )}
    </div>
  );
}
