import "dotenv/config";
import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/lib/db";

const email = "trungongvang@gmail.com";
const password = "Ongvang@2026";

async function findPortalOrganization(userId?: string) {
  if (userId) {
    const member = await db.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });

    if (member?.organization) return member.organization;
  }

  const organization = await db.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (!organization) throw new Error("No organization found");
  return organization;
}

async function upsertTask(input: {
  projectId: string;
  taskListId: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  assigneeId: string;
  creatorId: string;
  order: number;
}) {
  const existing = await db.task.findFirst({
    where: { projectId: input.projectId, title: input.title },
  });

  const data = {
    taskListId: input.taskListId,
    title: input.title,
    description: `${input.title} - dữ liệu mẫu cho Portal khách hàng.`,
    status: input.status,
    priority: input.priority,
    assigneeId: input.assigneeId,
    dueDate: new Date(input.dueDate),
    startDate: new Date("2026-06-18"),
    order: input.order,
    tags: ["portal"],
  };

  return existing
    ? db.task.update({ where: { id: existing.id }, data })
    : db.task.create({
        data: {
          ...data,
          projectId: input.projectId,
          creatorId: input.creatorId,
        },
      });
}

async function main() {
  const normalizedEmail = email.toLowerCase();
  const existingUsers = await db.user.findMany({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });

  if (existingUsers.length > 1) {
    throw new Error(`Email ${normalizedEmail} đang bị trùng user. Hãy gộp user trước khi seed Portal.`);
  }

  const organization = await findPortalOrganization(existingUsers[0]?.id);
  const admin =
    (await db.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        user: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"] } },
      },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }))?.user ||
    (await db.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"] } },
      orderBy: { createdAt: "asc" },
    })) ||
    (await db.user.findFirst({ orderBy: { createdAt: "asc" } }));

  if (!admin) throw new Error("No creator user found");

  const hashedPassword = await hashPassword(password);
  const user = existingUsers[0]
    ? await db.user.update({
        where: { id: existingUsers[0].id },
        data: {
          name: "Vàng Trung Ong",
          email: normalizedEmail,
          emailVerified: true,
          phone: "0918320331",
          role: "CUSTOMER",
          isActive: true,
          onboarded: true,
        },
      })
    : await db.user.create({
        data: {
          name: "Vàng Trung Ong",
          email: normalizedEmail,
          emailVerified: true,
          phone: "0918320331",
          role: "CUSTOMER",
          isActive: true,
          onboarded: true,
        },
      });

  await db.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
    update: { password: hashedPassword },
    create: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashedPassword,
    },
  });

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: user.id } },
    update: { role: "VIEWER", permissions: ["portal.customer"] },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: "VIEWER",
      permissions: ["portal.customer"],
    },
  });

  const existingCompany = await db.company.findFirst({
    where: { organizationId: organization.id, email: normalizedEmail, name: "TRUNG ONG VANG" },
  });
  const company = existingCompany
    ? await db.company.update({
        where: { id: existingCompany.id },
        data: {
          email: normalizedEmail,
          phone: "0918320331",
          industry: "Tourism & Digital Services",
          address: "Phan Thiết, Bình Thuận",
          city: "Phan Thiết",
          country: "Vietnam",
        },
      })
    : await db.company.create({
        data: {
          organizationId: organization.id,
          name: "TRUNG ONG VANG",
          email: normalizedEmail,
          phone: "0918320331",
          industry: "Tourism & Digital Services",
          address: "Phan Thiết, Bình Thuận",
          city: "Phan Thiết",
          country: "Vietnam",
          tags: ["portal", "customer"],
        },
      });

  const existingContact =
    (await db.contact.findFirst({
      where: { organizationId: organization.id, email: normalizedEmail, source: "portal-seed" },
    })) ||
    (await db.contact.findFirst({
      where: { organizationId: organization.id, email: normalizedEmail, companyId: company.id },
    }));

  const contact = existingContact
    ? await db.contact.update({
        where: { id: existingContact.id },
        data: {
          firstName: "Vàng Trung Ong",
          lastName: "",
          email: normalizedEmail,
          phone: "0918320331",
          mobile: "0918320331",
          type: "CUSTOMER",
          status: "ACTIVE",
          priority: "HIGH",
          source: "portal-seed",
          companyId: company.id,
          notes: "Tài khoản mẫu dành cho Portal khách hàng.",
        },
      })
    : await db.contact.create({
        data: {
          organizationId: organization.id,
          firstName: "Vàng Trung Ong",
          lastName: "",
          email: normalizedEmail,
          phone: "0918320331",
          mobile: "0918320331",
          type: "CUSTOMER",
          status: "ACTIVE",
          priority: "HIGH",
          source: "portal-seed",
          tags: ["VIP", "portal"],
          country: "Vietnam",
          city: "Phan Thiết",
          address: "Phan Thiết, Bình Thuận",
          companyId: company.id,
          notes: "Tài khoản mẫu dành cho Portal khách hàng.",
        },
      });

  const existingStage = await db.dealStage.findFirst({
    where: { organizationId: organization.id, name: "Đã ký / Đang triển khai" },
  });
  const stage = existingStage
    ? await db.dealStage.update({
        where: { id: existingStage.id },
        data: { probability: 90, color: "#10b981", order: 90 },
      })
    : await db.dealStage.create({
        data: {
          organizationId: organization.id,
          name: "Đã ký / Đang triển khai",
          color: "#10b981",
          order: 90,
          probability: 90,
          isDefault: false,
        },
      });

  const existingDeal = await db.deal.findFirst({
    where: { organizationId: organization.id, title: "Portal khách hàng - Website & Marketing", contactId: contact.id },
  });
  const deal = existingDeal
    ? await db.deal.update({
        where: { id: existingDeal.id },
        data: {
          value: 69300000,
          status: "WON",
          stageId: stage.id,
          contactId: contact.id,
          companyId: company.id,
          assigneeId: admin.id,
        },
      })
    : await db.deal.create({
        data: {
          organizationId: organization.id,
          title: "Portal khách hàng - Website & Marketing",
          value: 69300000,
          currency: "VND",
          status: "WON",
          priority: "HIGH",
          stageId: stage.id,
          contactId: contact.id,
          companyId: company.id,
          assigneeId: admin.id,
          closedAt: new Date("2026-06-20"),
          notes: "Deal mẫu để test portal khách hàng.",
        },
      });

  async function upsertProject(input: {
    name: string;
    description: string;
    status: "ACTIVE" | "PLANNING" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: string;
    budget: number;
    color: string;
    icon: string;
  }) {
    const existing = await db.project.findFirst({
      where: { organizationId: organization.id, contactId: contact.id, name: input.name },
    });

    const data = {
      name: input.name,
      description: input.description,
      status: input.status,
      priority: input.priority,
      ownerId: admin.id,
      contactId: contact.id,
      startDate: new Date("2026-06-18"),
      dueDate: new Date(input.dueDate),
      budget: input.budget,
      currency: "VND",
      color: input.color,
      icon: input.icon,
    };

    return existing
      ? db.project.update({ where: { id: existing.id }, data })
      : db.project.create({ data: { ...data, organizationId: organization.id } });
  }

  const projects = await Promise.all([
    upsertProject({
      name: "Website Ong Vàng Portal",
      description: "Thiết kế website, portal khách hàng, tích hợp luồng báo giá - hợp đồng - hóa đơn.",
      status: "ACTIVE",
      priority: "HIGH",
      dueDate: "2026-08-18",
      budget: 36300000,
      color: "#f59e0b",
      icon: "layout-dashboard",
    }),
    upsertProject({
      name: "Chiến dịch Digital Marketing",
      description: "Quản lý Fanpage, nội dung, quảng cáo và báo cáo hiệu quả hàng tháng.",
      status: "ACTIVE",
      priority: "MEDIUM",
      dueDate: "2026-09-26",
      budget: 33000000,
      color: "#2563eb",
      icon: "megaphone",
    }),
  ]);

  for (const project of projects) {
    await db.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      update: { role: "VIEWER" },
      create: { projectId: project.id, userId: user.id, role: "VIEWER" },
    });
  }

  async function upsertTaskList(projectId: string, name: string, color: string, order: number, isDefault = false) {
    const existing = await db.taskList.findFirst({ where: { projectId, name } });
    const data = { name, color, order, isDefault };
    return existing
      ? db.taskList.update({ where: { id: existing.id }, data })
      : db.taskList.create({ data: { ...data, projectId } });
  }

  const webLists = await Promise.all([
    upsertTaskList(projects[0].id, "Cần làm", "#94a3b8", 1, true),
    upsertTaskList(projects[0].id, "Đang thực hiện", "#f59e0b", 2),
    upsertTaskList(projects[0].id, "Hoàn thành", "#10b981", 3),
  ]);
  const marketingList = await upsertTaskList(projects[1].id, "Đang thực hiện", "#2563eb", 1, true);

  const taskData = [
    [projects[0].id, webLists[2].id, "Khảo sát yêu cầu Portal", "DONE", "HIGH", "2026-06-19"],
    [projects[0].id, webLists[1].id, "Thiết kế UI Dashboard khách hàng", "IN_PROGRESS", "HIGH", "2026-07-02"],
    [projects[0].id, webLists[1].id, "Nối dữ liệu báo giá, hợp đồng, hóa đơn", "IN_PROGRESS", "HIGH", "2026-07-06"],
    [projects[0].id, webLists[0].id, "Kiểm thử luồng ký và thanh toán", "TODO", "MEDIUM", "2026-07-12"],
    [projects[1].id, marketingList.id, "Lên kế hoạch nội dung Fanpage tháng 7", "IN_PROGRESS", "MEDIUM", "2026-07-05"],
    [projects[1].id, marketingList.id, "Báo cáo hiệu quả quảng cáo tuần 1", "TODO", "MEDIUM", "2026-07-10"],
  ] as const;

  for (const [index, item] of taskData.entries()) {
    const [projectId, taskListId, title, status, priority, dueDate] = item;
    await upsertTask({
      projectId,
      taskListId,
      title,
      status,
      priority,
      dueDate,
      assigneeId: user.id,
      creatorId: admin.id,
      order: index + 1,
    });
  }

  const quotationData = [
    { number: "BG-PORTAL-2601", title: "Báo giá Website Ong Vàng Portal", projectId: projects[0].id, subtotal: 33000000, tax: 3300000, total: 36300000, status: "ACCEPTED" as const, signedAt: new Date("2026-06-20") },
    { number: "BG-PORTAL-2602", title: "Báo giá Digital Marketing 3 tháng", projectId: projects[1].id, subtotal: 30000000, tax: 3000000, total: 33000000, status: "SENT" as const, signedAt: null },
    { number: "BG-PORTAL-2603", title: "Báo giá bảo trì & hosting", projectId: projects[0].id, subtotal: 6000000, tax: 600000, total: 6600000, status: "DRAFT" as const, signedAt: null },
  ];

  for (const item of quotationData) {
    await db.quotation.upsert({
      where: { organizationId_number: { organizationId: organization.id, number: item.number } },
      update: {
        title: item.title,
        status: item.status,
        contactId: contact.id,
        projectId: item.projectId,
        dealId: deal.id,
        subtotal: item.subtotal,
        tax: item.tax,
        taxRate: 10,
        total: item.total,
        signedAt: item.signedAt,
      },
      create: {
        organizationId: organization.id,
        number: item.number,
        title: item.title,
        status: item.status,
        contactId: contact.id,
        projectId: item.projectId,
        dealId: deal.id,
        creatorId: admin.id,
        currency: "VND",
        subtotal: item.subtotal,
        tax: item.tax,
        taxRate: 10,
        total: item.total,
        terms: "Hiệu lực báo giá 15 ngày. Thanh toán theo tiến độ triển khai.",
        notes: "Dữ liệu mẫu cho Portal khách hàng.",
        validUntil: new Date("2026-07-30"),
        sentAt: item.status === "DRAFT" ? null : new Date("2026-06-26"),
        acceptedAt: item.status === "ACCEPTED" ? new Date("2026-06-20") : null,
        signedAt: item.signedAt,
        token: randomUUID(),
        items: {
          create: [
            {
              name: item.title.replace("Báo giá ", ""),
              description: "Phân tích, thiết kế, triển khai và bàn giao theo phạm vi công việc đã thống nhất.",
              quantity: 1,
              unitPrice: item.subtotal,
              tax: item.tax,
              total: item.total,
              order: 1,
            },
          ],
        },
      },
    });
  }

  const contracts = [
    { number: "HDDV-PORTAL-2601", title: "Hợp đồng Website Ong Vàng Portal", total: 36300000, status: "SIGNED" as const },
    { number: "HDDV-PORTAL-2602", title: "Hợp đồng Digital Marketing", total: 33000000, status: "SENT" as const },
  ];

  for (const contract of contracts) {
    await db.contract.upsert({
      where: { organizationId_number: { organizationId: organization.id, number: contract.number } },
      update: {
        title: contract.title,
        status: contract.status,
        contactId: contact.id,
        dealId: deal.id,
        total: contract.total,
      },
      create: {
        organizationId: organization.id,
        number: contract.number,
        title: contract.title,
        status: contract.status,
        contactId: contact.id,
        dealId: deal.id,
        creatorId: admin.id,
        currency: "VND",
        total: contract.total,
        terms: "Hai bên phối hợp triển khai theo tiến độ dự án. Thanh toán theo hóa đơn/đợt thanh toán.",
        notes: "Hợp đồng mẫu cho Portal khách hàng.",
        validFrom: new Date("2026-06-26"),
        validUntil: new Date("2027-06-26"),
        sentAt: new Date("2026-06-26"),
        signedAt: contract.status === "SIGNED" ? new Date("2026-06-27") : null,
        token: randomUUID(),
        paymentChannels: [{ name: "Chuyển khoản ngân hàng", bank: "VCB", accountName: "CONG TY TNHH ONG VANG", accountNumber: "1020304050" }],
        items: {
          create: [
            {
              name: contract.title.replace("Hợp đồng ", ""),
              description: "Cung cấp dịch vụ theo hợp đồng đã thống nhất.",
              quantity: 1,
              unitPrice: Math.round(contract.total / 1.1),
              total: contract.total,
              order: 1,
            },
          ],
        },
      },
    });
  }

  const contractWeb = await db.contract.findFirstOrThrow({ where: { organizationId: organization.id, number: "HDDV-PORTAL-2601" } });
  const contractMarketing = await db.contract.findFirstOrThrow({ where: { organizationId: organization.id, number: "HDDV-PORTAL-2602" } });

  const invoices = [
    { number: "HD-PORTAL-2601", title: "Đợt 1 Website Portal", projectId: projects[0].id, contractId: contractWeb.id, total: 18150000, paid: 18150000, status: "PAID" as const, due: "2026-07-05" },
    { number: "HD-PORTAL-2602", title: "Đợt 2 Website Portal", projectId: projects[0].id, contractId: contractWeb.id, total: 18150000, paid: 6000000, status: "PARTIAL" as const, due: "2026-08-05" },
    { number: "HD-PORTAL-2603", title: "Digital Marketing tháng 1", projectId: projects[1].id, contractId: contractMarketing.id, total: 11000000, paid: 0, status: "SENT" as const, due: "2026-07-15" },
  ];

  for (const invoice of invoices) {
    await db.invoice.upsert({
      where: { organizationId_number: { organizationId: organization.id, number: invoice.number } },
      update: {
        title: invoice.title,
        status: invoice.status,
        contactId: contact.id,
        projectId: invoice.projectId,
        contractId: invoice.contractId,
        total: invoice.total,
        amountPaid: invoice.paid,
        amountDue: invoice.total - invoice.paid,
      },
      create: {
        organizationId: organization.id,
        number: invoice.number,
        title: invoice.title,
        status: invoice.status,
        contactId: contact.id,
        projectId: invoice.projectId,
        contractId: invoice.contractId,
        creatorId: admin.id,
        currency: "VND",
        subtotal: Math.round(invoice.total / 1.1),
        tax: invoice.total - Math.round(invoice.total / 1.1),
        taxRate: 10,
        total: invoice.total,
        amountPaid: invoice.paid,
        amountDue: invoice.total - invoice.paid,
        notes: "Hóa đơn mẫu cho Portal khách hàng.",
        terms: "Thanh toán chuyển khoản theo kênh thanh toán đã cấu hình.",
        dueDate: new Date(invoice.due),
        issuedAt: new Date("2026-06-28"),
        sentAt: new Date("2026-06-28"),
        paidAt: invoice.status === "PAID" ? new Date("2026-06-29") : null,
        token: randomUUID(),
        paymentChannels: [{ name: "Chuyển khoản ngân hàng", bank: "VCB", accountName: "CONG TY TNHH ONG VANG", accountNumber: "1020304050" }],
        items: {
          create: [
            {
              name: invoice.title,
              description: "Thanh toán theo tiến độ hợp đồng/dịch vụ.",
              quantity: 1,
              unitPrice: Math.round(invoice.total / 1.1),
              tax: invoice.total - Math.round(invoice.total / 1.1),
              total: invoice.total,
              order: 1,
            },
          ],
        },
      },
    });
  }

  const invoice1 = await db.invoice.findFirstOrThrow({ where: { organizationId: organization.id, number: "HD-PORTAL-2601" } });
  const invoice2 = await db.invoice.findFirstOrThrow({ where: { organizationId: organization.id, number: "HD-PORTAL-2602" } });

  const payments = [
    { invoiceId: invoice1.id, amount: 18150000, reference: "PT-PORTAL-2601", paidAt: "2026-06-29" },
    { invoiceId: invoice2.id, amount: 3000000, reference: "PT-PORTAL-2602", paidAt: "2026-07-01" },
    { invoiceId: invoice2.id, amount: 3000000, reference: "PT-PORTAL-2603", paidAt: "2026-07-10" },
  ];

  for (const payment of payments) {
    const existing = await db.payment.findFirst({
      where: { organizationId: organization.id, reference: payment.reference },
    });
    const data = {
      organizationId: organization.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      currency: "VND",
      method: "BANK_TRANSFER" as const,
      status: "COMPLETED" as const,
      reference: payment.reference,
      notes: "Phiếu thu mẫu cho Portal khách hàng.",
      paidAt: new Date(payment.paidAt),
    };

    if (existing) {
      await db.payment.update({ where: { id: existing.id }, data });
    } else {
      await db.payment.create({ data });
    }
  }

  const activityData = [
    { contactId: contact.id, type: "email", subject: "Cấp tài khoản Portal", description: "Đã cấp tài khoản Portal cho khách hàng." },
    { contactId: contact.id, type: "note", subject: "Seed dữ liệu Portal", description: "Đã bổ sung dữ liệu dự án, nhiệm vụ và tài chính." },
  ];

  for (const activity of activityData) {
    const existing = await db.contactActivity.findFirst({
      where: { contactId: contact.id, subject: activity.subject },
    });

    if (existing) {
      await db.contactActivity.update({ where: { id: existing.id }, data: activity });
    } else {
      await db.contactActivity.create({ data: activity });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    organization: organization.name,
    organizationId: organization.id,
    user: user.email,
    password,
    contactId: contact.id,
    projects: projects.length,
    tasks: taskData.length,
    quotations: quotationData.length,
    contracts: contracts.length,
    invoices: invoices.length,
    payments: payments.length,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
