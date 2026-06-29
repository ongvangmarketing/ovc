/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { getPaymentChannel, getVietQrUrl, normalizePaymentChannelKeys } from '@/lib/finance/payment-channels';
import './document-a4.css';

export function DocumentA4Preview({ data, type }: { data: any, type: "quotation" | "contract" | "invoice" }) {
    // Computed values
    const company = data.organization || {};
    const customer = data.contact || data.customer || {};
    
    const formatDate = (val: any) => val ? new Date(val).toLocaleDateString('vi-VN') : '';
    const formatDateTime = (val: any) => val ? new Date(val).toLocaleString('vi-VN') : '';
    const money = (val: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const richText = (val: string) => {
        if (!val) return null;
        return <span dangerouslySetInnerHTML={{ __html: val.replace(/\n/g, '<br />') }} />;
    };

    const docCode = data.number || '';
    const docDate = data.createdAt;
    const subtotal = data.subtotal || 0;
    const vatAmount = data.tax || 0;
    const grandTotal = data.total || 0;
    const amountPaid = Number(data.amountPaid || 0);
    const amountDue = Math.max(0, Number(grandTotal || 0) - amountPaid);
    const paymentAmount = type === 'invoice' ? amountDue : Number(grandTotal || 0);
    const paymentContent = type === 'contract'
        ? `Thanh toan hop dong ${docCode}`
        : type === 'invoice'
            ? `Thanh toan ${docCode}`
            : '';
    const paymentChannelKeys = type === 'contract' || type === 'invoice'
        ? normalizePaymentChannelKeys(data.paymentChannels)
        : [];
    const amountInWords = data.amountInWords || '';
    
    const sellerSigned = !!data.adminSignedAt;
    const customerSigned = !!data.signedAt;
    const customerSignature = data.signature || null;
    
    const sellerSignerName = company.representative || 'Người phụ trách';
    const sellerSignerPosition = 'Đại diện công ty';
    const customerSignerName = customerSignature?.signerName || customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '';
    const customerCompany =
        typeof customer.company === 'string'
            ? customer.company
            : customer.company?.name || '';
    const customerPerson = customer.contactPerson || customer.name || '';
    const customerPosition = customer.position || '';
    const customerDisplayName = customerCompany || customerPerson || 'Khách hàng';
    
    const companyDisplayName = (company.name || '').toUpperCase();
    const companyTaxCode = company.taxCode || 'Đang cập nhật';
    const companyAddress = company.address || 'Đang cập nhật';
    const logoSrc = company.logoUrl || '/brand/ong-vang-logo.png';
    const companyWebsite = company.website || '';

    const title = type === 'quotation' ? 'Báo Giá Dịch Vụ' : type === 'contract' ? 'Hợp Đồng Dịch Vụ' : 'Hóa Đơn';

    return (
        <div className="document-a4-wrapper flex justify-center bg-gray-100 py-8">
            <main className="sheet bg-white shadow-xl">
                <header className="topbar no-break">
                    <section className="company">
                        <div className="brand-row">
                            {logoSrc && (
                                <img className="logo-image" src={logoSrc} alt={companyDisplayName} />
                            )}
                            <div>
                                <div className="company-name">{companyDisplayName}</div>
                            </div>
                        </div>

                        {companyTaxCode && (
                            <div className="company-line">MST: {companyTaxCode}</div>
                        )}
                        {companyAddress && (
                            <div className="company-line">{companyAddress}</div>
                        )}
                        <div className="company-line">
                            {company.phone || ''} | {company.email || ''}{companyWebsite ? ` | ${companyWebsite}` : ''}
                        </div>
                    </section>

                    <section className="national">
                        <div className="national-title">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
                        <div className="national-subtitle">Độc lập - Tự do - Hạnh phúc</div>
                        <div className="dash">----- ★ -----</div>
                        <div className="meta">Số: <strong>{docCode}</strong></div>
                        <div className="meta">Ngày lập: <strong>{formatDate(docDate)}</strong></div>
                    </section>
                </header>

                <section className="title-block no-break">
                    <h1>{title}</h1>
                    <div className="accent-line"></div>
                </section>

                <p className="intro"><strong>Kính gửi:</strong> {customerDisplayName}</p>
                <p className="intro small">{companyDisplayName} trân trọng gửi đến Quý khách hàng chi tiết như sau:</p>

                <section className="section parties no-break">
                    <div className="section-label">I. Thông tin các bên</div>
                    <div className="party-grid">
                        <div className="party-box">
                            <h2>Bên A: Đơn vị cung cấp</h2>
                            <div className="info-row"><span>Tên đơn vị</span><b>:</b><div><strong>{companyDisplayName}</strong></div></div>
                            <div className="info-row"><span>Người đại diện</span><b>:</b><div>{sellerSignerName}</div></div>
                            <div className="info-row"><span>Chức danh</span><b>:</b><div>{sellerSignerPosition}</div></div>
                            <div className="info-row"><span>Mã số thuế</span><b>:</b><div>{companyTaxCode}</div></div>
                            <div className="info-row"><span>Địa chỉ</span><b>:</b><div>{companyAddress}</div></div>
                            <div className="info-row"><span>Điện thoại</span><b>:</b><div>{company.phone || ''}</div></div>
                            <div className="info-row"><span>Email</span><b>:</b><div>{company.email || ''}</div></div>
                        </div>

                        <div className="party-box light">
                            <h2>Bên B: Khách hàng</h2>
                            {customerCompany ? (
                                <>
                                    <div className="info-row"><span>Tên công ty</span><b>:</b><div><strong>{customerCompany}</strong></div></div>
                                    <div className="info-row"><span>Người đại diện</span><b>:</b><div>{customerPerson}</div></div>
                                    {customerPosition && (
                                        <div className="info-row"><span>Chức danh</span><b>:</b><div>{customerPosition}</div></div>
                                    )}
                                </>
                            ) : (
                                <div className="info-row"><span>Tên khách hàng</span><b>:</b><div><strong>{customerPerson}</strong></div></div>
                            )}
                            <div className="info-row"><span>Điện thoại</span><b>:</b><div>{customer.phone || ''}</div></div>
                            <div className="info-row"><span>Email</span><b>:</b><div>{customer.email || ''}</div></div>
                        </div>
                    </div>
                </section>

                <section className="section no-break">
                    <div className="section-label">II. Nội dung chi tiết</div>
                    <div className="overflow-x-auto w-full">
                        <table className="price-table min-w-[600px] sm:min-w-full">
                            <thead>
                                <tr>
                                    <th style={{ width: "34px" }}>STT</th>
                                    <th>Nội dung dịch vụ</th>
                                    <th style={{ width: "64px" }}>ĐVT</th>
                                    <th style={{ width: "48px" }}>SL</th>
                                    <th style={{ width: "112px" }}>Đơn giá (VND)</th>
                                    <th style={{ width: "122px" }}>Thành tiền (VND)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.items || []).map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{item.description}</strong>
                                        </td>
                                        <td>{item.unit || '-'}</td>
                                        <td>{item.quantity || 1}</td>
                                        <td>{money(item.unitPrice || 0)}</td>
                                        <td>{money(item.total || (item.quantity * item.unitPrice))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="summary-grid no-break">
                    <div className="box total-box">
                        <table className="total-table">
                            <tbody>
                                <tr><td>Tạm tính</td><td>{money(subtotal)}</td></tr>
                                <tr><td>VAT / Thuế</td><td>{money(vatAmount)}</td></tr>
                                <tr className="grand"><td>Tổng cộng</td><td>{money(grandTotal)}</td></tr>
                            </tbody>
                        </table>
                        {amountInWords && (
                            <p className="words"><strong>Bằng chữ:</strong> {amountInWords}</p>
                        )}
                    </div>

                    <div className="box terms-box">
                        <div className="term-title">Ghi chú & Điều khoản</div>
                        <div className="term-content">
                            {data.notes && <div className="mb-2"><strong>Ghi chú:</strong><br/>{richText(data.notes)}</div>}
                            {data.terms && <div><strong>Điều khoản:</strong><br/>{richText(data.terms)}</div>}
                            {!data.notes && !data.terms && <span>Không có ghi chú.</span>}
                        </div>
                    </div>
                </section>

                {paymentChannelKeys.length ? (
                    <section className="section payment-section no-break">
                        <div className="section-label">Kênh thanh toán</div>
                        <div className="payment-box">
                            {paymentChannelKeys.map((key) => {
                                const channel = getPaymentChannel(key);
                                const qrUrl = getVietQrUrl(key, paymentAmount, paymentContent);

                                return (
                                    <div className="payment-row" key={key}>
                                        <img className="vietqr" src={qrUrl} alt={`VietQR ${channel.label}`} />
                                        <div className="payment-info-wrap">
                                            <div className="payment-row-title">{channel.label}</div>
                                            <div className="payment-info"><span>Chủ TK</span>: <strong>{channel.accountName}</strong></div>
                                            <div className="payment-info"><span>Số TK</span>: <strong>{channel.accountNumber}</strong></div>
                                            <div className="payment-info"><span>Ngân hàng</span>: {channel.bankName}</div>
                                            <div className="payment-info"><span>Số tiền</span>: <strong>{money(paymentAmount)}</strong></div>
                                            <div className="payment-info"><span>Nội dung</span>: {paymentContent}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                <section className="section sign-section no-break">
                    <div className="sign-grid">
                        <div className="sign-box">
                            <div className="sign-party">Bên A</div>
                            <div className="sign-sub">Đơn vị cung cấp dịch vụ</div>
                            <div className={`esign ${sellerSigned ? 'signed' : 'pending'}`}>
                                {sellerSigned ? 'Đã ký' : 'Chờ ký điện tử'}
                            </div>
                            <div className="signature-line">
                                <span>Họ tên: <strong>{sellerSigned ? sellerSignerName : ''}</strong></span>
                            </div>
                            <div className="job-title">Chức danh: {sellerSigned ? sellerSignerPosition : ''}</div>
                            <div className="signature-id">Thời gian ký: {formatDateTime(data.adminSignedAt)}</div>
                            <div className="signature-id">Signature ID: </div>
                            <div className="signature-id">IP: </div>
                            <div className="signature-id user-agent">UserAgent: </div>
                        </div>

                        <div className="sign-box">
                            <div className="sign-party">Bên B</div>
                            <div className="sign-sub">Khách hàng</div>
                            <div className={`esign ${customerSigned ? 'signed' : 'pending'}`}>
                                {customerSigned ? 'Đã ký' : 'Chờ ký điện tử'}
                            </div>
                            <div className="signature-line">
                                <span>Họ tên: <strong>{customerSigned ? customerSignerName : ''}</strong></span>
                                {customerSignature?.signatureData?.startsWith('data:image') ? (
                                    <img className="signature-thumb" src={customerSignature.signatureData} alt="Chữ ký khách hàng" />
                                ) : null}
                            </div>
                            <div className="signature-id">Thời gian ký: {formatDateTime(data.signedAt || customerSignature?.createdAt)}</div>
                            <div className="signature-id">Signature ID: {customerSignature?.id || ''}</div>
                            <div className="signature-id">IP: {customerSignature?.ipAddress || ''}</div>
                            <div className="signature-id user-agent">UserAgent: {customerSignature?.userAgent || ''}</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
