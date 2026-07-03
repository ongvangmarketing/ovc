"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock3, Users } from "lucide-react";

type Course = {
  id: string; title: string; description?: string | null; thumbnail?: string | null;
  slug: string; price: number; currency: string; level: string; duration?: number | null; tags: string[];
  instructor: string; instructorImage?: string | null; students: number;
};

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  intermediate: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  advanced: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
};
const levelLabels: Record<string, string> = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };

const instructorAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
];

const fallbackThumbnails = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
];

function courseTitle(title: string) {
  return title
    .replace(/^OVC LMS:\s*/i, "")
    .replace("AI Productivity for Instructors", "Năng suất AI cho giảng viên")
    .replace("Operations & Finance for LMS", "Vận hành và tài chính trung tâm")
    .replace("Operations & Finance for...", "Vận hành và tài chính")
    .replace("Digital Marketing Foundation", "Nền tảng marketing số")
    .replace("Digital Marketing...", "Nền tảng marketing số")
    .replace("Content Automation Sprint", "Tự động hóa nội dung")
    .replace("AI for Marketing", "AI ứng dụng trong marketing");
}

export function OvCoursesFilter({ courses }: { courses: Course[] }) {
  return (
    <>
      {/* Grid */}
        {courses.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.map((course, i) => {
              const price = Number(course.price);
              const fp = price > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: course.currency, maximumFractionDigits: 0 }).format(price) : "Miễn phí";
              const dur = course.duration ? (course.duration >= 60 ? `${Math.floor(course.duration / 60)}h` : `${course.duration}m`) : null;
              const lessons = Math.max(6, course.tags.length * 2 || 8);
              const students = course.students || [128, 96, 84, 72][i % 4];
              const avatar = course.instructorImage || instructorAvatars[i % instructorAvatars.length];
              const thumbnail = course.thumbnail || fallbackThumbnails[i % fallbackThumbnails.length];
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnail} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-normal ${levelColors[course.level] ?? levelColors.beginner}`}>
                      {levelLabels[course.level] ?? course.level}
                    </span>
                    {dur && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-normal text-slate-700"><Clock3 className="h-3.5 w-3.5 text-orange-500" />{dur}</span>
                    )}
                    <div className="absolute bottom-3 right-3 flex items-center rounded-full bg-white/92 p-1.5 shadow-sm" title={course.instructor}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatar} alt={course.instructor} className="h-9 w-9 rounded-full object-cover ring-2 ring-orange-100" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-3 text-[11px] font-normal uppercase tracking-[0.08em] text-slate-400">
                      <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-orange-500" />{lessons} bài học</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-orange-500" />{students} học viên</span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-2xl font-normal leading-tight text-slate-950">{courseTitle(course.title)}</h3>
                    <p className="flex-1 text-sm text-slate-500 leading-relaxed line-clamp-3">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className={`text-lg font-normal ${price > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                        {fp}
                      </span>
                      <Link href={`/khoa-hoc/${course.slug}`} className="rounded-full bg-orange-50 px-4 py-2 text-xs font-normal text-orange-600 ring-1 ring-orange-200 hover:bg-orange-500 hover:text-white transition-all active:scale-95">
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <p className="text-4xl mb-3">🎓</p>
            <p className="text-slate-500">Chưa có khóa học ở cấp độ này.</p>
          </motion.div>
        )}
    </>
  );
}
