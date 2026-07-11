---
name: vercel-ui
description: Guidelines and standard UI components for building pages using Vercel Minimalist UI style. Trigger this skill whenever the user asks for "Vercel UI", "Vercel style", "thiết kế Vercel", or "minimalist Vercel design".
---

# Vercel Minimalist Design System Guidelines

This skill defines the principles and implementation details for the Vercel Minimalist UI style. When applying this skill, your goal is to create a hyper-clean, professional, and data-centric aesthetic.

## Core Philosophy
- **Flat & Sharp**: No box shadows (`shadow-none`), no soft gradients. Everything is flat.
- **High Contrast**: Use stark pure black (`text-black`, `bg-black`) and pure white (`bg-white`).
- **Thin Borders**: Use `#eaeaea` for borders (`border-[#eaeaea]`). This is the signature Vercel separator color.
- **Small Radii**: Use smaller border radii (e.g., `rounded-md` which is 6px, up to `rounded-2xl` for large structural containers, but avoid fully rounded pill shapes unless it's a specific badge).
- **Typography First**: 
  - Massive, tight headings (e.g., `text-[48px] md:text-[56px] tracking-tighter leading-none`).
  - Small, uppercase, widely spaced labels for metadata (e.g., `text-[11px] uppercase tracking-widest text-gray-400 font-medium`).
- **Dev-Centric Vibe**: The UI should feel like a precision tool for engineers.

## Specific Tokens & Classes

### 1. Typography
- **Hero Title**: `text-[48px] md:text-[60px] font-medium tracking-tighter leading-[1.05] text-black`
- **Section Title**: `text-[24px] font-medium tracking-tight text-black`
- **Subtext / Descriptions**: `text-[16px] text-gray-500 leading-relaxed`
- **Metadata / Small Headers**: `text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400`

### 2. Borders & Separators
- **Standard Border**: `border border-[#eaeaea]`
- **Dividers**: `border-t border-[#eaeaea]` or `border-b border-[#eaeaea]`

### 3. Cards & Containers
- **Main Container**: `rounded-2xl border border-[#eaeaea] bg-white p-8 md:p-10`
- **Hover Effects on Cards**: Add `hover:border-gray-300 transition-colors duration-200` to make the border slightly darker on hover. Do NOT add hover shadows.

### 4. Badges (Status Pills)
- **Neutral**: `rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black`
- **Success**: `rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-medium uppercase tracking-widest`
- **Warning/Pending**: `rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest`

### 5. Buttons
- **Primary Action**: `rounded-full bg-black text-white px-6 py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors`
- **Secondary Action**: `rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors`

## Implementation Workflow
1. Strip away all `shadow-*` utility classes.
2. Replace rounded corners over `16px` with tighter corners unless it's a structural outer box.
3. Replace generic gray borders with `#eaeaea` borders.
4. Scale up heading sizes significantly and apply `tracking-tighter`.
5. Ensure empty states and loaders look structural (e.g., dashed thin borders, gray monochrome icons).

## Specialized Patterns (Newly Added)

### 1. Settings Card Pattern (`SettingCard`)
A staple for configuration pages. Consists of:
- **Header**: Title and description.
- **Body**: Input fields or toggles.
- **Footer**: Action buttons (e.g., "Save changes") with a slightly different background (e.g., `bg-gray-50/50`) and a top border.

### 2. Split-Screen Checkout
For payment and billing pages:
- Use a 2-column layout (`lg:flex-row`).
- **Left Column**: Payment methods (Credit Card, QR Code) using large radio box options.
- **Right Column**: Sticky invoice summary (`sticky top-24`) showing line items, subtotal, and large total amount.

### 3. Radio Box Options
Instead of standard radio buttons, use styled cards:
- Hide the native input (`peer sr-only`).
- Style the label as a card (`border border-[#eaeaea] bg-white p-5 hover:border-black`).
- Use `peer-checked:border-[6px] peer-checked:border-black` to create a prominent selection indicator.

### 4. Global Search (`CmdK`)
Use the `cmdk` library for global search.
- Clean, unstyled input inside an animated modal (`animate-in fade-in zoom-in-95`).
- Grouped results with small uppercase headings (`tracking-widest`).

### 5. Sidebar Callout Boxes
For important info in sidebars, avoid heavy dark mode blocks (`bg-black` with white text) as they can feel too heavy or distracting on a light page. Instead, use light-tinted cards:
- **Error/Warning Callout**: Light red background (`bg-red-50/50`), red borders (`border-red-100`), and dark red text (`text-red-900`) with a solid accent button (`bg-red-600`).
- **Brand Accent Callout**: Light gradient (e.g., `bg-gradient-to-b from-orange-50/80 to-white`) with thin borders (`border-[#eaeaea]`) and matching icons.

### 6. Breadcrumbs
- **Avoid Traditional Breadcrumbs**: Do not use standard hierarchical breadcrumbs (e.g. `Page / Subpage / Current`). Vercel Minimalist UI favors clean, un-cluttered headers. If navigation is necessary, use a simple `<- Back` link or rely on the primary navigation.
