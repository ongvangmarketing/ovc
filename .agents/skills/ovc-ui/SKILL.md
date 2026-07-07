---
name: "ovc-ui"
description: "Guidelines and standard UI components for building Ong Vang Cloud (OVC) panels and pages."
---

# OVC UI Guidelines

When building or refactoring UI components for Ong Vang Cloud (OVC), specifically Settings, CRM, Training, or any internal management panels, you MUST adhere to the following UI standards and use the predefined global CSS classes. 

**DO NOT** use generic Tailwind utility classes (e.g. `rounded-2xl border border-slate-200 bg-white p-6`) for major layout panels. 

Instead, use the existing design system classes built into `globals.css`.

## 1. Page Layout Wrapper (`quote-page`)

Every major settings or management page should be wrapped in the `quote-page` container.

```tsx
<div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
  {/* Page Header */}
  {/* Page Content */}
</div>
```

## 2. Page Header

The page header uses a flex layout with a bottom border and contains the breadcrumb/title on the left, and primary actions on the right.

```tsx
<div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
  <div>
    <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
      <IconName className="h-4 w-4 text-orange-500" />
      Danh mục / Tên trang
    </div>
    <h1 className="text-[14px] font-light text-slate-950">Mô tả trang hoặc Tiêu đề phụ</h1>
  </div>
  
  <div className="flex items-center gap-3">
    <button className="quote-action-button quote-action-secondary">
      Nút phụ
    </button>
    <button className="quote-action-button quote-action-primary">
      <Plus className="h-4 w-4" />
      Nút chính
    </button>
  </div>
</div>
```

## 3. Panels (`quote-panel` and `quote-panel-header`)

For grouping content or forms, always use `quote-panel`.

```tsx
<div className="space-y-5">
  <section className="quote-panel">
    <div className="quote-panel-header">
      <h2>Tiêu đề Panel</h2>
      <span>Mô tả ngắn gọn về chức năng của panel này.</span>
    </div>
    
    <div className="grid gap-4">
      {/* Content or form inputs go here */}
    </div>
  </section>
</div>
```

## 4. Form Inputs (`quote-input`)

Standard form inputs and textareas should use the `quote-input` class. Use a `<label>` block with a standard `<span>` for the label text.

```tsx
<label className="block">
  <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên nhãn <span className="text-red-500">*</span></span>
  <input 
    className="quote-input" 
    placeholder="Nhập giá trị..." 
  />
</label>
```

## 5. Action Buttons

Always use the standard action buttons rather than composing custom tailwind buttons.

- **Primary Button (Orange):** `<button className="quote-action-button quote-action-primary">`
- **Secondary Button (White/Gray):** `<button className="quote-action-button quote-action-secondary">`

## Summary Checklist
- [ ] Are you building a full-page feature? Wrap it in `<div className="quote-page mx-auto max-w-[1440px] px-6 py-6">`.
- [ ] Are you grouping information? Use `<section className="quote-panel">`.
- [ ] Do you need an input? Use `<input className="quote-input" />`.
- [ ] Do you need a button? Use `quote-action-button quote-action-primary` or `secondary`.
- [ ] Ensure typography inside labels uses `font-light` and `text-[15px]`.
