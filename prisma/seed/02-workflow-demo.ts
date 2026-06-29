require("dotenv").config();
const { db } = require("../../src/lib/db");

async function main() {
  console.log("Seeding Workflow Demo Data (Phase 2)...");

  const orgA = await db.organization.findFirst({
    where: { name: { contains: "Công ty A" } },
  });

  const admin = await db.user.findFirst({
    where: { email: "info@ovc.vn" }
  });

  if (!orgA || !admin) {
    throw new Error("Công ty A or Admin not found!");
  }

  const orgId = orgA.id;
  const adminId = admin.id;

  // Cleanup existing demo data to avoid unique constraint errors on rerun
  await db.quotation.deleteMany({ where: { number: "BG-A-2026-001" } });
  await db.contract.deleteMany({ where: { number: "HD-A-2026-001" } });
  await db.invoice.deleteMany({ where: { number: "HDDT-2026-001" } });
  await db.payment.deleteMany({ where: { reference: "PT-A-2026-001" } });
  await db.project.deleteMany({ where: { name: "Triển khai CRM cho Tập đoàn ABC" } });
  await db.deal.deleteMany({ where: { title: "Triển khai phần mềm CRM cho Tập đoàn ABC" } });
  await db.company.deleteMany({ where: { name: "Tập đoàn ABC" } });
  await db.contact.deleteMany({ where: { email: "khachhang@abc.com" } });

  // 1. Create Company & Contact (Customer)
  const customerCompany = await db.company.create({
    data: {
      organizationId: orgId,
      name: "Tập đoàn ABC",
      industry: "Công nghệ thông tin",
      website: "https://abc.com",
      address: "Tòa nhà X, Quận 1, TP.HCM"
    }
  });

  const customerContact = await db.contact.create({
    data: {
      organizationId: orgId,
      firstName: "Văn Khách Hàng",
      lastName: "Nguyễn",
      email: "khachhang@abc.com",
      phone: "0909123456",
      type: "CUSTOMER",
      companyId: customerCompany.id,
      assigneeId: adminId
    }
  });
  console.log("Customer created.");

  // 2. Create Deal
  const deal = await db.deal.create({
    data: {
      organizationId: orgId,
      title: "Triển khai phần mềm CRM cho Tập đoàn ABC",
      value: 150000000,
      currency: "VND",
      status: "WON",
      contactId: customerContact.id,
      assigneeId: adminId,
      closedAt: new Date()
    }
  });
  console.log("Deal created.");

  // 3. Create Quotation
  const quotation = await db.quotation.create({
    data: {
      organizationId: orgId,
      number: "BG-A-2026-001",
      title: "Báo giá Triển khai CRM",
      status: "ACCEPTED",
      contactId: customerContact.id,
      dealId: deal.id,
      creatorId: adminId,
      subtotal: 150000000,
      taxRate: 10,
      tax: 15000000,
      total: 165000000,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  
  await db.quotationItem.create({
    data: {
      quotationId: quotation.id,
      name: "Triển khai phần mềm CRM Core",
      quantity: 1,
      unitPrice: 150000000,
      total: 150000000
    }
  });
  console.log("Quotation created.");

  // 4. Create Contract & Installments
  const contract = await db.contract.create({
    data: {
      organizationId: orgId,
      number: "HD-A-2026-001",
      title: "Hợp đồng Cung cấp phần mềm CRM",
      status: "SIGNED",
      contactId: customerContact.id,
      dealId: deal.id,
      creatorId: adminId,
      total: 165000000,
      currency: "VND",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
    }
  });
  
  await db.contractItem.create({
    data: {
      contractId: contract.id,
      name: "Triển khai phần mềm CRM Core (Bao gồm VAT)",
      quantity: 1,
      unitPrice: 165000000,
      total: 165000000
    }
  });

  const installment1 = await db.paymentInstallment.create({
    data: {
      contractId: contract.id,
      name: "Thanh toán đợt 1 (50%)",
      amount: 82500000,
      dueDate: new Date(),
      status: "PAID"
    }
  });

  const installment2 = await db.paymentInstallment.create({
    data: {
      contractId: contract.id,
      name: "Thanh toán đợt 2 (50%)",
      amount: 82500000,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: "PENDING"
    }
  });
  console.log("Contract and Installments created.");

  // 5. Create Invoice & Payment for Installment 1
  const invoice = await db.invoice.create({
    data: {
      organizationId: orgId,
      number: "HDDT-2026-001",
      title: "Hóa đơn đợt 1 - Hợp đồng HD-A-2026-001",
      status: "PAID",
      contactId: customerContact.id,
      contractId: contract.id,
      creatorId: adminId,
      subtotal: 75000000,
      taxRate: 10,
      tax: 7500000,
      total: 82500000,
      amountDue: 0,
      amountPaid: 82500000,
      issuedAt: new Date(),
      dueDate: new Date()
    }
  });

  await db.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      name: "Triển khai phần mềm CRM Core (Đợt 1)",
      quantity: 1,
      unitPrice: 75000000,
      total: 75000000
    }
  });

  // Link Invoice to Installment
  await db.paymentInstallment.update({
    where: { id: installment1.id },
    data: { invoiceId: invoice.id }
  });

  await db.payment.create({
    data: {
      organizationId: orgId,
      reference: "PT-A-2026-001",
      amount: 82500000,
      currency: "VND",
      method: "BANK_TRANSFER",
      status: "COMPLETED",
      paidAt: new Date(),
      invoiceId: invoice.id
    }
  });
  console.log("Invoice and Payment created.");

  // 6. Create Project & Tasks
  const project = await db.project.create({
    data: {
      organizationId: orgId,
      name: "Triển khai CRM cho Tập đoàn ABC",
      status: "ACTIVE",
      priority: "HIGH",
      ownerId: adminId,
      contactId: customerContact.id,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  });

  await db.projectMember.create({
    data: {
      projectId: project.id,
      userId: adminId,
      role: "OWNER"
    }
  });

  const todoList = await db.taskList.create({
    data: { projectId: project.id, name: "Cần làm", order: 0 }
  });
  const doingList = await db.taskList.create({
    data: { projectId: project.id, name: "Đang làm", order: 1 }
  });
  const doneList = await db.taskList.create({
    data: { projectId: project.id, name: "Đã xong", order: 2 }
  });

  await db.task.create({
    data: {
      projectId: project.id,
      taskListId: doneList.id,
      title: "Ký hợp đồng & Thu tiền đợt 1",
      status: "DONE",
      creatorId: adminId,
      assigneeId: adminId
    }
  });

  await db.task.create({
    data: {
      projectId: project.id,
      taskListId: doingList.id,
      title: "Khảo sát nghiệp vụ doanh nghiệp",
      status: "IN_PROGRESS",
      creatorId: adminId,
      assigneeId: adminId
    }
  });

  await db.task.create({
    data: {
      projectId: project.id,
      taskListId: todoList.id,
      title: "Thiết kế luồng CRM tùy chỉnh",
      status: "TODO",
      creatorId: adminId
    }
  });

  console.log("Project and Tasks created.");
  console.log("Workflow Demo (Phase 2) Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
