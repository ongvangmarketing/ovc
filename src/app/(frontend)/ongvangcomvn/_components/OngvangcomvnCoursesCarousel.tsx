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

export function OngvangcomvnCoursesCarousel({ courses }: { courses: Course[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * Math.min(trackRef.current.clientWidth * 0.9, 960), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-8 flex justify-end gap-3">
        <button type="button" onClick={() => move(-1)} aria-label="Trang trước" className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors hover:bg-gray-50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Trang sau" className="flex h-12 w-12 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-black transition-colors hover:bg-gray-50">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      <div ref={trackRef} className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            <article key={course.id} className="group w-[86vw] max-w-[420px] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#eaeaea] bg-white transition-colors duration-200 hover:border-gray-300 sm:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] lg:max-w-none flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 border-b border-[#eaeaea]">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-700 grayscale group-hover:grayscale-0" />
                ) : <div className="flex h-full items-center justify-center text-5xl text-gray-300">◎</div>}
                
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-black border border-[#eaeaea]">
                    {levels[course.level] ?? course.level}
                  </span>
                  {course.duration ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-black border border-[#eaeaea]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {course.duration >= 60 ? `${Math.floor(course.duration / 60)}h` : `${course.duration}m`}
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-5 right-5 flex items-center rounded-full bg-white p-1 border border-[#eaeaea]" title={instructor}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={instructorAvatar} alt={instructor} className="h-10 w-10 rounded-full object-cover" />
                </div>
              </div>
              <div className="flex flex-col flex-1 p-8">
                <div className="mb-5 flex items-center gap-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{lessons} bài học</span>
                  <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{learners} học viên</span>
                </div>
                <h3 className="line-clamp-2 text-[24px] font-medium tracking-tight text-black">{courseTitle(course.title)}</h3>
                <p className="mt-4 line-clamp-3 flex-1 text-[15px] leading-relaxed text-gray-500">{course.description}</p>
                <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-black" style={{ width: `${72 + (index % 3) * 8}%` }} />
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[#eaeaea] pt-6">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Học phí</span>
                    <strong className="mt-1 block text-[18px] font-medium text-black">{formattedPrice}</strong>
                  </div>
                  <Link href={`/khoa-hoc/${course.slug}`} className="rounded-full bg-black px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
                    Chi tiết
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
