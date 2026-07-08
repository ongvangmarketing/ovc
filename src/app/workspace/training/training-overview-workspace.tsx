"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { BookOpen, GraduationCap, LayoutGrid, Users } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { OverviewClass, OverviewCourse, OverviewStudent, OverviewTab, TrainingOverviewData } from "./training-overview.types";
import { mockOverviewData } from "./training-overview.mock";
import { OverviewHeader } from "./components/overview-header";
import { OverviewStatCards } from "./components/overview-stat-cards";
import { OverviewAlertPanel } from "./components/overview-alert-panel";
import { OverviewQuickActions } from "./components/overview-quick-actions";
import { OverviewCourseTable } from "./components/overview-course-table";
import { OverviewClassGrid } from "./components/overview-class-grid";
import { OverviewStudentList } from "./components/overview-student-list";
import { MobileItemDrawer, OverviewItemDrawer } from "./components/overview-item-drawer";
import { OverviewQuickCreate } from "./components/overview-quick-create";

type DrawerItem =
  | { type: "course"; data: OverviewCourse }
  | { type: "class"; data: OverviewClass }
  | { type: "student"; data: OverviewStudent };

const tabs: { id: OverviewTab; label: string; icon: typeof GraduationCap }[] = [
  { id: "courses", label: "Khóa học", icon: BookOpen },
  { id: "classes", label: "Lớp học", icon: LayoutGrid },
  { id: "students", label: "Học viên", icon: Users },
];

interface TrainingOverviewWorkspaceProps {
  /** Data fetched server-side; falls back to mock if empty */
  initialData?: Partial<TrainingOverviewData>;
}

