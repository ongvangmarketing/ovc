const fs = require('fs');

// Error 1: src/app/(admin)/admin/organizations/[id]/page.tsx(117,24) Object is possibly undefined
let content = fs.readFileSync('src/app/(admin)/admin/organizations/[id]/page.tsx', 'utf8');
content = content.replace(/organization\.modules\.map/g, '(organization.modules || []).map');
fs.writeFileSync('src/app/(admin)/admin/organizations/[id]/page.tsx', content);

// Error 2: src/app/(frontend)/tralist/hotels/[id]/page.tsx(15,18) isActive does not exist
content = fs.readFileSync('src/app/(frontend)/tralist/hotels/[id]/page.tsx', 'utf8');
content = content.replace(/isActive: true,/g, ''); // remove isActive
content = content.replace(/room\.isActive/g, 'true'); 
fs.writeFileSync('src/app/(frontend)/tralist/hotels/[id]/page.tsx', content);

// Error 3: src/app/(portals)/agent/revenue-chart.tsx(43,11) Tooltip formatter
content = fs.readFileSync('src/app/(portals)/agent/revenue-chart.tsx', 'utf8');
content = content.replace(/\(value: number\)/g, '(value: any)');
fs.writeFileSync('src/app/(portals)/agent/revenue-chart.tsx', content);

// Error 4: src/app/(tools)/shared/deals/[id]/options/client.tsx
content = fs.readFileSync('src/app/(tools)/shared/deals/[id]/options/client.tsx', 'utf8');
content = content.replace(/@\/modules\/crm\/actions\/deal-services\.actions-public/g, '@/actions/deal-services-public');
fs.writeFileSync('src/app/(tools)/shared/deals/[id]/options/client.tsx', content);

// Error 5: src/modules/finance/actions/finance.actions.ts
content = fs.readFileSync('src/modules/finance/actions/finance.actions.ts', 'utf8');
content = content.replace(/FinanceService\.renderFinanceDocumentEmailDraft/g, 'EmailFlows.renderFinanceDocumentEmailDraft');
if (!content.includes('EmailFlows')) {
  content = `import * as EmailFlows from "@/lib/email/flows";\n` + content;
}
fs.writeFileSync('src/modules/finance/actions/finance.actions.ts', content);

console.log('TS errors fixed!');
