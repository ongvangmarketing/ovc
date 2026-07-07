"use client";

import React, { useEffect, useRef, useState } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import blocksBasic from "grapesjs-blocks-basic";
import businessBlocksPlugin from "./plugins/business-blocks";
import { setupJsonStorage } from "./storage/json-storage";

// ── Inject light-theme overrides into GrapeJS panel ──────────────────────────
const GJS_LIGHT_CSS = `
  .gjs-pn-panels{background:#f8fafc;border-left:1px solid #e2e8f0}
  .gjs-pn-panel{background:#f8fafc;border-color:#e2e8f0}
  .gjs-pn-views{background:#f8fafc;border-color:#e2e8f0}
  .gjs-pn-views-container{background:#f8fafc}
  .gjs-block-categories{background:#f8fafc;padding:8px}
  .gjs-block-category{border:none;margin-bottom:4px}
  .gjs-block-category .gjs-title{
    background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:.07em;padding:8px 12px;
    border-radius:6px;border:none;cursor:pointer
  }
  .gjs-block-category .gjs-title:hover{background:#e2e8f0;color:#1e293b}
  .gjs-block-category__label{color:#475569;font-size:10px;font-weight:700;
    text-transform:uppercase;letter-spacing:.07em}
  .gjs-blocks-c{padding:8px;gap:8px;display:grid;grid-template-columns:1fr 1fr}
  .gjs-block-category:has(.gjs-block[data-category="Data Blocks ⚡"]) .gjs-blocks-c,
  .gjs-block-categories .gjs-block-category:nth-last-child(1) .gjs-blocks-c{
    grid-template-columns:1fr
  }
  .gjs-block[title*="Live"] .gjs-block__media,
  .gjs-block[title*="live"] .gjs-block__media{height:110px}

  .gjs-block{
    border:1.5px solid #e2e8f0;border-radius:10px;background:white;
    overflow:hidden;padding:0;margin:0;min-height:96px;
    box-shadow:0 1px 3px rgba(0,0,0,.04);transition:all .15s
  }
  .gjs-block:hover{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1),0 2px 8px rgba(0,0,0,.08);transform:translateY(-1px)}
  .gjs-block__media{height:72px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f8fafc}
  .gjs-block__media img{width:100%;height:100%;object-fit:cover}
  .gjs-block__media svg{width:28px;height:28px;color:#94a3b8}
  .gjs-block__label{color:#374151;font-size:10px;font-weight:600;padding:5px 6px 6px;text-align:center;line-height:1.3;background:white}
  .gjs-cv-canvas{background:#f1f5f9}
  .gjs-frame-wrapper{box-shadow:0 8px 40px rgba(0,0,0,.12)}
  .gjs-toolbar{background:#1e293b;border-radius:8px;padding:4px;gap:2px}
  .gjs-toolbar-item{border-radius:6px;color:#e2e8f0;padding:4px 6px}
  .gjs-toolbar-item:hover{background:rgba(255,255,255,.1);color:white}
  .gjs-rte-toolbar{border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);background:white;padding:4px}
  .gjs-sm-sector{background:#f8fafc;border-color:#e2e8f0;border-radius:8px;margin:4px;overflow:hidden}
  .gjs-sm-sector .gjs-sm-title{background:#f1f5f9;color:#374151;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:8px 12px;border-bottom:1px solid #e2e8f0}
  .gjs-sm-properties{padding:8px}
  .gjs-sm-property .gjs-sm-label{color:#475569;font-size:11px;font-weight:600}
  .gjs-field{border:1.5px solid #e2e8f0;border-radius:6px;background:white;color:#374151}
  .gjs-field:focus-within{border-color:#6366f1}
  .gjs-trt-header{color:#374151;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;padding:8px 12px;background:#f1f5f9;border-bottom:1px solid #e2e8f0}
  .gjs-trt-trait{padding:8px 12px;border-bottom:1px solid #f1f5f9}
  .gjs-trt-trait__label{color:#475569;font-size:11px;font-weight:600}
  .gjs-layer{background:white;border-color:#e2e8f0;color:#374151;font-size:12px}
  .gjs-layer.gjs-selected{background:#ede9fe;border-color:#6366f1}
  .gjs-layer:hover{background:#f8fafc}
  .gjs-layer__icon svg{color:#94a3b8}
  .gjs-color-picker-tooltip{border-radius:10px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15)}
  .gjs-pn-btn{color:#64748b;border-radius:6px;padding:4px 6px;transition:all .15s}
  .gjs-pn-btn:hover{background:#f1f5f9;color:#1e293b}
  .gjs-pn-btn.gjs-pn-active{background:#ede9fe;color:#6366f1}
  .gjs-pn-views .gjs-pn-btn{font-size:11px;font-weight:600}
  .gjs-selected{outline:2px solid #6366f1!important;outline-offset:1px}
`;

type DeviceType = "desktop" | "tablet" | "mobile";

const ICON_BTN: React.CSSProperties = {
  width: 34, height: 34,
  display: "flex", alignItems: "center", justifyContent: "center",
  border: "none", borderRadius: 8, background: "transparent",
  color: "#6b7280", cursor: "pointer", transition: "all .15s",
  flexShrink: 0,
};

