import React from "react";
import { db } from "@/lib/db";

function fmtVND(price: number | string | { toNumber?: () => number }): string {
  const n = typeof price === "object" && price?.toNumber ? price.toNumber() : Number(price);
  if (!n || n === 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

interface ServicesGridProps {
  orgId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default async function ServicesGrid({
  orgId,
  limit = 6,
  title = "Dịch vụ của chúng tôi",
  subtitle = "Giải pháp toàn diện, được thiết kế riêng cho từng nhu cầu doanh nghiệp của bạn.",
}: ServicesGridProps) {
  if (!orgId) return null;

  const services = await db.service.findMany({
    where: { organizationId: orgId },
    include: {
      category: { select: { id: true, name: true } },
      options: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
    take: limit,
  });

  const isEmpty = services.length === 0;

  // Color palette for cards
  const accents = [
    { border: "#6366f1", bg: "#eef2ff", icon: "#6366f1" },
    { border: "#0ea5e9", bg: "#e0f2fe", icon: "#0ea5e9" },
    { border: "#10b981", bg: "#d1fae5", icon: "#10b981" },
    { border: "#f59e0b", bg: "#fef3c7", icon: "#f59e0b" },
    { border: "#ec4899", bg: "#fce7f3", icon: "#ec4899" },
    { border: "#8b5cf6", bg: "#ede9fe", icon: "#8b5cf6" },
  ];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          .svc-card:hover { transform: translateY(-4px); box-shadow: 0 20px 56px rgba(0,0,0,.1) !important; }
          .svc-card { transition: all .25s ease; }
          .svc-cta:hover { opacity: .9; }`,
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
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 64px" }}>
            <span
              style={{
                display: "inline-block",
                background: "#fef3c7", color: "#d97706",
                fontSize: 12, fontWeight: 700, letterSpacing: ".08em",
                textTransform: "uppercase", padding: "5px 14px",
                borderRadius: 100, marginBottom: 18,
              }}
            >
              Dịch vụ
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
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
              <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                Chưa có dịch vụ nào được thêm vào
              </p>
              <p style={{ fontSize: ".88rem", color: "#cbd5e1", margin: "8px 0 0" }}>
                Vào module Dịch vụ để thêm dịch vụ mới
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
              {services.map((service, idx) => {
                const accent = accents[idx % accents.length]!;
                const options = service.options;
                const firstOpt = options[0];
                const minPrice = firstOpt
                  ? options.reduce(
                      (min, o) => (Number(o.price) < Number(min) ? o.price : min),
                      firstOpt.price
                    )
                  : null;
                const rawFeatures = firstOpt?.featuresJson;
                const featuredFeatures: string[] = (Array.isArray(rawFeatures)
                  ? rawFeatures.filter((f): f is string => typeof f === "string")
                  : []).slice(0, 4);

                return (
                  <div
                    key={service.id}
                    className="svc-card"
                    style={{
                      background: "#fafafa",
                      border: `1.5px solid #f1f5f9`,
                      borderRadius: 20,
                      padding: 32,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${accent.border}, ${accent.border}88)`,
                        borderRadius: "20px 20px 0 0",
                      }}
                    />

                    {/* Category badge */}
                    {service.category && (
                      <span
                        style={{
                          display: "inline-block",
                          background: accent.bg, color: accent.icon,
                          fontSize: 11, fontWeight: 700,
                          padding: "3px 10px", borderRadius: 100,
                          marginBottom: 16, marginTop: 4,
                        }}
                      >
                        {service.category.name}
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        width: 52, height: 52,
                        background: accent.bg,
                        borderRadius: 14,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 20,
                        fontSize: 24,
                      }}
                    >
                      🛠️
                    </div>

                    {/* Name */}
                    <h3
                      style={{
                        fontSize: "1.15rem", fontWeight: 800,
                        color: "#0f172a", margin: "0 0 10px",
                        lineHeight: 1.25,
                      }}
                    >
                      {service.name}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p
                        style={{
                          fontSize: ".92rem", color: "#64748b",
                          lineHeight: 1.7, margin: "0 0 20px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {service.description}
                      </p>
                    )}

                    {/* Features list */}
                    {featuredFeatures.length > 0 && (
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                        {featuredFeatures.map((f, fi) => (
                          <li
                            key={fi}
                            style={{
                              display: "flex", alignItems: "center", gap: 8,
                              fontSize: ".88rem", color: "#374151",
                              padding: "5px 0",
                              borderBottom: fi < featuredFeatures.length - 1 ? "1px solid #f1f5f9" : "none",
                            }}
                          >
                            <svg width="14" height="14" fill="none" stroke={accent.icon} strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {String(f)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Options pills */}
                    {options.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                        {options.slice(0, 3).map((opt) => (
                          <span
                            key={opt.id}
                            style={{
                              background: "white",
                              border: `1px solid #e2e8f0`,
                              color: "#374151",
                              fontSize: 11, fontWeight: 600,
                              padding: "4px 10px", borderRadius: 100,
                            }}
                          >
                            {opt.name}
                            {opt.durationText && ` · ${opt.durationText}`}
                          </span>
                        ))}
                        {options.length > 3 && (
                          <span
                            style={{
                              background: "white", border: "1px solid #e2e8f0",
                              color: "#94a3b8",
                              fontSize: 11, padding: "4px 10px", borderRadius: 100,
                            }}
                          >
                            +{options.length - 3} gói
                          </span>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        {minPrice && Number(minPrice) > 0 ? (
                          <>
                            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginBottom: 2 }}>
                              Bắt đầu từ
                            </div>
                            <div
                              style={{
                                fontSize: "1.2rem", fontWeight: 800,
                                color: accent.icon, letterSpacing: "-.02em",
                              }}
                            >
                              {fmtVND(minPrice)}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#64748b" }}>
                            Liên hệ báo giá
                          </div>
                        )}
                      </div>
                      <a
                        href="#contact"
                        className="svc-cta"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: accent.border,
                          color: "white",
                          fontSize: ".88rem", fontWeight: 700,
                          padding: "10px 18px", borderRadius: 10,
                          textDecoration: "none",
                          boxShadow: `0 4px 14px ${accent.border}35`,
                          transition: "all .2s",
                        }}
                      >
                        Tư vấn ngay
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
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
