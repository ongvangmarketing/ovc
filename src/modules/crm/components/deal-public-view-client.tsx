"use client";

import React, { useState } from 'react';
import { submitDealSelectionAction } from '@/modules/crm/actions/deals.actions';
import { TiptapEditor } from "@/components/ui/tiptap-editor";

export function DealPublicViewClient({ data }: { data: any }) {
    const [selectedIds, setSelectedIds] = useState<string[]>(
        (data.serviceOptions || [])
            .filter((o: any) => o.status === 'CUSTOMER_SELECTED')
            .map((o: any) => o.id)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [customerNote, setCustomerNote] = useState("");
    
    // Computed values
    const company = data.organization || {};
    const customer = data.contact || data.customer || {};
    const objectFields = (value: any) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    
    const customerPerson = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '';
    const customerCompanyObject = typeof customer.company === 'object' && customer.company ? customer.company : {};
    const customerCompany = typeof customer.company === 'string' ? customer.company : customer.company?.name || '';
    const customerCompanyTaxCode = (customerCompanyObject.customFields?.taxCode) || customer.companyTaxCode || (customer.customFields?.companyTaxCode) || '';
    const isCompanyCustomer = Boolean(customerCompany && (customerCompanyTaxCode || customerCompanyObject.address));
    const customerPhone = customerCompanyObject.phone || customer.phone || customer.mobile || '';
    const customerEmail = customerCompanyObject.email || customer.email || '';
    const customerAddress = isCompanyCustomer ? (customerCompanyObject.address || customer.address || '') : (customer.address || '');

    const [contactInfo, setContactInfo] = useState({
        name: isCompanyCustomer ? customerCompany : customerPerson,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        taxCode: customerCompanyTaxCode
    });
    
    const companySettings = Object.fromEntries(
        (Array.isArray(company.settings) ? company.settings : []).map((item: any) => [item.key, item.value || ''])
    );
    const companyValue = (settingKey: string, organizationKey?: string) => (
        companySettings[settingKey] || (organizationKey ? company[organizationKey] : '') || ''
    );
    
    const money = (val: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const lineTotal = (item: any) => Math.max(0, (Number(item.quantity || 1) * Number(item.unitPrice || 0)) - Number(item.discount || 0));
    
    // Calculate totals based on selection
    const items = data.serviceOptions || [];
    const groupedItems = React.useMemo(() => {
        const groups: Record<string, { serviceName: string, serviceDesc: string, items: any[] }> = {};
        items.forEach((item: any) => {
            const service = item.serviceOption?.service;
            const key = service?.id || 'other';
            if (!groups[key]) {
                groups[key] = {
                    serviceName: service?.name || 'Dịch vụ khác',
                    serviceDesc: service?.description || '',
                    items: []
                };
            }
            groups[key].items.push(item);
        });
        return Object.values(groups);
    }, [items]);
    const selectedItems = items.filter((item: any) => selectedIds.includes(item.id));
    
    const subtotal = selectedItems.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const discountAmount = selectedItems.reduce((sum: number, item: any) => sum + Number(item.discount || 0), 0);
    const vatAmount = selectedItems.reduce((sum: number, item: any) => {
        const itemTotal = lineTotal(item);
        return sum + (itemTotal * Number(item.taxRate || 0) / 100);
    }, 0);
    const grandTotal = subtotal - discountAmount + vatAmount;

    const supplierCompanyName = companyValue('company_name') || company.name || 'Đang cập nhật';
    const workspaceDisplayName = companyValue('company_workspace_name') || supplierCompanyName;
    const companyDisplayName = workspaceDisplayName.toUpperCase();
    const heroCompanyName = supplierCompanyName;
    const configuredLogo = companyValue('company_logo_url', 'logo');
    const logoSrc = configuredLogo && !configuredLogo.toLowerCase().endsWith('.ico') ? configuredLogo : '/brand/ong-vang-logo.png';

    const handleToggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const featureList = (value: any) => {
        if (!value) return [];
        if (Array.isArray(value)) return value.map(String).filter(Boolean);
        if (typeof value === "object") return Object.values(value).map(String).filter(Boolean);
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return featureList(parsed);
            } catch {
                return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
            }
        }
        return [];
    };

    const parseDealOptionNote = (note?: string | null) => {
        if (!note) return { note: "" };
        try {
            const parsed = JSON.parse(note);
            if (parsed && parsed.__dealOptionOverrides === true) {
                return {
                    name: String(parsed.name || ""),
                    description: String(parsed.description || ""),
                    unit: String(parsed.unit || ""),
                    durationText: String(parsed.durationText || ""),
                    featuresText: String(parsed.featuresText || ""),
                    note: String(parsed.note || ""),
                };
            }
        } catch {
            // Existing plain notes remain visible.
        }
        return { note };
    };

    const optionView = (item: any) => {
        const overrides = parseDealOptionNote(item.note);
        const serviceOption = item.serviceOption || {};
        const serviceFeatures = Array.isArray(serviceOption.featuresJson)
            ? serviceOption.featuresJson.join("\n")
            : typeof serviceOption.featuresJson === "string"
                ? serviceOption.featuresJson
                : serviceOption.featuresJson
                    ? Object.values(serviceOption.featuresJson).join("\n")
                    : "";

        return {
            name: overrides.name || serviceOption.name || item.name || "",
            description: overrides.description || serviceOption.description || "",
            unit: overrides.unit || serviceOption.unit || "Gói",
            durationText: overrides.durationText || serviceOption.durationText || "Theo thỏa thuận",
            featuresText: overrides.featuresText || serviceFeatures,
            note: overrides.note || "",
        };
    };

    const visibleNote = (note?: string | null) => {
        const value = String(note || "").trim();
        if (!value) return "";
        return /<\/?[a-z][\s\S]*>/i.test(value) ? "" : value;
    };

    const handleInitiateSubmit = () => {
        if (!contactInfo.name || !contactInfo.phone || !contactInfo.email || !contactInfo.address) {
            setShowInfoModal(true);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const infoToSubmit = {
            name: contactInfo.name,
            phone: contactInfo.phone,
            email: contactInfo.email,
            address: contactInfo.address,
            taxCode: contactInfo.taxCode
        };
        
        const res = await submitDealSelectionAction(data.id, selectedIds, infoToSubmit, customerNote);
        if (res.success) {
            setIsSubmitted(true);
            setShowInfoModal(false);
        } else {
            alert(res.error || "Có lỗi xảy ra");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="modern-template-wrapper w-full bg-[#fafafa] min-h-screen">
            <style>{`
                .modern-template-wrapper {
                    --bg:#fafafa; --card:#fff; --line:#eaeaea; --text:#000; --muted:#6b7280;
                    --primary:#000; --accent:#f59e0b; --success:#16a34a; --shadow:none;
                    --radius:16px;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
                    color: var(--text);
                    font-size: 15px;
                    text-align: left;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: geometricPrecision;
                    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
                }
                .modern-template-wrapper * { box-sizing: border-box; }
                .modern-template-wrapper .topbar { width:100%; min-height:64px; background:rgba(255,255,255,.82); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); position:sticky; top:0; z-index:10; }
                .modern-template-wrapper .topbar-inner { width:100%; max-width:1200px; min-height:64px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:12px 24px; }
                .modern-template-wrapper .brand { display:flex; align-items:center; gap:12px; font-weight:500; letter-spacing:-.01em; }
                .modern-template-wrapper .brand img { max-width:132px; }
                .modern-template-wrapper .brand div { overflow-wrap:anywhere; line-height:1.25; }
                .modern-template-wrapper .logo { width:32px; height:32px; border-radius:8px; background:#000; display:grid; place-items:center; color:#fff; font-size:15px; font-weight:500; }
                .modern-template-wrapper .safe { display:flex; gap:22px; color:#8a8a8a; align-items:center; white-space:nowrap; font-size:15px; line-height:1.5; }
                .modern-template-wrapper .hero { padding:56px 24px 50px; background:#fafafa; }
                .modern-template-wrapper .hero-inner { display:block; width:100%; max-width:1200px; margin:0 auto; }
                .modern-template-wrapper .pill { display:inline-flex; border:1px solid var(--line); background:#fff; border-radius:999px; padding:6px 12px; color:#6b7280; font-size:11px; line-height:1.45; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
                .modern-template-wrapper .hero h1 { max-width:690px; font-size:44px; line-height:1.15; margin:22px 0 18px; letter-spacing:-.035em; font-weight:500; color:#000; }
                .modern-template-wrapper .hero h1 span { color:#a1a1aa; font-weight:400; }
                .modern-template-wrapper .hero p { color:#6b7280; line-height:1.8; max-width:720px; font-size:16px; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .illus { display:none; }
                .modern-template-wrapper .wrap { width:100%; max-width:1200px; margin:0 auto; padding:40px 24px 72px; }
                .modern-template-wrapper .grid-layout { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:28px; align-items:start; }
                .modern-template-wrapper .steps { display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin:0 0 36px; overflow:hidden; border:1px solid var(--line); border-radius:var(--radius); background:#fff; }
                .modern-template-wrapper .step { display:flex; align-items:center; justify-content:center; gap:10px; min-height:52px; text-align:center; color:var(--muted); position:relative; border-right:1px solid var(--line); font-size:15px; line-height:1.35; }
                .modern-template-wrapper .step:last-child { border-right:0; }
                .modern-template-wrapper .step:before { display:none; }
                .modern-template-wrapper .dot { width:24px; height:24px; border-radius:50%; border:1px solid var(--line); background:#fff; display:grid; place-items:center; margin:0; font-weight:500; font-size:15px; }
                .modern-template-wrapper .step.active { color:#000; font-weight:500; }
                .modern-template-wrapper .step.active .dot { background:#000; border-color:#000; color:#fff; box-shadow:none; }
                .modern-template-wrapper .section-title { margin-bottom:24px; }
                .modern-template-wrapper .section-title h2 { font-size:26px; margin:0 0 10px; letter-spacing:-.04em; line-height:1.16; font-weight:500; }
                .modern-template-wrapper .section-title p { margin:0; color:var(--muted); line-height:1.75; font-size:16px; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .service-list { display:grid; gap:18px; }
                .modern-template-wrapper .service { display:grid; grid-template-columns:minmax(0,1fr) 140px 38px; gap:22px; align-items:start; background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:28px 30px; box-shadow:var(--shadow); transition:border-color .2s, background-color .2s; cursor: pointer; }
                .modern-template-wrapper .service:hover { border-color:#000; }
                .modern-template-wrapper .service.selected { border-color:#000; background:rgba(0,0,0,0.02); }
                .modern-template-wrapper .service h3 { font-size:18px; margin:0 0 10px; font-weight:500; letter-spacing:-.03em; line-height:1.25; }
                .modern-template-wrapper .service p { margin:0; color:#6b7280; line-height:1.78; font-size:15px; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .service-main { min-width:0; }
                .modern-template-wrapper .service-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
                .modern-template-wrapper .service-meta { margin-top:12px; color:#6b7280; font-size:15px; line-height:1.72; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .feature-list { grid-column:1 / -1; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 34px; margin:4px 0 0; padding:20px 0 0; list-style:none; color:#1f2937; font-size:15px; font-weight:400; letter-spacing:-.006em; border-top:1px solid var(--line); }
                .modern-template-wrapper .feature-list li { display:flex; gap:10px; line-height:1.72; }
                .modern-template-wrapper .feature-list li:before { content:""; width:4px; height:4px; border-radius:999px; background:#000; margin-top:9px; flex:0 0 auto; }
                .modern-template-wrapper .tag { display:inline-flex; margin-left:8px; padding:4px 10px; border-radius:999px; border:1px solid var(--line); background:#fff; color:#000; font-size:11px; line-height:1.35; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
                .modern-template-wrapper .price { font-weight:500; text-align:right; color:#000; font-size:17px; letter-spacing:-.02em; line-height:1.25; }
                .modern-template-wrapper .price small { display:block; font-weight:400; color:#9ca3af; margin-bottom:6px; font-size:13px; text-transform:uppercase; letter-spacing:0.05em; }
                .modern-template-wrapper .check { width:24px; height:24px; border-radius:6px; border:1px solid #d4d4d4; }
                .modern-template-wrapper .selected .check { background:#000; border-color:#000; position:relative; }
                .modern-template-wrapper .selected .check:after { content:"✓"; color:#fff; font-size:15px; position:absolute; inset:0; display:grid; place-items:center; }
                .modern-template-wrapper .need { margin-top:20px; border:1px solid var(--line); border-radius:var(--radius); padding:22px; background:#fff; color:#475569; }
                .modern-template-wrapper aside { position:sticky; top:96px; display:grid; gap:18px; }
                .modern-template-wrapper .panel { background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:28px; box-shadow:none; }
                .modern-template-wrapper .panel h3 { margin:0 0 24px; font-size:18px; line-height:1.25; font-weight:500; letter-spacing:-.035em; }
                .modern-template-wrapper .summary-row { display:flex; justify-content:space-between; gap:20px; padding:10px 0; color:#6b7280; font-size:15px; line-height:1.55; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .summary-row strong { color:#000; font-weight:500; letter-spacing:-.015em; }
                .modern-template-wrapper .total { border-top:1px solid var(--line); margin-top:8px; padding-top:16px; font-size:17px; letter-spacing:-.02em; }
                .modern-template-wrapper .total strong { color:#000; font-size:24px; font-weight:500; letter-spacing:-.035em; }
                .modern-template-wrapper .btn { width:100%; height:40px; border:0; border-radius:6px; background:#000; color:#fff; font-weight:500; font-size:13px; letter-spacing:-.005em; cursor:pointer; transition:background-color .2s; }
                .modern-template-wrapper .btn:hover { background:#333; }
                .modern-template-wrapper .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .modern-template-wrapper .why { display:grid; gap:18px; }
                .modern-template-wrapper .why-item { display:flex; gap:14px; color:#6b7280; line-height:1.72; font-size:15px; font-weight:400; letter-spacing:-.005em; }
                .modern-template-wrapper .why-item .mini { width:34px; height:34px; border-radius:8px; border:1px solid var(--line); background:#fff; color:#000; display:grid; place-items:center; flex:0 0 auto; font-size:15px; font-weight:400; }
                .modern-template-wrapper footer { text-align:center; color:#8a8a8a; padding:28px; border-top:1px solid var(--line); background:#fafafa; }
                .modern-template-wrapper .links { display:inline-flex; gap:28px; margin-left:28px; }
                .modern-template-wrapper .links a { color:#64748b; text-decoration:none; transition: color .2s; }
                .modern-template-wrapper .links a:hover { color:#000; }
                
                @media(max-width:1100px) {
                    .modern-template-wrapper .hero, .modern-template-wrapper .wrap { padding-left:24px; padding-right:24px; }
                    .modern-template-wrapper .hero-inner, .modern-template-wrapper .grid-layout { grid-template-columns:1fr; }
                    .modern-template-wrapper .illus { display:none; }
                    .modern-template-wrapper aside { position:static; }
                    .modern-template-wrapper .service { grid-template-columns:minmax(0,1fr) 120px 30px; }
                    .modern-template-wrapper .price { justify-self:start; text-align:left !important; }
                    .modern-template-wrapper .steps { grid-template-columns:repeat(2,1fr); }
                }
                @media(max-width:640px) {
                    .modern-template-wrapper .topbar-inner { align-items:center; justify-content:center; padding:10px 16px; gap:10px; }
                    .modern-template-wrapper .brand { align-items:center; justify-content:center; min-width:0; flex:0 1 auto; width:100%; }
                    .modern-template-wrapper .brand img { width:128px; height:auto !important; flex:0 0 auto; }
                    .modern-template-wrapper .brand div { display:none; }
                    .modern-template-wrapper .safe { display:none; }
                    .modern-template-wrapper .hero { padding:22px 16px; }
                    .modern-template-wrapper .hero h1 { font-size:22px; line-height:1.35; }
                    .modern-template-wrapper .hero p { font-size:15px; }
                    .modern-template-wrapper .wrap { padding:22px 16px 36px; }
                    .modern-template-wrapper .steps { display:none; }
                    .modern-template-wrapper .step { font-size:15px; line-height:1.35; }
                    .modern-template-wrapper .step:before { left:60%; right:-40%; top:16px; }
                    .modern-template-wrapper .dot { width:32px; height:32px; margin-bottom:7px; }
                    .modern-template-wrapper .service { grid-template-columns:minmax(0,1fr) 28px; padding:16px; gap:14px; }
                    .modern-template-wrapper .service-title-row { display:block; }
                    .modern-template-wrapper .price { grid-column:1; grid-row:2; text-align:left !important; }
                    .modern-template-wrapper .service-meta { grid-column:1 / -1; grid-row:3; }
                    .modern-template-wrapper .feature-list { grid-column:1 / -1; grid-row:4; grid-template-columns:1fr; }
                    .modern-template-wrapper .check { grid-column:2; grid-row:1; justify-self:end; }
                }
            `}</style>

            {isSubmitted && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
                    <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 text-center font-medium shadow-xl" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                        Cảm ơn Quý khách! Yêu cầu của Quý khách đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm nhất.
                    </div>
                </div>
            )}
            
            <header className="topbar">
                <div className="topbar-inner">
                    <div className="brand">
                        {logoSrc ? (
                            <img src={logoSrc} alt={companyDisplayName} style={{ height: 38, objectFit: 'contain' }} />
                        ) : (
                            <div className="logo">{companyDisplayName.substring(0, 1).toUpperCase()}</div>
                        )}
                        <div>{companyDisplayName}</div>
                    </div>
                    <div className="safe"><span>🛡️ Kết nối an toàn</span></div>
                </div>
            </header>

            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <span className="pill">Xin chào {contactInfo.name || customerPerson || 'Quý khách'},</span>
                        <h1>{heroCompanyName} gửi Quý khách <span>giải pháp phù hợp nhất</span></h1>
                        <p>Vui lòng chọn các dịch vụ Quý khách quan tâm. Chúng tôi sẽ liên hệ để tư vấn chi tiết và gửi báo giá phù hợp với nhu cầu của doanh nghiệp.</p>
                    </div>
                    <div className="illus" aria-hidden="true"></div>
                </div>
            </section>

            <main className="wrap">
                <div className="grid-layout">
                    <section>
                        <div className="section-title">
                            <h2>Chọn dịch vụ Quý khách quan tâm</h2>
                            <p>Quý khách có thể chọn một hoặc nhiều dịch vụ.</p>
                        </div>
                        <div className="service-groups" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {groupedItems.map((group, gIdx) => (
                                <div key={gIdx} className="service-group">
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ color: '#000', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '15px', lineHeight: 1.35, margin: '0 0 8px 0' }}>{group.serviceName}</h3>
                                        {group.serviceDesc && (
                                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.75, letterSpacing: '-0.005em', fontWeight: 400, margin: 0 }}>{group.serviceDesc}</p>
                                        )}
                                    </div>
                                    <div className="service-list">
                                        {group.items.map((item: any) => {
                                            const isSelected = selectedIds.includes(item.id);
                                            const view = optionView(item);
                                            const features = featureList(view.featuresText);
                                            const note = visibleNote(view.note);
                                            return (
                                                <article 
                                                    key={item.id} 
                                                    className={`service ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleToggleSelect(item.id)}
                                                >
                                                    <div className="service-main">
                                                        <div className="service-title-row">
                                                            <h3>{view.name}</h3>
                                                        </div>
                                                        <p>{view.description || "Chưa có mô tả chi tiết cho option này."}</p>
                                                        <div className="service-meta">
                                                            Đơn vị tính: <strong>{view.unit}</strong>
                                                            {" · "}Thời lượng: <strong>{view.durationText}</strong>
                                                            {" · "}Thuế: <strong>{Number(item.taxRate || 0)}%</strong>
                                                        </div>
                                                        {note ? <p style={{ marginTop: 8 }}><strong>Ghi chú:</strong> {note}</p> : null}
                                                    </div>
                                                    <div className="price">
                                                        <small>{Number(item.discount || 0) > 0 ? "Giá sau giảm" : "Đơn giá"}</small>
                                                        {money(lineTotal(item))}
                                                    </div>
                                                    <div className="check"></div>
                                                    {features.length ? (
                                                        <ul className="feature-list">
                                                            {features.map((feature, featureIndex) => <li key={`${item.id}-${featureIndex}`}>{feature}</li>)}
                                                        </ul>
                                                    ) : null}
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="need">
                            <label className="block text-[15px] font-medium text-slate-800 mb-2" style={{ display: 'block', marginBottom: '8px', fontSize: '15px', lineHeight: 1.45, fontWeight: '500', letterSpacing: '-0.01em' }}>Ghi chú & Yêu cầu thêm (Tùy chọn)</label>
                            <TiptapEditor 
                                placeholder="Quý khách có thể để lại ghi chú, yêu cầu bổ sung tại đây..."
                                value={customerNote}
                                onChange={content => setCustomerNote(content)}
                            />
                        </div>
                    </section>

                    <aside>
                        <div className="panel">
                            <h3>Tóm tắt lựa chọn <span className="tag" style={{ float: 'right', margin: 0 }}>{selectedItems.length} dịch vụ</span></h3>
                            
                            <div className="max-h-[300px] overflow-y-auto mb-4 border-b border-slate-100 pb-2" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid #eef2f7', paddingBottom: '8px' }}>
                                {selectedItems.map((item: any) => (
                                    <div key={item.id} className="summary-row" style={{ fontSize: '15px' }}>
                                        <span>{optionView(item).name}<br/><small>x{item.quantity}</small></span>
                                        <strong>{money(lineTotal(item))}</strong>
                                    </div>
                                ))}
                                {selectedItems.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '15px', lineHeight: 1.6, letterSpacing: '-0.005em', padding: '16px 0' }}>Chưa chọn dịch vụ nào.</div>
                                )}
                            </div>

                            <div className="summary-row"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div>
                            <div className="summary-row"><span>Thuế & Phí khác</span><strong>{money(vatAmount)}</strong></div>
                            <div className="summary-row total"><span>Tổng cộng</span><strong>{money(grandTotal)}</strong></div>
                            
                            <button 
                                className="btn"
                                onClick={handleInitiateSubmit}
                                disabled={isSubmitting || selectedIds.length === 0}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi'}
                            </button>
                        </div>
                        <div className="panel">
                            <h3>Vì sao chọn {heroCompanyName}?</h3>
                            <div className="why">
                                <div className="why-item"><div className="mini">1</div><div>Kinh nghiệm triển khai nhiều dự án thành công</div></div>
                                <div className="why-item"><div className="mini">2</div><div>Đội ngũ chuyên gia sẵn sàng hỗ trợ</div></div>
                                <div className="why-item"><div className="mini">3</div><div>Giải pháp tối ưu, chi phí hợp lý</div></div>
                                <div className="why-item"><div className="mini">4</div><div>Hỗ trợ 24/7 trong suốt quá trình triển khai</div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {showInfoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 modern-template-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', padding: '16px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '450px', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #eef2f7', backgroundColor: '#f8faff' }}>
                            <h3 style={{ fontSize: '20px', lineHeight: 1.25, letterSpacing: '-0.035em', fontWeight: '500', color: '#0f172a', margin: '0' }}>Bổ sung thông tin</h3>
                            <p style={{ fontSize: '15px', lineHeight: 1.6, letterSpacing: '-0.005em', color: '#64748b', margin: '4px 0 0 0' }}>Vui lòng bổ sung thông tin liên hệ dưới đây.</p>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Họ và tên / Tên đơn vị <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em' }}
                                    placeholder="Nhập họ và tên..."
                                    value={contactInfo.name}
                                    onChange={e => setContactInfo({...contactInfo, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Số điện thoại <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="tel" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em' }}
                                    placeholder="Nhập số điện thoại..."
                                    value={contactInfo.phone}
                                    onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="email" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em' }}
                                    placeholder="Nhập địa chỉ email..."
                                    value={contactInfo.email}
                                    onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Địa chỉ <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em' }}
                                    placeholder="Nhập địa chỉ liên hệ..."
                                    value={contactInfo.address}
                                    onChange={e => setContactInfo({...contactInfo, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Mã số thuế</label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em' }}
                                    placeholder="Nhập mã số thuế nếu có..."
                                    value={contactInfo.taxCode}
                                    onChange={e => setContactInfo({...contactInfo, taxCode: e.target.value})}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '24px', borderTop: '1px solid #eef2f7', display: 'flex', gap: '12px', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
                            <button 
                                onClick={() => setShowInfoModal(false)}
                                style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: '500', color: '#475569', backgroundColor: 'transparent', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !contactInfo.name || !contactInfo.phone || !contactInfo.email || !contactInfo.address}
                                style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '15px', lineHeight: 1.45, letterSpacing: '-0.005em', fontWeight: '500', color: '#fff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer', opacity: (isSubmitting || !contactInfo.name || !contactInfo.phone || !contactInfo.email || !contactInfo.address) ? 0.5 : 1 }}
                            >
                                {isSubmitting ? "Đang gửi..." : "Xác nhận & Gửi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
