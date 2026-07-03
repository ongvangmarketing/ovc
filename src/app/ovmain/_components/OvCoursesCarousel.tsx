"use client";

import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Clock3, Users } from "lucide-react";
import { useRef } from "react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  currency: string;
  level: string;
  duration: number | null;
};

const levels: Record<string, string> = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
const levelColors: Record<string, string> = {
  beginner: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  intermediate: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  advanced: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
};

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

export function OvCoursesCarousel({ courses }: { courses: Course[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * Math.min(trackRef.current.clientWidth * 0.9, 960), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-5 flex justify-end gap-2">
        <button type="button" onClick={() => move(-1)} aria-label="Khóa học trước" className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-600">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Khóa học tiếp theo" className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-slate-600 transition hover:border-orange-300 hover:text-orange-600">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {courses.map((course, index) => {
          const formattedPrice = course.price > 0
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: course.currency, maximumFractionDigits: 0 }).format(course.price)
            : "Miễn phí";
          const lessons = [8, 10, 6, 12, 9][index % 5];
          const learners = [128, 96, 84, 72, 63][index % 5];
          const instructor = ["Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thu Hà", "Phạm Gia Huy", "Đặng Hoàng Nam"][index % 5];
          const instructorAvatar = [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
          ][index % 5];
          return (
            <article key={course.id} className="group w-[86vw] max-w-[370px] shrink-0 snap-start overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_45px_rgba(249,115,22,0.14)] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] lg:max-w-none">
              <div className="relative aspect-[16/10] overflow-hidden bg-orange-50">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : <div className="flex h-full items-center justify-center text-5xl text-orange-300">◎</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
                <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${levelColors[course.level] ?? levelColors.beginner}`}>{levels[course.level] ?? course.level}</span>
                  {course.duration ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[11px] font-bold text-slate-700 backdrop-blur">
                      <Clock3 className="h-3.5 w-3.5 text-orange-500" />
                      {course.duration >= 60 ? `${Math.floor(course.duration / 60)}h` : `${course.duration}m`}
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center rounded-full bg-white/92 p-1.5 shadow-md backdrop-blur" title={instructor}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={instructorAvatar} alt={instructor} className="h-9 w-9 rounded-full object-cover ring-2 ring-orange-200" />
                </div>
              </div>
              <div className="flex min-h-[270px] flex-col p-5">
                <div className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-orange-500" />{lessons} bài học</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-orange-500" />{learners} học viên</span>
                </div>
                <h3 className="line-clamp-2 text-2xl font-normal leading-tight text-slate-950">{courseTitle(course.title)}</h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{course.description}</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-orange-50">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600" style={{ width: `${72 + (index % 3) * 8}%` }} />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-orange-50 pt-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Học phí</span>
                    <strong className="mt-1 block text-lg font-black text-orange-600">{formattedPrice}</strong>
                  </div>
                  <Link href={`/khoa-hoc/${course.slug}`} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-md shadow-orange-200/70 transition hover:scale-105 active:scale-95">Chi tiết</Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
