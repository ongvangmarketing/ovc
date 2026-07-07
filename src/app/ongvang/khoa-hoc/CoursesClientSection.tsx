"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CourseCard } from "../_components/CourseCard";

type Course = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  currency: string;
  level: string;
  duration?: number | null;
  tags: string[];
};

const levels = [
  { key: "all", label: "Tất cả" },
  { key: "beginner", label: "Cơ bản" },
  { key: "intermediate", label: "Trung cấp" },
  { key: "advanced", label: "Nâng cao" },
];

export function CoursesClientSection({ courses }: { courses: Course[] }) {
  const [activeLevel, setActiveLevel] = useState("all");

  const filtered = activeLevel === "all"
    ? courses
    : courses.filter((c) => c.level === activeLevel);

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-10 flex flex-wrap items-center gap-2">
        {levels.map((level) => {
          const isActive = activeLevel === level.key;
          const count = level.key === "all"
            ? courses.length
            : courses.filter((c) => c.level === level.key).length;

          return (
            <button
              key={level.key}
              onClick={() => setActiveLevel(level.key)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">
                {level.label}
                <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-slate-600"}`}>
                  ({count})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid with AnimatePresence */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                price={course.price}
                currency={course.currency}
                level={course.level}
                duration={course.duration}
                tags={course.tags}
                index={i}
                href="/ongvang/lien-he"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-20 text-center"
          >
            <div className="mb-4 text-5xl">🎓</div>
            <p className="text-slate-500">Chưa có khóa học ở cấp độ này.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
