const fs = require('fs');

let code = fs.readFileSync('src/modules/finance/components/document-a4-preview.tsx', 'utf8');

// Fix the @if replacement error
code = code.replace(/\{!\s*\$isPdf\s*&&\s*session\('success'\s*\?\s*\(\)/, '{/* session success */}');

// Fix style="width: 34px;"
code = code.replace(/style="width:\s*(.*?);?"/g, 'style={{ width: "$1" }}');
code = code.replace(/style="text-align:\s*(.*?);?"/g, 'style={{ textAlign: "$1" }}');
code = code.replace(/style="margin-top:\s*(.*?);?"/g, 'style={{ marginTop: "$1" }}');

// Fix class=" => className="
code = code.replace(/class=/g, 'className=');

// Fix HTML entities
code = code.replace(/&nbsp;/g, ' ');
code = code.replace(/<br>/g, '<br />');

// Remove <script src="https://cdn.jsdelivr.net/npm/signature_pad..."></script>
code = code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

// Fix $isPdf error
code = code.replace(/\{!\s*\$isPdf\s*&&([^}]*?)\}/g, '');
code = code.replace(/\{!\s*\$customerSigned\s*&&([^}]*?)\}/g, '');

// Save it back
fs.writeFileSync('src/modules/finance/components/document-a4-preview.tsx', code);