export default function EditorClient({
  pageId, content, slug,
}: {
  pageId: string; content?: any; slug?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [savedMsg, setSavedMsg] = useState<"idle" | "saving" | "saved">("idle");
  const [device, setDevice] = useState<DeviceType>("desktop");

  useEffect(() => {
    // Inject GrapeJS light theme CSS
    const styleTag = document.createElement("style");
    styleTag.id = "gjs-light-theme";
    styleTag.innerHTML = GJS_LIGHT_CSS;
    document.head.appendChild(styleTag);

    if (!editorRef.current) return;

    const e = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      width: "auto",
      height: "100%",
      storageManager: { type: "json-storage", autoload: false, autosave: false },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "768px" },
          { name: "Mobile", width: "390px", widthMedia: "390px" },
        ],
      },
      plugins: [blocksBasic, businessBlocksPlugin],
      pluginsOpts: { [blocksBasic as any]: { flexGrid: true } },
    });

    setupJsonStorage(e, pageId);

    fetch(`/api/builder/page/${pageId}`)
      .then((r) => r.json())
      .then((data) => { if (data?.content) e.loadProjectData(data.content); })
      .catch((err) => console.error("Error loading project data:", err));

    setEditor(e);
    return () => {
      e.destroy();
      document.getElementById("gjs-light-theme")?.remove();
    };
  }, [pageId]);

  const switchDevice = (d: DeviceType) => {
    setDevice(d);
    const map: Record<DeviceType, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };
    editor?.setDevice(map[d]);
  };

  const handleSave = async () => {
    if (!editor) return;
    setSavedMsg("saving");
    try {
      await editor.store();
      setSavedMsg("saved");
      setTimeout(() => setSavedMsg("idle"), 2500);
    } catch {
      setSavedMsg("idle");
      alert("Lỗi khi lưu bản nháp!");
    }
  };

  const handlePublish = async () => {
    if (!editor) return;
    setPublishing(true);
    try {
      await editor.store();
      const res = await fetch(`/api/builder/page/${pageId}/publish`, { method: "POST" });
      if (res.ok) alert("✅ Đã xuất bản trang thành công!");
      else alert("Lỗi khi xuất bản trang");
    } catch {
      alert("Lỗi khi xuất bản trang");
    }
    setPublishing(false);
  };

  const devices: { key: DeviceType; icon: React.ReactNode; label: string }[] = [
    {
      key: "desktop", label: "Desktop",
      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4"/></svg>,
    },
    {
      key: "tablet", label: "Tablet",
      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>,
    },
    {
      key: "mobile", label: "Mobile",
      icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f1f5f9" }}>

      {/* ── Top Bar ── */}
      <header style={{
        flexShrink: 0, height: 52, background: "white",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px", gap: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,.05)",
        zIndex: 100,
      }}>

        {/* Left – Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "white", letterSpacing: -.5,
          }}>OV</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>Web Builder</div>
            {slug && <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>/{slug}</div>}
          </div>
          <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />
          {/* Undo / Redo */}
          <button title="Undo (Ctrl+Z)" onClick={() => editor?.UndoManager.undo()} style={ICON_BTN}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a7 7 0 017 7v1M3 10l6-6M3 10l6 6"/></svg>
          </button>
          <button title="Redo (Ctrl+Y)" onClick={() => editor?.UndoManager.redo()} style={ICON_BTN}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a7 7 0 00-7 7v1M21 10l-6-6M21 10l-6 6"/></svg>
          </button>
        </div>

        {/* Center – Device switcher */}
        <div style={{
          display: "flex", background: "#f1f5f9", borderRadius: 10,
          padding: 3, gap: 2, border: "1px solid #e2e8f0",
        }}>
          {devices.map((d) => (
            <button
              key={d.key}
              title={d.label}
              onClick={() => switchDevice(d.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 7, border: "none",
                cursor: "pointer", transition: "all .15s",
                background: device === d.key ? "white" : "transparent",
                color: device === d.key ? "#1e293b" : "#94a3b8",
                fontWeight: device === d.key ? 700 : 500,
                fontSize: 12,
                boxShadow: device === d.key ? "0 1px 4px rgba(0,0,0,.1)" : "none",
              }}
            >
              {d.icon}
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {/* Right – Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {/* Import HTML */}
          <input type="file" accept=".html" ref={fileInputRef} style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file || !editor) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const html = ev.target?.result as string;
                if (html) editor.setComponents(html);
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import HTML file"
            style={{
              ...ICON_BTN, width: "auto", padding: "0 12px",
              border: "1.5px solid #e2e8f0", color: "#475569",
              fontSize: 12, fontWeight: 600, gap: 6,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Import
          </button>

          {/* Preview */}
          {pageId && (
            <a
              href={`/preview/${pageId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 12px", height: 34, borderRadius: 8,
                border: "1.5px solid #e2e8f0", color: "#475569",
                fontSize: 12, fontWeight: 600, textDecoration: "none",
                background: "white", transition: "all .15s",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Preview
            </a>
          )}

          {/* Save Draft */}
          <button
            onClick={handleSave}
            disabled={savedMsg === "saving"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 14px", height: 34, borderRadius: 8,
              border: `1.5px solid ${savedMsg === "saved" ? "#86efac" : "#e2e8f0"}`,
              background: savedMsg === "saved" ? "#f0fdf4" : "white",
              color: savedMsg === "saved" ? "#16a34a" : "#374151",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all .2s",
            }}
          >
            {savedMsg === "saving" ? (
              <>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V4"/></svg>
                Saving…
              </>
            ) : savedMsg === "saved" ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Saved
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                Save Draft
              </>
            )}
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 16px", height: 34, borderRadius: 8,
              background: publishing
                ? "#94a3b8"
                : "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "white", fontSize: 12, fontWeight: 700,
              border: "none", cursor: publishing ? "not-allowed" : "pointer",
              boxShadow: publishing ? "none" : "0 2px 10px rgba(99,102,241,.35)",
              letterSpacing: -.2, transition: "all .2s",
            }}
          >
            {publishing ? "Publishing…" : (
              <>
                Publish
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── GrapeJS Canvas ── */}
      <div id="gjs" ref={editorRef} style={{ flex: 1, overflow: "hidden" }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
