"use client";

import React, { useState, useRef } from "react";

interface Field {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string | null;
  options?: Array<{ label: string; value: string }> | null;
}

interface LeadFormSubmitProps {
  formId: string;
  fields: Field[];
  submitButtonText: string;
  successMessage: string;
  themeColor: string;
  redirectUrl?: string | null;
}

export default function LeadFormSubmit({
  formId,
  fields,
  submitButtonText,
  successMessage,
  themeColor,
  redirectUrl,
}: LeadFormSubmitProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    // Gather UTM + tracking
    const searchParams = new URLSearchParams(window.location.search);
    const fullName = (values["name"] || values["fullName"] || values["họ_tên"] || "") as string;
    const email   = (values["email"] || "") as string;
    const phone   = (values["phone"] || values["điện_thoại"] || values["sdt"] || "") as string;

    try {
      const res = await fetch("/api/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          fullName,
          email,
          phone,
          extraFields: values,
          utmSource: searchParams.get("utm_source") || "Web Builder",
          utmMedium: searchParams.get("utm_medium") || "organic",
          utmCampaign: searchParams.get("utm_campaign") || "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          url: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (res.ok) {
        setStatus("success");
        formRef.current?.reset();
        if (redirectUrl) {
          setTimeout(() => (window.location.href = redirectUrl), 1800);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Không thể kết nối. Vui lòng kiểm tra kết nối mạng.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
          background: "#f0fdf4",
          borderRadius: 16,
          border: "1.5px solid #86efac",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#15803d", margin: "0 0 8px" }}>
          Đã gửi thành công!
        </h3>
        <p style={{ fontSize: ".95rem", color: "#166534", margin: 0 }}>{successMessage}</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: ".95rem",
    color: "#0f172a",
    fontFamily: "inherit",
    outline: "none",
    background: "white",
    transition: "border-color .15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: ".85rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {fields.map((field) => {
        const common = {
          id: field.id,
          name: field.name,
          required: field.required,
          placeholder: field.placeholder ?? "",
          style: inputStyle,
          "aria-label": field.label,
          disabled: status === "loading",
        } as React.InputHTMLAttributes<HTMLInputElement>;

        return (
          <div key={field.id}>
            <label htmlFor={field.id} style={labelStyle}>
              {field.label}
              {field.required && (
                <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>
              )}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder ?? ""}
                rows={4}
                disabled={status === "loading"}
                aria-label={field.label}
                style={{ ...inputStyle, resize: "none" }}
              />
            ) : field.type === "select" && field.options ? (
              <select
                id={field.id}
                name={field.name}
                required={field.required}
                disabled={status === "loading"}
                aria-label={field.label}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">— Chọn {field.label} —</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  cursor: "pointer",
                  fontWeight: 400,
                  fontSize: ".9rem",
                  color: "#374151",
                }}
              >
                <input
                  type="checkbox"
                  id={field.id}
                  name={field.name}
                  required={field.required}
                  disabled={status === "loading"}
                  style={{ marginTop: 2, accentColor: themeColor, width: 16, height: 16 }}
                />
                {field.placeholder || field.label}
              </label>
            ) : (
              <input type={field.type || "text"} {...common} />
            )}
          </div>
        );
      })}

      {status === "error" && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            fontSize: ".88rem",
            color: "#dc2626",
          }}
        >
          {errorMsg || "Đã xảy ra lỗi. Vui lòng thử lại."}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          padding: "14px 24px",
          borderRadius: 12,
          border: "none",
          background: status === "loading" ? "#94a3b8" : themeColor,
          color: "white",
          fontSize: ".97rem",
          fontWeight: 700,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: status === "loading" ? "none" : `0 6px 20px ${themeColor}45`,
          transition: "all .2s",
          letterSpacing: "-.01em",
        }}
      >
        {status === "loading" ? (
          <>
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V4" />
            </svg>
            Đang gửi…
          </>
        ) : (
          <>
            {submitButtonText}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
