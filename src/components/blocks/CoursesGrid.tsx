import React from "react";
import { db } from "@/lib/db";

function fmtVND(price: number | string | { toNumber?: () => number }): string {
  const n = typeof price === "object" && price?.toNumber ? price.toNumber() : Number(price);
  if (!n || n === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDuration(minutes?: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}g ${m}p`;
  if (h) return `${h} giờ`;
  return `${m} phút`;
}

const LEVEL_MAP: Record<string, { label: string; bg: string; color: string }> = {
  beginner:     { label: "Cơ bản",    bg: "#dcfce7", color: "#16a34a" },
  intermediate: { label: "Trung cấp", bg: "#dbeafe", color: "#1d4ed8" },
  advanced:     { label: "Nâng cao",  bg: "#ede9fe", color: "#7c3aed" },
};

interface CoursesGridProps {
  orgId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default async function CoursesGrid({
  orgId,
  limit = 6,
  title = "Khóa học nổi bật",
  subtitle = "Khám phá các khóa học được thiết kế bởi chuyên gia — giúp bạn phát triển kỹ năng toàn diện.",
}: CoursesGridProps) {
  if (!orgId) return null;

  const courses = await db.course.findMany({
    where: {
      organizationId: orgId,
    },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  const isEmpty = courses.length === 0;

  // Gradient fallbacks when no thumbnail
  const gradients = [
    "linear-gradient(135deg,#6366f1,#4f46e5)",
    "linear-gradient(135deg,#0ea5e9,#0284c7)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ec4899,#be185d)",
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  ];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          .course-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.1) !important; }
          .course-card { transition: all .25s ease; }
          .enroll-btn:hover { opacity: .9; transform: translateY(-1px); }`,
        }}
      />
      <section
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#ffffff",
          padding: "96px 40px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 64px" }}>
            <span
              style={{
                display: "inline-block",
                background: "#ede9fe", color: "#7c3aed",
                fontSize: 12, fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", padding: "5px 14px",
                borderRadius: 100, marginBottom: 18,
              }}
            >
              Khóa học
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800, color: "#0f172a",
                lineHeight: 1.15, letterSpacing: "-.03em",
                margin: "0 0 14px",
              }}
            >
              {title}
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#64748b", lineHeight: 1.75, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {isEmpty ? (
            <div
              style={{
                textAlign: "center", padding: "80px 40px",
                border: "2px dashed #e2e8f0", borderRadius: 20,
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                Chưa có khóa học nào được xuất bản
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 28,
              }}
            >
              {courses.map((course, idx) => {
                const level = LEVEL_MAP[course.level] ?? { label: course.level, bg: "#f1f5f9", color: "#64748b" };
                const instructorInitials = (course.instructor.name || "?")
                  .split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();

                return (
                  <div
                    key={course.id}
                    className="course-card"
                    style={{
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 20,
                      overflow: "hidden",
                      background: "white",
                      boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%", height: "100%",
                            background: gradients[idx % gradients.length],
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: 56, opacity: .35 }}>🎓</span>
                        </div>
                      )}

                      {/* Level badge */}
                      <div
                        style={{
                          position: "absolute", top: 14, left: 14,
                          background: level.bg, color: level.color,
                          fontSize: 11, fontWeight: 700,
                          padding: "4px 10px", borderRadius: 100,
                        }}
                      >
                        {level.label}
                      </div>

                      {/* Featured badge */}
                      {course.isFeatured && (
                        <div
                          style={{
                            position: "absolute", top: 14, right: 14,
                            background: "#fef3c7", color: "#d97706",
                            fontSize: 11, fontWeight: 700,
                            padding: "4px 10px", borderRadius: 100,
                          }}
                        >
                          ⭐ Nổi bật
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: 24 }}>
                      <h3
                        style={{
                          fontSize: "1.05rem", fontWeight: 700,
                          color: "#0f172a", margin: "0 0 8px",
                          lineHeight: 1.35,
                        }}
                      >
                        {course.title}
                      </h3>
                      {course.description && (
                        <p
                          style={{
                            fontSize: ".88rem", color: "#64748b",
                            lineHeight: 1.65, margin: "0 0 16px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {course.description}
                        </p>
                      )}

                      {/* Stats row */}
                      <div
                        style={{
                          display: "flex", gap: 16,
                          margin: "0 0 16px",
                          padding: "12px 0",
                          borderTop: "1px solid #f1f5f9",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {course.duration && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 14 }}>⏱</span>
                            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                              {fmtDuration(course.duration)}
                            </span>
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 14 }}>👥</span>
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                            {course._count.enrollments.toLocaleString("vi-VN")} học viên
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 14 }}>📚</span>
                          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                            {course._count.sections} chương
                          </span>
                        </div>
                      </div>

                      {/* Instructor */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        {course.instructor.image ? (
                          <img
                            src={course.instructor.image}
                            alt={course.instructor.name || ""}
                            style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: "#6366f1", color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                            }}
                          >
                            {instructorInitials}
                          </div>
                        )}
                        <span style={{ fontSize: ".85rem", color: "#64748b", fontWeight: 500 }}>
                          {course.instructor.name}
                        </span>
                      </div>

                      {/* Price + CTA */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-.02em" }}>
                            {fmtVND(course.price)}
                          </div>
                          {Number(course.price) > 0 && (
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>một lần</div>
                          )}
                        </div>
                        <a
                          href={`/courses/${course.slug}`}
                          className="enroll-btn"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                            color: "white",
                            fontSize: ".88rem", fontWeight: 700,
                            padding: "10px 18px", borderRadius: 10,
                            textDecoration: "none",
                            boxShadow: "0 4px 14px rgba(124,58,237,.25)",
                            transition: "all .2s",
                          }}
                        >
                          Đăng ký
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
