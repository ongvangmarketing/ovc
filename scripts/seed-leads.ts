import { db } from "../src/lib/db/index";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { LeadService } from "../src/lib/services/lead.service";

// Define aliases to normalize column names
const nameAliases = ['Tên KH', 'Họ và tên', 'HỌ VÀ TÊN', 'Tên học viên'];
const emailAliases = ['Email KH', 'Email nhận tài liệu', 'Thư điện tử'];
const phoneAliases = ['SĐT KH', 'Số điện thoại 2', 'Điện thoại', 'SỐ ĐIỆN THOẠI'];
const sourceAliases = ['source', 'fc_utm_source', 'lc_utm_source'];
const noteAliases = ['Danh sách khóa học', 'Câu hỏi muốn dành cho mentor', 'Khóa học đăng ký'];

function findColumn(row: any, aliases: string[]): string | undefined {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && row[alias] !== '') {
      return String(row[alias]).trim();
    }
  }
  return undefined;
}

async function processFile(filePath: string, orgId: string, systemUserId: string) {
  console.log(`Processing file: ${filePath}`);
  try {
    const workbook = XLSX.readFile(filePath);
    let totalRows = 0;
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data as any[]) {
        const fullName = findColumn(row, nameAliases);
        const email = findColumn(row, emailAliases);
        const phone = findColumn(row, phoneAliases);
        const utmSource = findColumn(row, sourceAliases) || path.basename(filePath, '.xlsx');
        const note = findColumn(row, noteAliases);
        
        if (!fullName || (!email && !phone)) {
          continue; // Skip invalid rows
        }

        // Check if customer already exists in CRM
        const existingContact = await db.contact.findFirst({
          where: {
            organizationId: orgId,
            OR: [
              ...(email ? [{ email }] : []),
              ...(phone ? [{ phone }] : [])
            ]
          }
        });

        const leadData = {
          organizationId: orgId,
          fullName,
          email,
          phone,
          utmSource,
          note,
          createdBy: systemUserId
        };

        const newLead = await LeadService.createLead(leadData);

        if (existingContact) {
          // Mark as converted since it matches an existing CRM customer
          await db.lead.update({
            where: { id: newLead.id },
            data: {
              status: "CONVERTED",
              convertedCustomerId: existingContact.id,
              convertedAt: new Date()
            }
          });
          console.log(`[CONVERTED] ${fullName} - Matches existing CRM Contact`);
        } else {
           console.log(`[NEW LEAD] ${fullName}`);
        }
        totalRows++;
      }
    }
    console.log(`Processed ${totalRows} valid leads from ${filePath}\n`);
  } catch (e: any) {
    console.log(`Error processing file ${filePath}: ${e.message}\n`);
  }
}

async function main() {
  const org = await db.organization.findFirst({ where: { slug: "ovmain" } }) || 
              await db.organization.findFirst({ where: { slug: "OVMAIN" } });
  
  if (!org) {
    console.error("Organization OVMAIN not found");
    return;
  }

  const superAdmin = await db.user.findFirst({ where: { email: { contains: "admin" } } }) || 
                     await db.user.findFirst();
                     
  const systemUserId = superAdmin ? superAdmin.id : undefined;

  const targetDirs = ['khongup', 'khongup/lead', 'khongup/daotao'];
  
  for (const dir of targetDirs) {
    const fullDir = path.resolve(__dirname, '..', dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir);
      for (const file of files) {
        const fullPath = path.join(fullDir, file);
        if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.xlsx')) {
          await processFile(fullPath, org.id, systemUserId!);
        }
      }
    }
  }
  
  console.log("Done seeding leads.");
}

main().catch(console.error).finally(() => process.exit(0));