export function TrainingOverviewWorkspace({ initialData }: TrainingOverviewWorkspaceProps) {
  // ─── Data state (prefer server data, fall back to mock) ──────────────────
  const [courses, setCourses] = useState<OverviewCourse[]>(() =>
    initialData?.courses?.length ? (initialData.courses as OverviewCourse[]) : mockOverviewData.courses
  );
  const [classes, setClasses] = useState<OverviewClass[]>(() =>
    initialData?.classes?.length ? (initialData.classes as OverviewClass[]) : mockOverviewData.classes
  );
  const [students, setStudents] = useState<OverviewStudent[]>(() =>
    initialData?.students?.length ? (initialData.students as OverviewStudent[]) : mockOverviewData.students
  );
  const alerts = initialData?.alerts?.length ? initialData.alerts : mockOverviewData.alerts;
  const stats = initialData?.stats?.length ? initialData.stats : mockOverviewData.stats;

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<OverviewTab>("courses");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // for mobile overlay
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Simulate initial loading skeleton
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 480);
    return () => window.clearTimeout(timer);
  }, []);

  // ─── Derived drawer item ───────────────────────────────────────────────────
  const drawerItem = useMemo<DrawerItem | null>(() => {
    if (!selectedId) return null;
    if (activeTab === "courses") {
      const data = courses.find((c) => c.id === selectedId);
      return data ? { type: "course", data } : null;
    }
    if (activeTab === "classes") {
      const data = classes.find((c) => c.id === selectedId);
      return data ? { type: "class", data } : null;
    }
    if (activeTab === "students") {
      const data = students.find((s) => s.id === selectedId);
      return data ? { type: "student", data } : null;
    }
    return null;
  }, [selectedId, activeTab, courses, classes, students]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  function selectItem(id: string) {
    setSelectedId(id);
    setDrawerOpen(true); // open mobile drawer
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedId(null);
  }

  function updateCourse(id: string, patch: Partial<OverviewCourse>) {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, activity: ["Vừa cập nhật inline", ...c.activity.slice(0, 4)] }
          : c
      )
    );
    toast.success("Đã cập nhật khóa học");
  }

  function updateClass(id: string, patch: Partial<OverviewClass>) {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, activity: ["Vừa cập nhật inline", ...c.activity.slice(0, 4)] }
          : c
      )
    );
    toast.success("Đã cập nhật lớp học");
  }

  function updateStudent(id: string, patch: Partial<OverviewStudent>) {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...patch, activity: ["Vừa cập nhật inline", ...s.activity.slice(0, 4)] }
          : s
      )
    );
    toast.success("Đã cập nhật học viên");
  }

  function createCourse(partial: Partial<OverviewCourse>) {
    const newCourse: OverviewCourse = {
      id: `course-${Date.now()}`,
      title: partial.title ?? "Khóa học mới",
      description: partial.description ?? "",
      instructor: partial.instructor ?? "Chưa phân công",
      instructorId: "",
      status: "DRAFT",
      level: partial.level ?? "beginner",
      classes: 0,
      enrollments: 0,
      price: partial.price ?? 0,
      language: "vi",
      isPublic: false,
      isFeatured: false,
      activity: ["Tạo nhanh trong workspace"],
    };
    setCourses((prev) => [newCourse, ...prev]);
    setSelectedId(newCourse.id);
    setActiveTab("courses");
    setDrawerOpen(true);
  }

  // ─── Tab change: clear selection ──────────────────────────────────────────
  function handleTabChange(tab: OverviewTab) {
    setActiveTab(tab);
    setSelectedId(null);
    setDrawerOpen(false);
  }

  // ─── Badge counts ─────────────────────────────────────────────────────────
  const badgeCount = useMemo(() => ({
    courses: courses.length,
    classes: classes.length,
    students: students.length,
  }), [courses.length, classes.length, students.length]);

  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      {/* Header */}
      <OverviewHeader onQuickCreate={() => setQuickCreateOpen(true)} />

      {/* Stat cards */}
      <OverviewStatCards stats={stats} isLoading={isLoading} />

      {/* Operations row */}
      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <OverviewQuickActions />
        <OverviewAlertPanel alerts={alerts} isLoading={isLoading} />
      </section>

      {/* Tab bar */}
      <nav
        role="tablist"
        aria-label="Training sections"
        className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`training-tab-${tab.id}`}
              role="tab"
              aria-selected={active}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100",
                active ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-medium",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {badgeCount[tab.id]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main content + drawer */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Tab panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            role="tabpanel"
            aria-labelledby={`training-tab-${activeTab}`}
          >
            {isLoading ? (
              <LoadingPanel />
            ) : activeTab === "courses" ? (
              <OverviewCourseTable
                courses={courses}
                selectedId={selectedId}
                onSelect={selectItem}
                onUpdate={updateCourse}
              />
            ) : activeTab === "classes" ? (
              <OverviewClassGrid
                classes={classes}
                selectedId={selectedId}
                onSelect={selectItem}
                onUpdate={updateClass}
              />
            ) : (
              <OverviewStudentList
                students={students}
                selectedId={selectedId}
                onSelect={selectItem}
                onUpdate={updateStudent}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Desktop side drawer */}
        <div className="hidden xl:block">
          {drawerItem ? (
            <OverviewItemDrawer
              item={drawerItem}
              onClose={closeDrawer}
              onUpdateCourse={updateCourse}
              onUpdateClass={updateClass}
              onUpdateStudent={updateStudent}
            />
          ) : (
            <DrawerPlaceholder tab={activeTab} />
          )}
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {drawerOpen && drawerItem && (
          <MobileItemDrawer
            item={drawerItem}
            onClose={closeDrawer}
            onUpdateCourse={updateCourse}
            onUpdateClass={updateClass}
            onUpdateStudent={updateStudent}
          />
        )}
      </AnimatePresence>

      {/* Quick create modal */}
      <AnimatePresence>
        {quickCreateOpen && (
          <OverviewQuickCreate
            onClose={() => setQuickCreateOpen(false)}
            onCreate={createCourse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Loading panel ────────────────────────────────────────────────────────────
function LoadingPanel() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl bg-slate-100"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Drawer placeholder (when nothing selected) ───────────────────────────────
function DrawerPlaceholder({ tab }: { tab: OverviewTab }) {
  const tips: Record<OverviewTab, { icon: typeof GraduationCap; text: string }> = {
    courses: { icon: BookOpen, text: "Nhấn vào một khóa học để xem chi tiết và chỉnh sửa inline." },
    classes: { icon: LayoutGrid, text: "Nhấn vào một lớp học để xem thông tin sĩ số, lịch và địa điểm." },
    students: { icon: Users, text: "Nhấn vào một học viên để xem tiến độ, chỉnh sửa và giao việc." },
  };
  const { icon: Icon, text } = tips[tab];
  return (
    <aside className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-400 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </aside>
  );
}
