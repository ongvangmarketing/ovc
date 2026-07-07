import React from "react";
import { db } from "@/lib/db";
import LeadFormSubmit from "./LeadFormSubmit";

interface LeadFormBlockProps {
  orgId?: string;
  formId?: string; // "first" | specific ID
  title?: string;
  subtitle?: string;
  layout?: "centered" | "split";
}

export default async function LeadFormBlock({
  orgId,
  formId = "first",
  title,
  subtitle,
  layout = "centered",
}: LeadFormBlockProps) {
  if (!orgId) return null;

  let form;
  try {
    if (formId === "first") {
      form = await db.leadForm.findFirst({
        where: { organizationId: orgId, status: "ACTIVE" },
        include: { fields: { orderBy: { order: "asc" } } },
      });
    } else {
      form = await db.leadForm.findFirst({
        where: { id: formId, organizationId: orgId },
        include: { fields: { orderBy: { order: "asc" } } },
      });
    }
  } catch {
    return null;
  }

  if (!form) {
    return (
      <section
        style={{
          fontFamily: "'Inter', sans-serif",
          padding: "96px 40px",
          background: "#f8fafc",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "60px 40px",
            border: "2px dashed #e2e8f0",
            borderRadius: 20,
            color: "#94a3b8",
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Chưa có form nào được tạo
          </p>
          <p style={{ fontSize: ".88rem", color: "#cbd5e1", margin: "8px 0 0" }}>
            Vào module CRM → Lead Forms để tạo form đầu tiên
          </p>
        </div>
      </section>
    );
  }

  const displayTitle  = title    || form.title       || "Liên hệ với chúng tôi";
  const displaySub    = subtitle || form.description || "Điền thông tin của bạn, chúng tôi sẽ liên hệ sớm nhất có thể.";
  const themeColor    = form.themeColor || "#4f46e5";

  // Prepare fields — parse options JSON
  const fields = form.fields.map((f) => ({
    id: f.id,
    name: f.name,
    label: f.label,
    type: f.type,
    required: f.required,
    placeholder: f.placeholder,
    options: Array.isArray(f.options)
      ? (f.options as Array<{ label: string; value: string }>)
      : null,
  }));

  if (layout === "split") {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`,
          }}
        />
        <section
          style={{
            fontFamily: "'Inter', sans-serif",
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
            padding: "96px 40px",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
            }}
          >
            {/* Left side info */}
            <div>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,.15)",
                  color: "white",
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  padding: "5px 14px", borderRadius: 100,
                  marginBottom: 24,
                }}
              >
                Liên hệ
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                  fontWeight: 800, color: "white",
                  lineHeight: 1.15, letterSpacing: "-.03em",
                  margin: "0 0 20px",
                }}
              >
                {displayTitle}
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "rgba(255,255,255,.7)",
                  lineHeight: 1.75, margin: "0 0 40px",
                }}
              >
                {displaySub}
              </p>

              {/* Trust signals */}
              {[
                { icon: "⚡", text: "Phản hồi trong 24 giờ" },
                { icon: "🔒", text: "Thông tin được bảo mật tuyệt đối" },
                { icon: "🎯", text: "Tư vấn chuyên sâu, miễn phí" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,.1)" : "none",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: ".95rem", color: "rgba(255,255,255,.85)", fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Right side form card */}
            <div
              style={{
                background: "white",
                borderRadius: 24,
                padding: 40,
                boxShadow: "0 32px 80px rgba(0,0,0,.25)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.15rem", fontWeight: 700, color: "#0f172a",
                  margin: "0 0 6px",
                }}
              >
                Gửi yêu cầu ngay
              </h3>
              <p style={{ fontSize: ".88rem", color: "#94a3b8", margin: "0 0 24px" }}>
                Chúng tôi sẽ liên hệ bạn ngay khi nhận được thông tin
              </p>
              <LeadFormSubmit
                formId={form.id}
                fields={fields}
                submitButtonText={form.submitButtonText}
                successMessage={form.successMessage}
                themeColor={themeColor}
                redirectUrl={form.redirectUrl}
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  // Default: centered layout
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`,
        }}
      />
      <section
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#f8fafc",
          padding: "96px 40px",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              style={{
                display: "inline-block",
                background: themeColor + "18",
                color: themeColor,
                fontSize: 12, fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 100,
                marginBottom: 18,
              }}
            >
              Liên hệ
            </span>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 800, color: "#0f172a",
                lineHeight: 1.15, letterSpacing: "-.03em",
                margin: "0 0 14px",
              }}
            >
              {displayTitle}
            </h2>
            <p style={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.75, margin: 0 }}>
              {displaySub}
            </p>
          </div>

          {/* Form card */}
          <div
            style={{
              background: "white",
              border: "1.5px solid #e2e8f0",
              borderRadius: 24,
              padding: 48,
              boxShadow: "0 8px 40px rgba(0,0,0,.06)",
            }}
          >
            {/* Colored top bar */}
            <div
              style={{
                height: 4,
                background: `linear-gradient(90deg, ${themeColor}, ${themeColor}88)`,
                borderRadius: "12px 12px 0 0",
                margin: "-48px -48px 36px",
              }}
            />
            <LeadFormSubmit
              formId={form.id}
              fields={fields}
              submitButtonText={form.submitButtonText}
              successMessage={form.successMessage}
              themeColor={themeColor}
              redirectUrl={form.redirectUrl}
            />
          </div>

          {/* Footer note */}
          <p
            style={{
              textAlign: "center",
              fontSize: ".82rem",
              color: "#94a3b8",
              marginTop: 20,
            }}
          >
            🔒 Thông tin của bạn được bảo mật hoàn toàn
          </p>
        </div>
      </section>
    </>
  );
}
