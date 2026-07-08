"use client";

import React, { useState } from 'react';
import { submitDealSelectionAction } from '@/app/actions/deals';
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
    const [expandedOptionIds, setExpandedOptionIds] = useState<string[]>([]);
    
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
        const itemTotal = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount || 0);
        return sum + (itemTotal * Number(item.taxRate || 0) / 100);
    }, 0);
    const grandTotal = subtotal - discountAmount + vatAmount;

    const workspaceDisplayName = companyValue('company_workspace_name') || companyValue('company_name') || company.name || 'Đang cập nhật';
    const companyDisplayName = workspaceDisplayName.toUpperCase();
    const configuredLogo = companyValue('company_logo_url', 'logo');
    const logoSrc = configuredLogo && !configuredLogo.toLowerCase().endsWith('.ico') ? configuredLogo : '/brand/ong-vang-logo.png';

    const handleToggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
            setExpandedOptionIds((current) => current.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
            setExpandedOptionIds((current) => current.includes(id) ? current : [...current, id]);
        }
    };

    const toggleOptionDetail = (id: string) => {
        setExpandedOptionIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
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
                return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
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

    const iconColors = ["", "i2", "i3", "i4", "i5"];
    const icons = ["▣", "▥", "</>", "▯", "☁"];

    return (
        <div className="modern-template-wrapper w-full bg-[#f7f9fc] min-h-screen">
            <style>{`
                .modern-template-wrapper {
                    --bg:#f7f9fc; --card:#fff; --line:#eef2f7; --text:#0f172a; --muted:#64748b;
                    --primary:#2563eb; --accent:#7c3aed; --success:#16a34a; --shadow:0 8px 30px rgba(15,23,42,.05);
                    --radius:18px;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
                    color: var(--text);
                    font-size: 14px;
                    text-align: left;
                }
                .modern-template-wrapper * { box-sizing: border-box; }
                .modern-template-wrapper .topbar { min-height:72px; background:rgba(255,255,255,.92); backdrop-filter:blur(18px); border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; gap:18px; padding:14px 13vw; position:sticky; top:0; z-index:10; }
                .modern-template-wrapper .brand { display:flex; align-items:center; gap:12px; font-weight:700; }
                .modern-template-wrapper .brand img { max-width:160px; }
                .modern-template-wrapper .brand div { overflow-wrap:anywhere; line-height:1.25; }
                .modern-template-wrapper .logo { width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,var(--primary),var(--accent)); display:grid; place-items:center; color:#fff; font-size: 16px; }
                .modern-template-wrapper .safe { display:flex; gap:22px; color:var(--muted); align-items:center; white-space:nowrap; }
                .modern-template-wrapper .hero { padding:38px 13vw 32px; background:#fff; border-bottom:1px solid var(--line); }
                .modern-template-wrapper .hero-inner { display:grid; grid-template-columns:1fr 420px; gap:32px; align-items:center; }
                .modern-template-wrapper .pill { display:inline-flex; border:1px solid #dbeafe; background:#fff; border-radius:999px; padding:8px 14px; color:#334155; }
                .modern-template-wrapper .hero h1 { font-size:34px; line-height:1.18; margin:16px 0 14px; letter-spacing:0; }
                .modern-template-wrapper .hero h1 span { color:var(--primary); }
                .modern-template-wrapper .hero p { color:#475569; line-height:1.7; max-width:560px; }
                .modern-template-wrapper .illus { height:190px; border-radius:28px; background:radial-gradient(circle at 30% 20%,#fff,transparent 34%),linear-gradient(135deg,rgba(37,99,235,.16),rgba(124,58,237,.12)); border:1px solid rgba(255,255,255,.7); box-shadow:var(--shadow); position:relative; overflow:hidden; }
                .modern-template-wrapper .illus:before { content:""; position:absolute; width:170px; height:120px; background:#fff; border:1px solid #dbeafe; border-radius:22px; left:88px; top:40px; box-shadow:0 18px 50px rgba(37,99,235,.16); }
                .modern-template-wrapper .illus:after { content:""; position:absolute; width:140px; height:10px; background:#c7d2fe; border-radius:99px; left:180px; top:88px; box-shadow:0 32px 0 #dbeafe, 56px 62px 0 #bfdbfe; }
                .modern-template-wrapper .wrap { padding:24px 13vw 48px; }
                .modern-template-wrapper .grid-layout { display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:28px; align-items:start; }
                .modern-template-wrapper .steps { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin:0 0 30px; }
                .modern-template-wrapper .step { text-align:center; color:var(--muted); position:relative; }
                .modern-template-wrapper .step:before { content:""; position:absolute; height:1px; border-top:1px dashed #cbd5e1; left:55%; right:-45%; top:18px; }
                .modern-template-wrapper .step:last-child:before { display:none; }
                .modern-template-wrapper .dot { width:36px; height:36px; border-radius:50%; border:1px solid #dbeafe; background:#fff; display:grid; place-items:center; margin:0 auto 9px; font-weight:600; }
                .modern-template-wrapper .step.active { color:var(--primary); font-weight:600; }
                .modern-template-wrapper .step.active .dot { background:linear-gradient(135deg,var(--primary),#60a5fa); color:#fff; box-shadow:0 8px 22px rgba(37,99,235,.25); }
                .modern-template-wrapper .section-title { margin-bottom:18px; }
                .modern-template-wrapper .section-title h2 { font-size:21px; margin:0 0 8px; letter-spacing:-.02em; font-weight: 700; }
                .modern-template-wrapper .section-title p { margin:0; color:var(--muted); }
                .modern-template-wrapper .service-list { display:grid; gap:12px; }
                .modern-template-wrapper .service { display:grid; grid-template-columns:minmax(0,1fr) 120px 100px 34px; gap:16px; align-items:center; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px 24px; box-shadow:var(--shadow); transition:.2s; cursor: pointer; }
                .modern-template-wrapper .service:hover { transform:translateY(-2px); border-color:#bfdbfe; }
                .modern-template-wrapper .service.selected { border-color:#2563eb; box-shadow:0 12px 40px rgba(37,99,235,.09); }
                .modern-template-wrapper .i2 { background:#ecfdf5; color:var(--success); }
                .modern-template-wrapper .i3 { background:#faf5ff; color:var(--accent); }
                .modern-template-wrapper .i4 { background:#fff7ed; color:#f97316; }
                .modern-template-wrapper .i5 { background:#ecfeff; color:#06b6d4; }
                .modern-template-wrapper .service h3 { font-size:15px; margin:0 0 7px; font-weight: 600;}
                .modern-template-wrapper .service p { margin:0; color:#64748b; line-height:1.5; }
                .modern-template-wrapper .service-main { min-width:0; }
                .modern-template-wrapper .service-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
                .modern-template-wrapper .detail-toggle { border:1px solid #dbeafe; background:#eff6ff; color:#2563eb; border-radius:999px; padding:6px 10px; font-size:12px; font-weight:700; cursor:pointer; flex:0 0 auto; }
                .modern-template-wrapper .detail-toggle-bottom { grid-column:1 / -1; justify-self:start; margin-top:2px; }
                .modern-template-wrapper .option-detail { grid-column:1 / -1; border-top:1px solid var(--line); margin-top:2px; padding-top:14px; color:#475569; line-height:1.65; cursor:default; }
                .modern-template-wrapper .feature-list { display:grid; gap:6px; margin:10px 0 0; padding:0; list-style:none; }
                .modern-template-wrapper .feature-list li { display:flex; gap:8px; }
                .modern-template-wrapper .feature-list li:before { content:"✓"; color:#16a34a; font-weight:800; }
                .modern-template-wrapper .tag { display:inline-flex; margin-left:8px; padding:3px 8px; border-radius:999px; background:#eff6ff; color:#2563eb; font-size:12px; }
                .modern-template-wrapper .price { font-weight:700; text-align:right; }
                .modern-template-wrapper .price small { display:block; font-weight:500; color:var(--muted); margin-bottom:4px; }
                .modern-template-wrapper .qty { display:flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:10px; height:36px; background:#fff; }
                .modern-template-wrapper .qty button { border:0; background:transparent; width:32px; color:#64748b; font-size:16px; cursor: pointer; }
                .modern-template-wrapper .check { width:22px; height:22px; border-radius:6px; border:1px solid #cbd5e1; }
                .modern-template-wrapper .selected .check { background:var(--primary); border-color:var(--primary); position:relative; }
                .modern-template-wrapper .selected .check:after { content:"✓"; color:#fff; font-size:14px; position:absolute; inset:0; display:grid; place-items:center; }
                .modern-template-wrapper .need { margin-top:12px; border:1px dashed #cbd5e1; border-radius:14px; padding:15px; background:#fff; color:#475569; }
                .modern-template-wrapper aside { position:sticky; top:96px; display:grid; gap:14px; }
                .modern-template-wrapper .panel { background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow); }
                .modern-template-wrapper .panel h3 { margin:0 0 20px; font-size:17px; font-weight: 600;}
                .modern-template-wrapper .summary-row { display:flex; justify-content:space-between; gap:20px; padding:12px 0; color:#475569; }
                .modern-template-wrapper .summary-row strong { color:#0f172a; }
                .modern-template-wrapper .total { border-top:1px solid var(--line); margin-top:10px; padding-top:18px; font-size:18px; }
                .modern-template-wrapper .total strong { color:var(--primary); font-size:21px; }
                .modern-template-wrapper .secure { display:flex; gap:14px; background:#f8faff; border-radius:14px; padding:16px; margin:18px 0; }
                .modern-template-wrapper .secure .icon { width:42px; height:42px; font-size: 20px; background: transparent; }
                .modern-template-wrapper .btn { width:100%; height:48px; border:0; border-radius:12px; background:linear-gradient(135deg,var(--primary),#1d4ed8); color:#fff; font-weight:700; font-size:15px; cursor:pointer; }
                .modern-template-wrapper .btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .modern-template-wrapper .why { display:grid; gap:15px; }
                .modern-template-wrapper .why-item { display:flex; gap:12px; color:#475569; line-height:1.5; }
                .modern-template-wrapper .why-item .mini { width:32px; height:32px; border-radius:10px; background:#eff6ff; color:var(--primary); display:grid; place-items:center; flex:0 0 auto; }
                .modern-template-wrapper footer { text-align:center; color:#64748b; padding:28px; border-top:1px solid var(--line); background:#fff; }
                .modern-template-wrapper .links { display:inline-flex; gap:28px; margin-left:28px; }
                .modern-template-wrapper .links a { color:#64748b; text-decoration:none; }
                
                @media(max-width:1100px) {
                    .modern-template-wrapper .topbar, .modern-template-wrapper .hero, .modern-template-wrapper .wrap { padding-left:24px; padding-right:24px; }
                    .modern-template-wrapper .hero-inner, .modern-template-wrapper .grid-layout { grid-template-columns:1fr; }
                    .modern-template-wrapper .illus { display:none; }
                    .modern-template-wrapper aside { position:static; }
                    .modern-template-wrapper .service { grid-template-columns:minmax(0,1fr) auto; }
                    .modern-template-wrapper .price, .modern-template-wrapper .unit { justify-self:start; text-align:left !important; }
                    .modern-template-wrapper .steps { grid-template-columns:repeat(2,1fr); }
                }
                @media(max-width:640px) {
                    .modern-template-wrapper .topbar { align-items:flex-start; padding:10px 16px; gap:10px; }
                    .modern-template-wrapper .brand { align-items:flex-start; min-width:0; flex:1; width:100%; }
                    .modern-template-wrapper .brand img { width:128px; height:auto !important; flex:0 0 auto; }
                    .modern-template-wrapper .brand div { font-size:15px; max-width:none; flex:1; }
                    .modern-template-wrapper .safe { display:none; }
                    .modern-template-wrapper .hero { padding:22px 16px; }
                    .modern-template-wrapper .hero h1 { font-size:22px; line-height:1.35; }
                    .modern-template-wrapper .hero p { font-size:15px; }
                    .modern-template-wrapper .wrap { padding:22px 16px 36px; }
                    .modern-template-wrapper .steps { grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
                    .modern-template-wrapper .step { font-size:12px; line-height:1.25; }
                    .modern-template-wrapper .step:before { left:60%; right:-40%; top:16px; }
                    .modern-template-wrapper .dot { width:32px; height:32px; margin-bottom:7px; }
                    .modern-template-wrapper .service { grid-template-columns:minmax(0,1fr) 30px; padding:16px; gap:12px; }
                    .modern-template-wrapper .service-title-row { display:block; }
                    .modern-template-wrapper .detail-toggle { margin-top:10px; }
                    .modern-template-wrapper .detail-toggle-bottom { grid-column:1 / -1; grid-row:3; margin-top:0; }
                    .modern-template-wrapper .price { grid-column:1; grid-row:2; text-align:left !important; }
                    .modern-template-wrapper .unit { grid-column:1; grid-row:2; justify-self:end; text-align:right !important; }
                    .modern-template-wrapper .check { grid-column:2; grid-row:1; justify-self:end; }
                    .modern-template-wrapper footer .links { display:flex; margin:12px 0 0; justify-content:center; flex-wrap:wrap; }
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
                <div className="brand">
                    {logoSrc ? (
                        <img src={logoSrc} alt={companyDisplayName} style={{ height: 38, objectFit: 'contain' }} />
                    ) : (
                        <div className="logo">{companyDisplayName.substring(0, 1).toUpperCase()}</div>
                    )}
                    <div>{companyDisplayName}</div>
                </div>
                <div className="safe"><span>🛡️ Kết nối an toàn</span></div>
            </header>

            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <span className="pill">Xin chào {contactInfo.name || customerPerson || 'Quý khách'},</span>
                        <h1>{companyDisplayName} gửi Quý khách<br/><span>giải pháp phù hợp nhất</span></h1>
                        <p>Vui lòng chọn các dịch vụ Quý khách quan tâm. Chúng tôi sẽ liên hệ để tư vấn chi tiết và gửi báo giá phù hợp với nhu cầu của doanh nghiệp.</p>
                    </div>
                    <div className="illus" aria-hidden="true"></div>
                </div>
            </section>

            <main className="wrap">
                <div className="grid-layout">
                    <section>
                        <div className="steps">
                            <div className={`step ${!showInfoModal && !isSubmitting && !isSubmitted ? 'active' : ''}`}><div className="dot">1</div>Chọn dịch vụ</div>
                            <div className={`step ${showInfoModal && !isSubmitting && !isSubmitted ? 'active' : ''}`}><div className="dot">2</div>Thông tin</div>
                            <div className={`step ${isSubmitting && !isSubmitted ? 'active' : ''}`}><div className="dot">3</div>Xác nhận</div>
                            <div className={`step ${isSubmitted ? 'active' : ''}`}><div className="dot">4</div>Hoàn tất</div>
                        </div>
                        <div className="section-title">
                            <h2>Chọn dịch vụ Quý khách quan tâm</h2>
                            <p>Quý khách có thể chọn một hoặc nhiều dịch vụ.</p>
                        </div>
                        <div className="service-groups" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {groupedItems.map((group, gIdx) => (
                                <div key={gIdx} className="service-group">
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ color: '#f97316', fontWeight: '700', textTransform: 'uppercase', fontSize: '16px', margin: '0 0 4px 0' }}>{group.serviceName}</h3>
                                        {group.serviceDesc && (
                                            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>{group.serviceDesc}</p>
                                        )}
                                    </div>
                                    <div className="service-list">
                                        {group.items.map((item: any, index: number) => {
                                            const isSelected = selectedIds.includes(item.id);
                                            const isExpanded = expandedOptionIds.includes(item.id);
                                            const view = optionView(item);
                                            const features = featureList(view.featuresText);
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
                                                        <p>{view.description || "Bấm Chi tiết để xem đầy đủ thông tin option."}</p>
                                                    </div>
                                                    <div className="price"><small>Đơn giá</small>{money(item.unitPrice)}</div>
                                                    <div className="unit" style={{ textAlign: 'right' }}>
                                                        <small style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', marginBottom: '2px' }}>Đơn vị tính</small>
                                                        <strong style={{ fontSize: '14px' }}>{view.unit}</strong>
                                                    </div>
                                                    <div className="check"></div>
                                                    <button
                                                        type="button"
                                                        className="detail-toggle detail-toggle-bottom"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOptionDetail(item.id);
                                                        }}
                                                    >
                                                        {isExpanded ? "▴ Thu gọn" : "▾ Chi tiết"}
                                                    </button>
                                                    {isExpanded ? (
                                                        <div className="option-detail" onClick={(event) => event.stopPropagation()}>
                                                            {view.description ? <div style={{ whiteSpace: "pre-wrap" }}>{view.description}</div> : null}
                                                            {view.note ? <div style={{ marginTop: view.description ? 8 : 0 }}><strong>Ghi chú:</strong> {view.note}</div> : null}
                                                            <div style={{ marginTop: 8, color: '#64748b' }}>
                                                                Đơn vị tính: <strong style={{ color: '#0f172a' }}>{view.unit}</strong>
                                                                {" · "}Thời lượng: <strong style={{ color: '#0f172a' }}>{view.durationText}</strong>
                                                                {" · "}Thuế: <strong style={{ color: '#0f172a' }}>{Number(item.taxRate || 0)}%</strong>
                                                            </div>
                                                            {features.length ? (
                                                                <ul className="feature-list">
                                                                    {features.map((feature, featureIndex) => <li key={`${item.id}-${featureIndex}`}>{feature}</li>)}
                                                                </ul>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="need">
                            <label className="block text-sm font-medium text-slate-800 mb-2" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Ghi chú & Yêu cầu thêm (Tùy chọn)</label>
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
                                {selectedItems.map((item: any, index: number) => (
                                    <div key={item.id} className="summary-row" style={{ fontSize: '13px' }}>
                                        <span>{optionView(item).name}<br/><small>x{item.quantity}</small></span>
                                        <strong>{money(item.unitPrice * item.quantity)}</strong>
                                    </div>
                                ))}
                                {selectedItems.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '16px 0' }}>Chưa chọn dịch vụ nào.</div>
                                )}
                            </div>

                            <div className="summary-row"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div>
                            <div className="summary-row"><span>Thuế & Phí khác</span><strong>{money(vatAmount)}</strong></div>
                            <div className="summary-row total"><span>Tổng cộng</span><strong>{money(grandTotal)}</strong></div>
                            
                            <div className="secure">
                                <div className="icon">🛡</div>
                                <div>
                                    <strong>Thông tin của Quý khách được bảo mật</strong>{" "}
                                    <span style={{ color: '#64748b' }}>và chỉ sử dụng để tư vấn giải pháp.</span>
                                </div>
                            </div>
                            <button 
                                className="btn"
                                onClick={handleInitiateSubmit}
                                disabled={isSubmitting || selectedIds.length === 0}
                            >
                                {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi'}
                            </button>
                        </div>
                        <div className="panel">
                            <h3>Vì sao chọn {companyDisplayName}?</h3>
                            <div className="why">
                                <div className="why-item"><div className="mini">▦</div><div>Kinh nghiệm triển khai nhiều dự án thành công</div></div>
                                <div className="why-item"><div className="mini">👥</div><div>Đội ngũ chuyên gia sẵn sàng hỗ trợ</div></div>
                                <div className="why-item"><div className="mini">◎</div><div>Giải pháp tối ưu, chi phí hợp lý</div></div>
                                <div className="why-item"><div className="mini">↻</div><div>Hỗ trợ 24/7 trong suốt quá trình triển khai</div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer>
                © {new Date().getFullYear()} {companyDisplayName}. All rights reserved. 
                <span className="links"><a href="#">Chính sách bảo mật</a><a href="#">Điều khoản sử dụng</a></span>
            </footer>

            {showInfoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 modern-template-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', padding: '16px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '450px', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #eef2f7', backgroundColor: '#f8faff' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: '0' }}>Bổ sung thông tin</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Vui lòng bổ sung thông tin liên hệ dưới đây.</p>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Họ và tên / Tên đơn vị <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                                    placeholder="Nhập họ và tên..."
                                    value={contactInfo.name}
                                    onChange={e => setContactInfo({...contactInfo, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Số điện thoại <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="tel" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                                    placeholder="Nhập số điện thoại..."
                                    value={contactInfo.phone}
                                    onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Email <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="email" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                                    placeholder="Nhập địa chỉ email..."
                                    value={contactInfo.email}
                                    onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Địa chỉ <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
                                    placeholder="Nhập địa chỉ liên hệ..."
                                    value={contactInfo.address}
                                    onChange={e => setContactInfo({...contactInfo, address: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>Mã số thuế</label>
                                <input 
                                    type="text" 
                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', outline: 'none', transition: 'border-color 0.2s', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}
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
                                style={{ padding: '10px 24px', borderRadius: '12px', fontWeight: 'bold', color: '#fff', backgroundColor: '#2563eb', border: 'none', cursor: 'pointer', opacity: (isSubmitting || !contactInfo.name || !contactInfo.phone || !contactInfo.email || !contactInfo.address) ? 0.5 : 1 }}
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
