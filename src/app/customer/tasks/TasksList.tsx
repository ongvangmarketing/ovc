"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MessageSquare, ListTodo } from "lucide-react";
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
    <div className="flex flex-col gap-10">
      {/* Vercel Style Tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-[#eaeaea]">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`pb-4 text-[15px] font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive ? "text-black border-black" : "text-gray-500 border-transparent hover:text-black hover:border-gray-300"
              }`}
            >
              {tab.label}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                onClick={() => setSelectedTaskId(task.id)}
                className="group cursor-pointer rounded-2xl border border-[#eaeaea] bg-white p-6 transition-colors hover:border-gray-300 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-transparent ${
                      task.status === "DONE" || task.status === "COMPLETED" ? "border-transparent bg-emerald-50 text-emerald-700" : 
                      "border-[#eaeaea] bg-white text-gray-600"
                    }`}>
                      {statusLabel(task.status)}
                    </span>
                    <Link href={`/customer/projects`} className="text-[13px] text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                      {task.projectName}
                    </Link>
                  </div>
                  <h3 className="text-[20px] font-medium tracking-tight text-black leading-tight group-hover:text-gray-600 transition-colors">
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center gap-6 shrink-0 sm:justify-end mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-[#eaeaea]">
                  <div className="flex items-center gap-2 text-[14px] font-medium text-gray-500">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-500" : ""}>
                      {task.dueDate ? formatDate(task.dueDate) : "Không có thời hạn"}
                    </span>
                  </div>

                  {task.comments?.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-[14px] font-medium text-gray-500">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      {task.comments.length}
                    </div>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#eaeaea] bg-gray-50 py-24 text-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white border border-[#eaeaea]">
                <ListTodo className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-[20px] font-medium tracking-tight text-black">Không có nhiệm vụ nào</h3>
              <p className="mt-2 text-[15px] text-gray-500 max-w-sm">
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
