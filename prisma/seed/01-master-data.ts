require("dotenv").config();
const { db } = require("../../src/lib/db");

async function main() {
  console.log("Seeding Master Data (Phase 1)...");

  const orgA = await db.organization.findFirst({
    where: { name: { contains: "Công ty A" } },
  });

  if (!orgA) {
    throw new Error("Công ty A not found! Please ensure it exists.");
  }

  const orgId = orgA.id;

  // 1. Settings (Catalog, Payment Channels, Info, Numeration)
  const settingsData = [
    {
      key: "company_info",
      type: "json",
      value: JSON.stringify({
        name: "Công ty TNHH Ong Vàng A",
        taxCode: "0102030405",
        address: "123 Đường Số 1, Quận 1, TP.HCM",
        hotline: "1900 1234",
        email: "contact@congtya.vn",
        website: "https://congtya.vn",
        logoUrl: "https://placehold.co/400x100?text=Cong+Ty+A"
      })
    },
    {
      key: "smtp_settings",
      type: "json",
      value: JSON.stringify({
        host: "smtp.mailtrap.io",
        port: 2525,
        user: "demo",
        pass: "demo",
        from: "info@congtya.vn"
      })
    },
    {
      key: "bank_accounts",
      type: "json",
      value: JSON.stringify([
        {
          bank: "Vietcombank",
          accountNumber: "0011002200330",
          accountName: "CÔNG TY TNHH ONG VÀNG A",
          qrUrl: "https://placehold.co/300x300?text=Vietcombank+QR"
        }
      ])
    },
    {
      key: "document_numbers",
      type: "json",
      value: JSON.stringify({
        quotationPrefix: "BG-A-",
        contractPrefix: "HD-A-",
        invoicePrefix: "HDDT-",
        receiptPrefix: "PT-A-"
      })
    },
    {
      key: "service_catalog",
      type: "json",
      value: JSON.stringify([
        {
          id: "svc-crm-01",
          name: "Triển khai phần mềm CRM Core",
          unit: "Gói",
          defaultPrice: 150000000,
          description: "Gói triển khai phần mềm CRM cho doanh nghiệp vừa và nhỏ"
        },
        {
          id: "svc-fin-01",
          name: "Tích hợp Hóa đơn điện tử",
          unit: "Gói",
          defaultPrice: 20000000,
          description: "Tích hợp hóa đơn điện tử eInvoice/VNPT"
        }
      ])
    },
    {
      key: "payment_channels",
      type: "json",
      value: JSON.stringify(["BANK_TRANSFER", "CASH", "MOMO"])
    }
  ];

  for (const setting of settingsData) {
    await db.setting.upsert({
      where: {
        organizationId_key: {
          organizationId: orgId,
          key: setting.key
        }
      },
      update: {
        value: setting.value,
        type: setting.type
      },
      create: {
        organizationId: orgId,
        key: setting.key,
        value: setting.value,
        type: setting.type
      }
    });
  }
  console.log("Settings seeded.");

  // 2. Email Templates
  const templates = [
    {
      code: "SEND_QUOTATION",
      name: "Gửi báo giá dịch vụ",
      subject: "Báo giá dịch vụ {{service_name}} từ {{company_name}}",
      body: "Kính gửi {{customer_name}},<br/><br/>Gửi anh/chị báo giá mới nhất. Vui lòng xem tài liệu tại đây: {{document_link}}",
      variables: ["customer_name", "company_name", "service_name", "document_link"]
    },
    {
      code: "SEND_CONTRACT",
      name: "Gửi hợp đồng điện tử",
      subject: "Hợp đồng dịch vụ {{contract_code}} - {{company_name}}",
      body: "Kính gửi {{customer_name}},<br/><br/>Hợp đồng đã được soạn thảo, mời anh/chị xem và ký số tại: {{document_link}}",
      variables: ["customer_name", "company_name", "contract_code", "document_link"]
    },
    {
      code: "SEND_INVOICE",
      name: "Gửi Hóa đơn thanh toán",
      subject: "Hóa đơn {{invoice_code}} từ {{company_name}}",
      body: "Kính gửi {{customer_name}},<br/><br/>Vui lòng thanh toán hóa đơn {{invoice_code}} số tiền {{amount}}. Xem chi tiết: {{document_link}}",
      variables: ["customer_name", "company_name", "invoice_code", "amount", "document_link"]
    }
  ];

  for (const tpl of templates) {
    await db.emailTemplate.upsert({
      where: {
        organizationId_code: {
          organizationId: orgId,
          code: tpl.code
        }
      },
      update: {
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
        variables: tpl.variables,
        isActive: true
      },
      create: {
        organizationId: orgId,
        code: tpl.code,
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
        variables: tpl.variables,
        isActive: true
      }
    });
  }
  console.log("Email Templates seeded.");

  console.log("Master Data (Phase 1) Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
