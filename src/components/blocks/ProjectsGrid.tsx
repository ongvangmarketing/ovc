import React from "react";
import { db } from "@/lib/db";

const FONT = `<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');</style>`;

function fmtVND(price: number | string | { toNumber?: () => number }): string {
  const n = typeof price === "object" && price?.toNumber ? price.toNumber() : Number(price);
  if (!n) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "#8b5cf6",
  ACTIVE: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  ON_HOLD: "#ef4444",
  COMPLETED: "#10b981",
  ARCHIVED: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  PLANNING: "Lên kế hoạch",
  ACTIVE: "Đang triển khai",
  IN_PROGRESS: "Đang thực hiện",
  ON_HOLD: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};

function Avatar({ name, image }: { name: string; image?: string | null }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
  const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid white", objectFit: "cover",
          marginRight: -8,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: color, color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700,
        border: "2px solid white",
        marginRight: -8, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

interface ProjectsGridProps {
  orgId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default async function ProjectsGrid({
  orgId,
  limit = 6,
  title = "Dự án tiêu biểu",
  subtitle = "Những dự án chúng tôi đã và đang triển khai thành công cùng khách hàng.",
}: ProjectsGridProps) {
  if (!orgId) return null;

  const rawProjects = await db.project.findMany({
    where: {
      organizationId: orgId,
      isArchived: false,
    },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
        take: 4,
        orderBy: { joinedAt: "asc" },
      },
      tasks: { select: { id: true, status: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
  });

  const projects = rawProjects.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.status === "DONE").length;
    return { ...p, progress: total > 0 ? Math.round((done / total) * 100) : 0, taskCount: total };
  });

  const isEmpty = projects.length === 0;

  return (
    <>
      {/* @ts-ignore */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');` }} />
      <section
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#f8fafc",
          padding: "96px 40px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 64px" }}>
            <span
              style={{
                display: "inline-block",
                background: "#dbeafe", color: "#1d4ed8",
                fontSize: 12, fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", padding: "5px 14px",
                borderRadius: 100, marginBottom: 18,
              }}
            >
              Dự án
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
              <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                Chưa có dự án nào để hiển thị
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 24,
              }}
            >
              {projects.map((project) => {
                const statusColor = STATUS_COLORS[project.status] || "#6b7280";
                const statusLabel = STATUS_LABELS[project.status] || project.status;
                const members = project.members.slice(0, 4);

                return (
                  <div
                    key={project.id}
                    style={{
                      background: "white",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 20,
                      padding: 28,
                      boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                      transition: "all .2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Color accent bar */}
                    <div
                      style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: 4,
                        background: project.color || statusColor,
                        borderRadius: "20px 20px 0 0",
                      }}
                    />

                    {/* Header row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 16,
                        marginTop: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        {project.icon && (
                          <span style={{ fontSize: 22 }}>{project.icon}</span>
                        )}
                        <h3
                          style={{
                            fontSize: "1.05rem", fontWeight: 700,
                            color: "#0f172a", margin: 0,
                            overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.name}
                        </h3>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          background: statusColor + "18",
                          color: statusColor,
                          fontSize: 11, fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 100,
                          border: `1px solid ${statusColor}30`,
                          marginLeft: 10,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p
                        style={{
                          fontSize: ".88rem", color: "#64748b",
                          lineHeight: 1.65, margin: "0 0 20px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </p>
                    )}

                    {/* Progress bar */}
                    <div style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                          Tiến độ
                        </span>
                        <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6, background: "#f1f5f9",
                          borderRadius: 100, overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${project.progress}%`,
                            background: project.progress >= 80
                              ? "#10b981"
                              : project.progress >= 40
                              ? "#3b82f6"
                              : "#f59e0b",
                            borderRadius: 100,
                            transition: "width .6s ease",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        {project.tasks.filter((t) => t.status === "DONE").length}/{project.taskCount} tasks
                      </div>
                    </div>

                    {/* Meta info */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px 16px",
                        marginBottom: 20,
                        padding: "14px 0",
                        borderTop: "1px solid #f1f5f9",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {project.budget && (
                        <div>
                          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Ngân sách</div>
                          <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                            {fmtVND(project.budget)}
                          </div>
                        </div>
                      )}
                      {project.dueDate && (
                        <div>
                          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Deadline</div>
                          <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                            {new Date(project.dueDate).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Ưu tiên</div>
                        <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                          {{ LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn" }[project.priority] ?? project.priority}
                        </div>
                      </div>
                    </div>

                    {/* Footer: avatars + owner */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {members.map((m) => (
                          <Avatar key={m.id} name={m.user.name ?? "?"} image={m.user.image} />
                        ))}
                        {project.members.length > 4 && (
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: "#f1f5f9", color: "#64748b",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                              border: "2px solid white",
                            }}
                          >
                            +{project.members.length - 4}
                          </div>
                        )}
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
