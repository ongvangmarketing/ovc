/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from 'react';

export function DocumentModernPreview({ data, type }: { data: any, type: "quotation" | "contract" | "invoice" }) {
    // Computed values
    const company = data.organization || {};
    const customer = data.contact || data.customer || {};
    const companySettings = Object.fromEntries(
        (Array.isArray(company.settings) ? company.settings : []).map((item: any) => [item.key, item.value || ''])
    );
    const companyValue = (settingKey: string, organizationKey?: string) => (
        companySettings[settingKey] || (organizationKey ? company[organizationKey] : '') || ''
    );
    
    const money = (val: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    const subtotal = data.subtotal || 0;
    const vatAmount = data.tax || 0;
    const grandTotal = data.total || 0;
    
    const customerPerson = customer.contactPerson || customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Quý khách';
    const companyDisplayName = companySettings.company_name || company.name || 'Công ty';
    const configuredLogo = companyValue('company_logo_url', 'logo');
    const logoSrc = configuredLogo && !configuredLogo.toLowerCase().endsWith('.ico') ? configuredLogo : null;

    const items = data.items || [];
    const iconColors = ["", "i2", "i3", "i4", "i5"];
    const icons = ["▣", "▥", "</>", "▯", "☁"];

    return (
        <div className="modern-template-wrapper w-full bg-[#f7f9fc]">
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
                .modern-template-wrapper .topbar { height:72px; background:rgba(255,255,255,.86); backdrop-filter:blur(18px); border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between; padding:0 13vw; position:sticky; top:0; z-index:10; }
                .modern-template-wrapper .brand { display:flex; align-items:center; gap:12px; font-weight:600; }
                .modern-template-wrapper .logo { width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,var(--primary),var(--accent)); display:grid; place-items:center; color:#fff; }
                .modern-template-wrapper .safe { display:flex; gap:22px; color:var(--muted); align-items:center; }
                .modern-template-wrapper .select { border:1px solid var(--line); border-radius:10px; padding:9px 14px; background:#fff; color:#334155; }
                .modern-template-wrapper .hero { padding:38px 13vw 32px; background:linear-gradient(135deg,#eef6ff,#fff 42%,#f2ecff); border-bottom:1px solid var(--line); }
                .modern-template-wrapper .hero-inner { display:grid; grid-template-columns:1fr 420px; gap:32px; align-items:center; }
                .modern-template-wrapper .pill { display:inline-flex; border:1px solid #dbeafe; background:#fff; border-radius:999px; padding:8px 14px; color:#334155; }
                .modern-template-wrapper .hero h1 { font-size:34px; line-height:1.12; margin:16px 0 14px; letter-spacing:-.04em; }
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
                .modern-template-wrapper .section-title h2 { font-size:21px; margin:0 0 8px; letter-spacing:-.02em; font-weight: 600; }
                .modern-template-wrapper .section-title p { margin:0; color:var(--muted); }
                .modern-template-wrapper .service-list { display:grid; gap:12px; }
                .modern-template-wrapper .service { display:grid; grid-template-columns:56px 1fr 160px 118px 34px; gap:16px; align-items:center; background:#fff; border:1px solid var(--line); border-radius:16px; padding:18px; box-shadow:var(--shadow); transition:.2s; }
                .modern-template-wrapper .service:hover { transform:translateY(-2px); border-color:#bfdbfe; }
                .modern-template-wrapper .service.selected { border-color:#2563eb; box-shadow:0 12px 40px rgba(37,99,235,.09); }
                .modern-template-wrapper .icon { width:50px; height:50px; border-radius:14px; display:grid; place-items:center; font-weight:600; background:#eff6ff; color:var(--primary); font-size: 20px;}
                .modern-template-wrapper .i2 { background:#ecfdf5; color:var(--success); }
                .modern-template-wrapper .i3 { background:#faf5ff; color:var(--accent); }
                .modern-template-wrapper .i4 { background:#fff7ed; color:#f97316; }
                .modern-template-wrapper .i5 { background:#ecfeff; color:#06b6d4; }
                .modern-template-wrapper .service h3 { font-size:15px; margin:0 0 7px; font-weight: 600;}
                .modern-template-wrapper .service p { margin:0; color:#64748b; line-height:1.5; }
                .modern-template-wrapper .tag { display:inline-flex; margin-left:8px; padding:3px 8px; border-radius:999px; background:#eff6ff; color:#2563eb; font-size:12px; }
                .modern-template-wrapper .price { font-weight:600; text-align:right; }
                .modern-template-wrapper .price small { display:block; font-weight:500; color:var(--muted); margin-bottom:4px; }
                .modern-template-wrapper .qty { display:flex; align-items:center; justify-content:center; border:1px solid var(--line); border-radius:10px; height:36px; background:#fff; }
                .modern-template-wrapper .qty button { border:0; background:transparent; width:32px; color:#64748b; font-size:16px; cursor: default; }
                .modern-template-wrapper .check { width:22px; height:22px; border-radius:6px; border:1px solid #cbd5e1; }
                .modern-template-wrapper .selected .check { background:var(--primary); border-color:var(--primary); position:relative; }
                .modern-template-wrapper .selected .check:after { content:"✓"; color:#fff; font-size:14px; position:absolute; inset:0; display:grid; place-items:center; }
                .modern-template-wrapper .need { margin-top:12px; border:1px dashed #cbd5e1; border-radius:14px; padding:15px; background:#fff; color:#475569; }
                .modern-template-wrapper .need a { color:var(--primary); font-weight:600; text-decoration:none; }
                .modern-template-wrapper aside { position:sticky; top:96px; display:grid; gap:14px; }
                .modern-template-wrapper .panel { background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:24px; box-shadow:var(--shadow); }
                .modern-template-wrapper .panel h3 { margin:0 0 20px; font-size:17px; font-weight: 600;}
                .modern-template-wrapper .summary-row { display:flex; justify-content:space-between; gap:20px; padding:12px 0; color:#475569; }
                .modern-template-wrapper .summary-row strong { color:#0f172a; }
                .modern-template-wrapper .total { border-top:1px solid var(--line); margin-top:10px; padding-top:18px; font-size:18px; }
                .modern-template-wrapper .total strong { color:var(--primary); font-size:21px; }
                .modern-template-wrapper .secure { display:flex; gap:14px; background:#f8faff; border-radius:14px; padding:16px; margin:18px 0; }
                .modern-template-wrapper .secure .icon { width:42px; height:42px; font-size: 20px;}
                .modern-template-wrapper .btn { width:100%; height:48px; border:0; border-radius:12px; background:linear-gradient(135deg,var(--primary),#1d4ed8); color:#fff; font-weight:600; font-size:15px; cursor:pointer; }
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
                    .modern-template-wrapper .service { grid-template-columns:48px 1fr; }
                    .modern-template-wrapper .price, .modern-template-wrapper .qty, .modern-template-wrapper .check { justify-self:start; text-align:left; }
                    .modern-template-wrapper .steps { grid-template-columns:repeat(2,1fr); }
                }
            `}</style>
            
            <header className="topbar">
                <div className="brand">
                    {logoSrc ? (
                        <img src={logoSrc} alt={companyDisplayName} style={{ height: 38, objectFit: 'contain' }} />
                    ) : (
                        <div className="logo">{companyDisplayName.substring(0, 1).toUpperCase()}</div>
                    )}
                    <div>{companyDisplayName}</div>
                </div>
                <div className="safe"><span>🛡️ Kết nối an toàn</span><button className="select">VI⌄</button></div>
            </header>

            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <span className="pill">Xin chào {customerPerson},</span>
                        <h1>{companyDisplayName} gửi bạn<br/><span>giải pháp phù hợp nhất</span></h1>
                        <p>Dưới đây là chi tiết các dịch vụ được đề xuất. Chúng tôi sẵn sàng đồng hành cùng sự phát triển của bạn.</p>
                    </div>
                    <div className="illus" aria-hidden="true"></div>
                </div>
            </section>

            <main className="wrap">
                <div className="grid-layout">
                    <section>
                        <div className="steps">
                            <div className="step active"><div className="dot">1</div>Chi tiết</div>
                            <div className="step"><div className="dot">2</div>Thảo luận</div>
                            <div className="step"><div className="dot">3</div>Ký kết</div>
                            <div className="step"><div className="dot">4</div>Thực hiện</div>
                        </div>
                        <div className="section-title">
                            <h2>Các hạng mục được đề xuất</h2>
                            <p>Bao gồm {items.length} hạng mục trong báo giá/hợp đồng.</p>
                        </div>
                        <div className="service-list">
                            {items.map((item: any, index: number) => (
                                <article key={item.id || index} className="service selected">
                                    <div className={`icon ${iconColors[index % iconColors.length]}`}>{icons[index % icons.length]}</div>
                                    <div>
                                        <h3>{item.name || item.description || 'Hạng mục chi tiết'}</h3>
                                    </div>
                                    <div className="price"><small>Đơn giá</small>{money(item.price)}</div>
                                    <div className="qty"><button>−</button><strong>{item.quantity}</strong><button>＋</button></div>
                                    <div className="check"></div>
                                </article>
                            ))}
                            {items.length === 0 && (
                                <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 rounded-xl">
                                    Chưa có hạng mục nào được thêm vào tài liệu này.
                                </div>
                            )}
                        </div>
                        <div className="need">＋ Cần giải pháp khác? <a href="#">Liên hệ {companyDisplayName}</a></div>
                    </section>

                    <aside>
                        <div className="panel">
                            <h3>Tóm tắt lựa chọn <span className="tag" style={{ float: 'right', margin: 0 }}>{items.length} mục</span></h3>
                            
                            <div className="max-h-[300px] overflow-y-auto mb-4 border-b border-slate-100 pb-2">
                                {items.map((item: any, index: number) => (
                                    <div key={item.id || index} className="summary-row" style={{ fontSize: '13px' }}>
                                        <span>{item.name || item.description || `Hạng mục ${index + 1}`}<br/><small>x{item.quantity}</small></span>
                                        <strong>{money(item.price * item.quantity)}</strong>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-row"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div>
                            <div className="summary-row"><span>Thuế & Phí khác</span><strong>{money(vatAmount)}</strong></div>
                            <div className="summary-row total"><span>Tổng cộng</span><strong>{money(grandTotal)}</strong></div>
                            
                            <div className="secure">
                                <div className="icon" style={{ background: 'transparent' }}>🛡</div>
                                <div>
                                    <strong>Thông tin của bạn được bảo mật</strong><br/>
                                    <span style={{ color: '#64748b' }}>và chỉ sử dụng để trao đổi công việc.</span>
                                </div>
                            </div>
                            <button className="btn">Xác nhận & Tiếp tục →</button>
                        </div>
                        <div className="panel">
                            <h3>Vì sao chọn {companyDisplayName}?</h3>
                            <div className="why">
                                <div className="why-item"><div className="mini">▦</div><div>Cam kết chất lượng và tiến độ rõ ràng</div></div>
                                <div className="why-item"><div className="mini">👥</div><div>Đội ngũ chuyên gia sẵn sàng hỗ trợ</div></div>
                                <div className="why-item"><div className="mini">◎</div><div>Chi phí hợp lý, tối ưu cho doanh nghiệp</div></div>
                                <div className="why-item"><div className="mini">↻</div><div>Đồng hành 24/7 trong suốt quá trình triển khai</div></div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer>
                © {new Date().getFullYear()} {companyDisplayName}. All rights reserved. 
                <span className="links"><a href="#">Chính sách bảo mật</a><a href="#">Điều khoản sử dụng</a></span>
            </footer>
        </div>
    );
}
