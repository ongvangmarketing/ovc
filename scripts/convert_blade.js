const fs = require('fs');

let html = fs.readFileSync('scratch-quotation.html', 'utf8');

// Extract the body content inside <main class="sheet">
let mainMatch = html.match(/<main class="sheet">([\s\S]*?)<\/main>/);
let mainContent = mainMatch ? mainMatch[1] : html;

// Basic replacements
let reactCode = mainContent
    .replace(/class=/g, 'className=')
    .replace(/style=/g, 'style=') // Note: inline styles need object format in React, will have to fix manually if there are any.
    .replace(/\{\{\s*(.*?)\s*\}\}/g, '{$1}') // Blade {{ }} to React { }
    .replace(/@if\s*\((.*?)\)/g, '{$1 ? (')
    .replace(/@else/g, ') : (')
    .replace(/@endif/g, ')}')
    .replace(/@foreach\s*\((.*?)\s+as\s+\$index\s*=>\s*\$item\)/g, '{($1 || []).map((item: any, index: number) => (')
    .replace(/@endforeach/g, '))}');

// Fix HTML entities
reactCode = reactCode.replace(/&nbsp;/g, '{"\\u00A0"}');
// Fix unclosed img tags
reactCode = reactCode.replace(/<img(.*?)>/g, (match, p1) => {
    if (match.endsWith('/>')) return match;
    return `<img${p1} />`;
});
// Fix br tags
reactCode = reactCode.replace(/<br>/g, '<br />');

const componentCode = `
import React from 'react';
import './document-a4.css';

export function DocumentA4Preview({ data, type }: { data: any, type: "quotation" | "contract" | "invoice" }) {
    // Computed values
    const company = data.organization || {};
    const customer = data.customer || {};
    
    const formatDate = (val: any) => val ? new Date(val).toLocaleDateString('vi-VN') : '';
    const formatDateTime = (val: any) => val ? new Date(val).toLocaleString('vi-VN') : '';
    const money = (val: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    const richText = (val: string) => {
        if (!val) return null;
        return <span dangerouslySetInnerHTML={{ __html: val.replace(/\\n/g, '<br />') }} />;
    };

    const docCode = data.number || '';
    const docDate = data.createdAt;
    const subtotal = data.subtotal || 0;
    const vatAmount = data.tax || 0;
    const grandTotal = data.total || 0;
    const amountInWords = data.amountInWords || '';
    
    const sellerSigned = !!data.adminSignedAt;
    const customerSigned = !!data.signedAt;
    
    const sellerSignerName = company.representative || 'Người phụ trách';
    const sellerSignerPosition = 'Đại diện công ty';
    const customerSignerName = customer.name || '';
    const customerCompany = customer.company || '';
    const customerPerson = customer.contactPerson || customer.name || '';
    const customerPosition = customer.position || '';
    const customerDisplayName = customerCompany || customerPerson;
    
    const companyDisplayName = (company.name || '').toUpperCase();
    const companyTaxCode = company.taxCode || 'Đang cập nhật';
    const companyAddress = company.address || 'Đang cập nhật';
    const logoSrc = company.logoUrl || null;
    const companyWebsite = company.website || '';

    return (
        <div className="document-a4-wrapper flex justify-center bg-gray-100 py-8">
            <main className="sheet bg-white shadow-xl">
                ${reactCode}
            </main>
        </div>
    );
}
`;

fs.writeFileSync('src/modules/finance/components/document-a4-preview.tsx', componentCode);
console.log("Converted blade to react");
