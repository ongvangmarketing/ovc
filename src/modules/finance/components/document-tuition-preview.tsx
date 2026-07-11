/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { FileText, Hash, Mail, Phone, Shield, Download, UserRound } from 'lucide-react';

export function DocumentTuitionPreview({
    data,
    type,
    signatureSlot,
    paymentSlot,
}: {
    data: any,
    type: "quotation" | "contract" | "invoice",
    signatureSlot?: React.ReactNode,
    paymentSlot?: React.ReactNode,
}) {
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
    const plainText = (value: any) => String(value || '').replace(/<[^>]*>/g, '').trim();

    const subtotal = data.subtotal || 0;
    const vatAmount = data.tax || 0;
    const grandTotal = data.total || 0;
    const discountAmount = Number(data.discountAmount ?? data.discount ?? 0);
    
    const customerPerson = customer.contactPerson || customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Quý khách';
    const companyDisplayName = companySettings.company_name || company.name || 'Công ty';
    const configuredLogo = companyValue('company_logo_url', 'logo');
    const logoSrc = configuredLogo && !configuredLogo.toLowerCase().endsWith('.ico') ? configuredLogo : null;
    const readableName = (value: any) => {
        const text = String(value || '').trim();
        if (!text) return '';
        const letters = text.replace(/[^A-Za-zÀ-ỹ]/g, '');
        if (letters && letters === letters.toUpperCase()) {
            return text.toLocaleLowerCase('vi-VN').replace(/(^|[\s-])(\p{L})/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('vi-VN')}`);
        }
        return text;
    };

    const items = data.items || [];
    const noteText = plainText(data.note || data.notes) || "Chưa có ghi chú.";
    const termsText = plainText(data.terms || data.termsAndConditions) || "Chưa có điều khoản.";

    const documentTypeMap = {
        quotation: "Báo giá",
        contract: "Hợp đồng",
        invoice: "Hóa đơn"
    };
    const documentName = documentTypeMap[type] || "Tài liệu";

    const heroTitleMap = {
        quotation: "báo giá chi tiết.",
        contract: "hợp đồng dịch vụ.",
        invoice: "thông báo học phí."
    };

    const heroDescMap = {
        quotation: "Dưới đây là chi tiết các hạng mục chi phí được đề xuất. Chúng tôi đã thiết kế bảng báo giá này dựa trên yêu cầu cụ thể của bạn để đảm bảo hiệu quả tốt nhất.",
        contract: "Dưới đây là chi tiết các hạng mục và điều khoản trong hợp đồng. Vui lòng xem xét kỹ các nội dung trước khi tiến hành xác nhận ký kết.",
        invoice: "Dưới đây là chi tiết học phí khóa học. Vui lòng kiểm tra thông tin và tiến hành thanh toán để hoàn tất thủ tục ghi danh."
    };

    const totalLabelMap = {
        quotation: "Tổng báo giá",
        contract: "Tổng hợp đồng",
        invoice: "Tổng học phí"
    };
    const createdDate = data.issueDate
        ? new Date(data.issueDate).toLocaleDateString('vi-VN')
        : data.createdAt
            ? new Date(data.createdAt).toLocaleDateString('vi-VN')
            : new Date().toLocaleDateString('vi-VN');
    const statusLabel = data.status === 'DRAFT'
        ? 'Bản nháp'
        : data.status === 'SENT'
            ? 'Đã gửi'
            : data.status === 'APPROVED'
                ? 'Đã duyệt'
                : data.status === 'COMPLETED'
                    ? 'Hoàn thành'
                    : data.status === 'CANCELLED'
                        ? 'Đã hủy'
                        : 'Mới';
    const documentCode = data.number || data.code || data.id?.slice(-6).toUpperCase() || 'NEW';

    return (
        <div
            className="w-full bg-[#fafafa] min-h-screen font-sans text-black pb-20"
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'geometricPrecision',
                fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
            }}
        >
            {/* Topbar */}
            <header className="sticky top-0 z-20 border-b border-[#eaeaea] bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-[64px] w-full max-w-[1060px] items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        {logoSrc ? (
                            <img src={logoSrc} alt={companyDisplayName} className="h-9 w-auto max-w-[140px] object-contain" />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white font-medium text-[15px] tracking-[-0.005em]">
                                {companyDisplayName.substring(0, 1).toUpperCase()}
                            </div>
                        )}
                        {!logoSrc && <div className="text-[15px] font-medium tracking-[-0.01em]">{companyDisplayName}</div>}
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col text-right">
                            <div className="text-[15px] font-normal uppercase tracking-[0.06em] text-gray-400">Số {documentName.toLowerCase()}</div>
                            <div className="text-[15px] font-medium tracking-[-0.01em] text-black">#{documentCode}</div>
                        </div>
                        <div className="hidden sm:flex flex-col text-right">
                            <div className="text-[15px] font-normal uppercase tracking-[0.06em] text-gray-400">Ngày tạo</div>
                            <div className="text-[15px] font-medium tracking-[-0.01em] text-black">
                                {createdDate}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex h-7 items-center rounded-full border border-[#eaeaea] bg-white px-3 text-[15px] font-normal tracking-[-0.005em] text-black whitespace-nowrap">
                                {statusLabel}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="border-b border-[#eaeaea] bg-white">
                <div className="mx-auto flex max-w-[1060px] items-start justify-between gap-8 px-6 py-6">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[15px] font-normal tracking-[-0.005em] text-gray-600">
                            <FileText className="h-3.5 w-3.5 text-black" />
                            Xin chào {customerPerson}
                        </div>
                        <h1 className="max-w-3xl text-[34px] font-normal leading-[1.16] tracking-[-0.035em] text-black">
                            {companyDisplayName} gửi Quý khách{" "}
                            <span className="text-gray-400">{heroTitleMap[type] || "giải pháp phù hợp nhất."}</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-gray-500">
                            {heroDescMap[type] || "Dưới đây là chi tiết các hạng mục được đề xuất."}
                        </p>
                    </div>
                    <aside className="hidden w-[320px] shrink-0 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white p-5 lg:block">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eaeaea] bg-white">
                                <FileText className="h-5 w-5 text-black" />
                            </div>
                            <span className="rounded-md border border-[#eaeaea] bg-white px-2.5 py-1 text-[15px] font-normal tracking-[-0.005em] text-black">{statusLabel}</span>
                        </div>
                        <div className="mt-5">
                            <p className="text-[15px] font-normal uppercase tracking-[0.06em] text-gray-400">{documentName}</p>
                            <p className="mt-1 text-[24px] font-medium leading-tight tracking-[-0.035em] text-black">{money(grandTotal).replace("₫", "đ")}</p>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-amber-100 pt-4 text-[15px]">
                            <div>
                                <p className="font-normal tracking-[-0.005em] text-gray-400">Ngày tạo</p>
                                <p className="mt-1 font-medium tracking-[-0.01em] text-black">{createdDate}</p>
                            </div>
                            <div>
                                <p className="font-normal tracking-[-0.005em] text-gray-400">Mã tài liệu</p>
                                <p className="mt-1 font-medium tracking-[-0.01em] text-black">#{documentCode}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Main Content */}
            <main className="mx-auto max-w-[1060px] px-6 pt-8">
                <div className="flex flex-col gap-8">
                    
                    {/* Left Column - Items */}
                    <div className="space-y-7">
                        {/* Information Grid: Company & Customer */}
                        <div className="overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
                            <div className="relative overflow-hidden p-5">
                                <h3 className="inline-flex w-fit rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[15px] font-medium uppercase tracking-[0.06em] text-amber-700">Đơn vị đào tạo</h3>
                                <div className="relative mt-4">
                                    <p className="text-[22px] font-normal leading-[1.2] tracking-[-0.035em] text-black">{companyDisplayName}</p>
                                    <div className="mt-4 grid gap-x-6 gap-y-2 text-[15px] font-normal leading-[1.65] tracking-[-0.005em] text-gray-500 sm:grid-cols-2">
                                        <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-gray-400" />Đại diện: {companyValue('company_director') || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Hash className="h-3.5 w-3.5 text-gray-400" />Mã số thuế: {companyValue('company_tax_code') || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" />Số điện thoại: {companyValue('company_phone') || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" />Email: {companyValue('company_email') || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative overflow-hidden border-t border-[#eaeaea] p-5">
                                <h3 className="inline-flex w-fit rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[15px] font-medium uppercase tracking-[0.06em] text-amber-700">Thông tin học viên</h3>
                                <div className="relative mt-4">
                                    <p className="text-[22px] font-normal leading-[1.2] tracking-[-0.035em] text-black">{readableName(customer.name || customer.company?.name || customerPerson)}</p>
                                    <div className="mt-4 grid gap-x-6 gap-y-2 text-[15px] font-normal leading-[1.65] tracking-[-0.005em] text-gray-500 sm:grid-cols-2">
                                        <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-gray-400" />Đại diện: {customer.contactPerson || customerPerson}</p>
                                        <p className="flex items-center gap-2"><Hash className="h-3.5 w-3.5 text-gray-400" />Mã số thuế: {customer.taxCode || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" />Số điện thoại: {customer.phone || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" />Email: {customer.email || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 sm:p-6">
                            <div>
                                <h2 className="text-[20px] font-medium leading-[1.25] tracking-[-0.035em] text-black">Sản phẩm &amp; dịch vụ</h2>
                                <p className="mt-2 text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-[#6b7280]">Danh sách các hạng mục trong {documentName.toLowerCase()}.</p>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-xl border border-[#eaeaea] bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[820px] table-fixed border-collapse">
                                        <thead>
                                            <tr className="bg-white text-[15px] font-normal tracking-[-0.005em] text-gray-500">
                                                <th className="w-[38%] whitespace-nowrap border-b border-r border-[#e5e7eb] px-5 py-4 text-left font-normal">Khóa học / Lớp học</th>
                                                <th className="w-[11%] whitespace-nowrap border-b border-r border-[#e5e7eb] px-3 py-4 text-center font-normal">Đơn vị</th>
                                                <th className="w-[12%] whitespace-nowrap border-b border-r border-[#e5e7eb] px-3 py-4 text-center font-normal">Số lượng</th>
                                                <th className="w-[15%] whitespace-nowrap border-b border-r border-[#e5e7eb] px-4 py-4 text-right font-normal">Đơn giá</th>
                                                <th className="w-[10%] whitespace-nowrap border-b border-r border-[#e5e7eb] px-3 py-4 text-center font-normal">Thuế</th>
                                                <th className="w-[14%] whitespace-nowrap border-b border-[#e5e7eb] px-5 py-4 text-right font-normal">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length > 0 ? items.map((item: any, index: number) => {
                                                const quantity = Number(item.quantity || 1);
                                                const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
                                                const total = Number(item.total ?? unitPrice * quantity);
                                                const taxRate = Number(item.taxRate ?? item.tax ?? 0);

                                                return (
                                                    <tr key={item.id || index} className="text-[15px] font-normal leading-[1.65] tracking-[-0.005em] text-[#334155]">
                                                        <td className="border-r border-[#e5e7eb] px-5 py-5 align-top">
                                                            <div className="font-normal tracking-[-0.01em] text-[#1f2937]">{item.name || item.description || `Hạng mục ${index + 1}`}</div>
                                                        </td>
                                                        <td className="border-r border-[#e5e7eb] px-3 py-5 text-center align-top">{item.unit || "Lần"}</td>
                                                        <td className="border-r border-[#e5e7eb] px-3 py-5 text-center align-top">{quantity}</td>
                                                        <td className="border-r border-[#e5e7eb] px-4 py-5 text-right align-top">{money(unitPrice).replace("₫", "đ")}</td>
                                                        <td className="border-r border-[#e5e7eb] px-3 py-5 text-center align-top">{taxRate}%</td>
                                                        <td className="px-5 py-5 text-right align-top font-medium">{money(total).replace("₫", "đ")}</td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td className="px-5 py-6 text-[15px] text-[#64748b]" colSpan={6}>Chưa có hạng mục nào được thêm vào tài liệu này.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-[#eaeaea] pt-4">
                                <div className="grid gap-x-10 md:grid-cols-2">
                                    <div className="divide-y divide-[#eaeaea]">
                                        <div className="flex items-center justify-between gap-5 py-3 text-[15px] font-normal leading-[1.55] tracking-[-0.005em]">
                                            <span className="text-gray-500">Loại chiết khấu:</span>
                                            <span className="font-medium tracking-[-0.01em] text-black">VND</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-5 py-3 text-[15px] font-normal leading-[1.55] tracking-[-0.005em]">
                                            <span className="text-gray-500">Chiết khấu:</span>
                                            <span className="font-medium tracking-[-0.01em] text-black">{discountAmount.toLocaleString("vi-VN")}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-5 py-3 text-[15px] font-normal leading-[1.55] tracking-[-0.005em]">
                                            <span className="text-gray-500">Tổng chiết khấu:</span>
                                            <span className="font-medium tracking-[-0.01em] text-red-500">-{money(discountAmount).replace("₫", "đ")}</span>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-[#eaeaea] border-t border-[#eaeaea] md:border-t-0">
                                        <div className="flex items-center justify-between gap-5 py-3 text-[15px] font-normal leading-[1.55] tracking-[-0.005em]">
                                            <span className="text-gray-500">Tạm tính:</span>
                                            <span className="font-medium tracking-[-0.01em] text-black">{money(subtotal).replace("₫", "đ")}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-5 py-3 text-[15px] font-normal leading-[1.55] tracking-[-0.005em]">
                                            <span className="text-gray-500">Tổng thuế:</span>
                                            <span className="font-medium tracking-[-0.01em] text-black">{money(vatAmount).replace("₫", "đ")}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-5 py-3 text-[16px] tracking-[-0.01em]">
                                            <span className="font-medium text-black">{totalLabelMap[type] || "Tổng cộng"}:</span>
                                            <span className="text-[22px] font-medium leading-none tracking-[-0.035em] text-black">{money(grandTotal).replace("₫", "đ")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 sm:p-6">
                            <div>
                                <h2 className="text-[20px] font-medium leading-[1.25] tracking-[-0.035em] text-black">Ghi chú &amp; điều khoản</h2>
                                <p className="mt-2 text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-[#6b7280]">Các thông tin gửi kèm cho khách hàng.</p>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-[16px] border border-[#edf0f5] bg-[#f8fafc] p-5">
                                    <h3 className="text-[15px] font-medium tracking-[-0.01em] text-[#1f2937]">Ghi chú gửi khách</h3>
                                    <p className="mt-3 whitespace-pre-wrap text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-[#475569]">{noteText}</p>
                                </div>
                                <div className="rounded-[16px] border border-[#edf0f5] bg-[#f8fafc] p-5">
                                    <h3 className="text-[15px] font-medium tracking-[-0.01em] text-[#1f2937]">Điều khoản</h3>
                                    <p className="mt-3 whitespace-pre-wrap text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-[#475569]">{termsText}</p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Actions */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                            {/* Download PDF Card */}
                            <a 
                                href={`/document/${data.token}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col gap-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white p-5 transition-colors hover:border-amber-200 cursor-pointer group sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-[#eaeaea]">
                                        <Download className="h-5 w-5 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-medium tracking-[-0.01em] text-black">Tải bản PDF</p>
                                        <p className="text-[15px] font-normal leading-[1.55] tracking-[-0.005em] text-gray-500">Bản in chất lượng cao</p>
                                    </div>
                                </div>
                                <div className="flex min-h-10 w-full items-center justify-center rounded-full bg-black px-4 text-[14px] font-medium uppercase tracking-[0.04em] text-white transition-colors group-hover:bg-gray-800 sm:min-h-8 sm:w-auto sm:text-[15px]">
                                    Tải xuống
                                </div>
                            </a>

                            <div className="mt-6 flex items-start gap-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-4 text-[15px] font-normal leading-[1.75] tracking-[-0.005em] text-gray-500">
                                <Shield className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                                <p>Thông tin của bạn được bảo mật và chỉ sử dụng để trao đổi công việc liên quan đến tài liệu này.</p>
                            </div>
                        </div>
                    </div>

                    {signatureSlot || paymentSlot ? (
                        <section className="rounded-2xl border border-[#eaeaea] bg-white p-5 sm:p-6">
                            {paymentSlot && (
                                <div className="mb-8 flex justify-center">
                                    {paymentSlot}
                                </div>
                            )}
                            {signatureSlot}
                        </section>
                    ) : null}

                    <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 text-center">
                        <p className="text-[15px] font-normal leading-[1.65] tracking-[-0.005em] text-gray-600">
                            Bạn cần giải pháp khác? <a href="#" className="font-medium text-black hover:underline">Liên hệ {companyDisplayName}</a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-[#eaeaea] bg-white py-8 text-center">
                <p className="text-[15px] font-normal tracking-[-0.005em] text-gray-500">
                    © {new Date().getFullYear()} {companyDisplayName}. All rights reserved.
                </p>
                <div className="mt-2 flex justify-center gap-6 text-[15px] font-normal tracking-[-0.005em]">
                    <a href="#" className="text-gray-400 hover:text-black transition-colors">Chính sách bảo mật</a>
                    <a href="#" className="text-gray-400 hover:text-black transition-colors">Điều khoản sử dụng</a>
                </div>
            </footer>
        </div>
    );
}
