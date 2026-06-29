"use client";

import { useMemo, useState } from "react";
import { ChartGantt, Columns3 } from "lucide-react";

type TaskItem = {
  id: string;
  title: string;
  projectName: string;
  status: string;
  statusLabel: string;
  statusClass: string;
  startDate: string | null;
  dueDate: string | null;
  startLabel: string;
  dueLabel: string;
};

const columns = [
  { key: "TODO", label: "Cần làm" },
  { key: "IN_PROGRESS", label: "Đang làm" },
  { key: "IN_REVIEW", label: "Đang duyệt" },
  { key: "DONE", label: "Hoàn thành" },
];

export function TasksView({ tasks }: { tasks: TaskItem[] }) {
  const [view, setView] = useState<"kanban" | "gantt">("kanban");
  const gantt = useMemo(() => {
    const dates = tasks.flatMap((task) => [task.startDate, task.dueDate]).filter(Boolean).map((value) => new Date(value as string).getTime());
    const min = dates.length ? Math.min(...dates) : Date.now();
    const max = dates.length ? Math.max(...dates) : min + 86400000;
    const range = Math.max(max - min, 86400000);
    return { min, range };
  }, [tasks]);

  return (
    <section className="quote-detail-card">
      <div className="portal-section-heading">
        <div>
          <h2>Tiến độ nhiệm vụ</h2>
          <p>Chuyển nhanh giữa bảng Kanban và lịch Gantt.</p>
        </div>
        <div className="portal-view-toggle">
          <button type="button" className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}><Columns3 className="h-4 w-4" />Kanban</button>
          <button type="button" className={view === "gantt" ? "active" : ""} onClick={() => setView("gantt")}><ChartGantt className="h-4 w-4" />Gantt</button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="portal-task-board">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.key);
            return (
              <div key={column.key} className="portal-task-column">
                <header><strong>{column.label}</strong><span>{columnTasks.length}</span></header>
                <div>
                  {columnTasks.map((task) => (
                    <article key={task.id}>
                      <strong>{task.title}</strong>
                      <p>{task.projectName}</p>
                      <footer>
                        <span className={task.statusClass}>{task.statusLabel}</span>
                        <time>{task.dueLabel}</time>
                      </footer>
                    </article>
                  ))}
                  {!columnTasks.length ? <p className="portal-kanban-empty">Chưa có nhiệm vụ</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="portal-gantt">
          <div className="portal-gantt-header"><span>Nhiệm vụ</span><span>Tiến độ thời gian</span></div>
          {tasks.map((task) => {
            const start = task.startDate ? new Date(task.startDate).getTime() : gantt.min;
            const end = task.dueDate ? new Date(task.dueDate).getTime() : start + 86400000;
            const left = Math.max(0, ((start - gantt.min) / gantt.range) * 100);
            const width = Math.max(4, ((Math.max(end, start + 86400000) - start) / gantt.range) * 100);
            return (
              <div key={task.id} className="portal-gantt-row">
                <div><strong>{task.title}</strong><small>{task.projectName}</small></div>
                <div className="portal-gantt-track">
                  <span className={`portal-gantt-bar ${task.statusClass}`} style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}>
                    {task.startLabel} - {task.dueLabel}
                  </span>
                </div>
              </div>
            );
          })}
          {!tasks.length ? <div className="quote-detail-empty">Chưa có nhiệm vụ.</div> : null}
        </div>
      )}
    </section>
  );
}
